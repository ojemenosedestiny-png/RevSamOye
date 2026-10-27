"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { MAX_UPLOAD_MB, UPLOAD_TYPES } from "@/lib/admin-types";
import type { MediaOverrides, SiteMedia, VideoSettings } from "@/lib/server/site-content";
import { api } from "./api";
import { Notice, PageHeader, Panel, Spinner, TableSkeleton, btnSmGold, btnSmLine } from "./ui";

type Kind = keyof typeof UPLOAD_TYPES;

const typeOf = (file: File) => file.type || (file.name.toLowerCase().endsWith(".vtt") ? "text/vtt" : "");

/** Uploads straight to Supabase Storage via a one-time signed URL, reporting progress. */
async function uploadFile(file: File, kind: Kind, onProgress: (p: number) => void): Promise<string> {
  const contentType = typeOf(file);
  if (!(UPLOAD_TYPES[kind] as readonly string[]).includes(contentType)) {
    throw new Error(
      kind === "image" ? "Please choose a JPG, PNG, WebP or AVIF image." : kind === "video" ? "Please choose an MP4 or WebM video." : "Please choose a .vtt captions file.",
    );
  }
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`That file is ${(file.size / 1048576).toFixed(0)} MB — the limit is ${MAX_UPLOAD_MB} MB. Please compress it first.`);

  const { uploadUrl, publicUrl } = await api<{ uploadUrl: string; publicUrl: string }>("/api/admin/media/upload-url", {
    method: "POST",
    body: { filename: file.name, contentType, size: file.size },
  });
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status < 300) return resolve();
      let detail = "";
      try {
        detail = JSON.parse(xhr.responseText).message ?? "";
      } catch {}
      const tooBig = xhr.status === 413 || /exceeded the maximum|too large/i.test(detail);
      reject(new Error(tooBig ? "The file is larger than your Supabase storage limit. Compress the video (HandBrake \"Web\" preset) or use a YouTube link." : `Upload failed (${xhr.status}${detail ? `: ${detail}` : ""}). Please try again.`));
    };
    xhr.onerror = () => reject(new Error("Upload failed — check your internet connection."));
    xhr.send(file);
  });
  return publicUrl;
}

async function imageWidth(file: File): Promise<number | null> {
  try {
    const bmp = await createImageBitmap(file);
    const w = bmp.width;
    bmp.close();
    return w;
  } catch {
    return null;
  }
}

export function MediaManager() {
  const [defaults, setDefaults] = useState<SiteMedia | null>(null);
  const [saved, setSaved] = useState<MediaOverrides>({});
  const [o, setO] = useState<MediaOverrides>({});
  const [dbReady, setDbReady] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    api<{ defaults: SiteMedia; overrides: MediaOverrides; dbReady: boolean }>("/api/admin/media")
      .then((d) => {
        setDefaults(d.defaults);
        setSaved(d.overrides);
        setO(d.overrides);
        setDbReady(d.dbReady);
      })
      .catch((err) => setMsg({ tone: "error", text: err.message }));
  }, []);

  const dirty = JSON.stringify(o) !== JSON.stringify(saved);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => dirty && e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setPhoto = (slot: "heroPortrait" | "aboutPortrait", patch: { src?: string; alt?: string }) =>
    setO((cur) => ({ ...cur, [slot]: { ...cur[slot], ...patch } }));
  const setVideo = (patch: Partial<VideoSettings>) => setO((cur) => ({ ...cur, video: { ...cur.video, ...patch } }));

  // A finished upload is saved straight away, so a new photo or video can't be lost by forgetting Save.
  const [autoSave, setAutoSave] = useState(0);
  const afterUpload = <T,>(apply: (url: string) => T) => (url: string) => {
    apply(url);
    setAutoSave((n) => n + 1);
  };
  useEffect(() => {
    if (autoSave) save(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSave]);

  const save = async (fromUpload = false) => {
    setBusy(true);
    setMsg(null);
    try {
      await api("/api/admin/media", { method: "PUT", body: o });
      setSaved(o);
      setMsg({
        tone: "success",
        text: fromUpload ? "Uploaded and saved — it's live on the website now." : "Saved — the website now shows your changes.",
      });
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Couldn't save." });
    } finally {
      setBusy(false);
    }
  };

  if (!defaults) return msg ? <Notice tone="error">{msg.text}</Notice> : <TableSkeleton rows={4} />;
  const v = { ...defaults.video, ...Object.fromEntries(Object.entries(o.video ?? {}).filter(([, val]) => val !== "" && val !== undefined)) } as VideoSettings;

  return (
    <>
      <PageHeader
        title="Photos & video"
        intro="Upload new pictures and the intro video — uploads go live on the website automatically. Press Save after editing text."
        actions={
          <>
            <a href="/" target="_blank" rel="noopener" className={btnSmLine}>
              View website
            </a>
            <button onClick={() => save()} className={btnSmGold} disabled={!dirty || busy || !dbReady}>
              {busy ? <Spinner /> : <Icon name="check" className="h-4 w-4" />} Save changes
            </button>
          </>
        }
      />

      <div className="mb-6 space-y-3">
        {!dbReady && <Notice tone="info">Uploads need the database and storage connected (Supabase). Until then, the site uses the photos in /public/images.</Notice>}
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        {dirty && !msg && <Notice tone="info">You have unsaved changes.</Notice>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PhotoSlot
          title="Main portrait"
          help="Top of the home page. Best: portrait shape (4:5), at least 1200 × 1500 px."
          src={o.heroPortrait?.src || defaults.heroPortrait.src}
          isCustom={Boolean(o.heroPortrait?.src)}
          alt={o.heroPortrait?.alt ?? ""}
          defaultAlt={defaults.heroPortrait.alt}
          disabled={!dbReady}
          onChange={(p) => setPhoto("heroPortrait", p)}
          onUploaded={afterUpload((url) => setPhoto("heroPortrait", { src: url }))}
        />
        <PhotoSlot
          title="About section photo"
          help="Beside the biography. Best: portrait shape (4:5), at least 1200 × 1500 px."
          src={o.aboutPortrait?.src || defaults.aboutPortrait.src}
          isCustom={Boolean(o.aboutPortrait?.src)}
          alt={o.aboutPortrait?.alt ?? ""}
          defaultAlt={defaults.aboutPortrait.alt}
          disabled={!dbReady}
          onChange={(p) => setPhoto("aboutPortrait", p)}
          onUploaded={afterUpload((url) => setPhoto("aboutPortrait", { src: url }))}
        />
      </div>

      <Panel className="mt-6 p-6">
        <h2 className="text-2xl">Intro video</h2>
        <p className="mt-1 text-sm text-muted">
          Plays muted as a preview in the Watch section, and with sound when visitors press play. MP4 (H.264) up to {MAX_UPLOAD_MB} MB — compress long videos first, or use a YouTube link instead.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-ivory/10 bg-ink">
              {v.src ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video key={v.src} src={v.src} poster={v.poster || undefined} controls preload="metadata" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted">No video yet</div>
              )}
            </div>
            <p className="mt-2 break-all text-xs text-muted">{v.src || "—"}</p>
            <div className="mt-3">
              <UploadButton kind="video" label="Upload video" disabled={!dbReady} onUploaded={afterUpload((url) => setVideo({ src: url }))} />
              {o.video?.src && (
                <button onClick={() => setVideo({ src: "" })} className="ml-3 text-sm text-muted underline-offset-4 hover:text-ivory hover:underline">
                  Restore default
                </button>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <Field label="Section label" hint="Small gold text above the title">
              <input className="field" value={o.video?.eyebrow ?? ""} placeholder={defaults.video.eyebrow} maxLength={40} onChange={(e) => setVideo({ eyebrow: e.target.value })} />
            </Field>
            <Field label="Title">
              <input className="field" value={o.video?.title ?? ""} placeholder={defaults.video.title} maxLength={140} onChange={(e) => setVideo({ title: e.target.value })} />
            </Field>
            <Field label="Short description">
              <textarea className="field min-h-[90px]" value={o.video?.description ?? ""} placeholder={defaults.video.description} maxLength={400} onChange={(e) => setVideo({ description: e.target.value })} />
            </Field>
          </div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-ivory/10 pt-6 lg:grid-cols-3">
          <div>
            <p className="label">Cover image (poster)</p>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-ivory/10 bg-ink">
              {v.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.poster} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted">None</div>
              )}
            </div>
            <div className="mt-3">
              <UploadButton kind="image" label="Upload cover" disabled={!dbReady} onUploaded={afterUpload((url) => setVideo({ poster: url }))} />
            </div>
          </div>

          <div>
            <p className="label">Captions (.vtt)</p>
            <p className="text-sm text-muted">Subtitles for viewers who are deaf or watching without sound.</p>
            <p className="mt-2 break-all text-xs text-muted">{v.captions || "None"}</p>
            <div className="mt-3">
              <UploadButton kind="captions" label="Upload captions" disabled={!dbReady} onUploaded={afterUpload((url) => setVideo({ captions: url }))} />
            </div>
          </div>

          <div className="space-y-4">
            <Field label="YouTube link (optional)" hint="Used if no video file is uploaded, or always if ticked below">
              <input className="field" type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=…" value={o.video?.youtubeUrl ?? ""} onChange={(e) => setVideo({ youtubeUrl: e.target.value.trim() })} />
            </Field>
            <label className="flex items-center gap-3 text-sm text-ivory/90">
              <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--c-gold))]" checked={o.video?.preferYouTube ?? defaults.video.preferYouTube} onChange={(e) => setVideo({ preferYouTube: e.target.checked })} />
              Always play the YouTube video instead of the file
            </label>
          </div>
        </div>
      </Panel>
    </>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">
        {label} {hint && <span className="block text-xs font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function PhotoSlot(props: {
  title: string;
  help: string;
  src: string;
  isCustom: boolean;
  alt: string;
  defaultAlt: string;
  disabled: boolean;
  onChange: (p: { src?: string; alt?: string }) => void;
  onUploaded: (url: string) => void;
}) {
  const { title, help, src, isCustom, alt, defaultAlt, disabled, onChange, onUploaded } = props;
  return (
    <Panel className="p-6">
      <h2 className="text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-muted">{help}</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-[160px_1fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-ivory/10 bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="h-full w-full object-cover" />
          <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${isCustom ? "bg-gold text-ink" : "bg-ink/80 text-muted"}`}>
            {isCustom ? "Uploaded" : "Default"}
          </span>
        </div>
        <div className="space-y-4">
          <UploadButton kind="image" label="Upload new photo" disabled={disabled} onUploaded={onUploaded} checkSize />
          {isCustom && (
            <button onClick={() => onChange({ src: "" })} className="block text-sm text-muted underline-offset-4 hover:text-ivory hover:underline">
              Restore default photo
            </button>
          )}
          <Field label="Description for screen readers" hint="Describe the photo in one sentence">
            <input className="field" value={alt} placeholder={defaultAlt} maxLength={300} onChange={(e) => onChange({ alt: e.target.value })} />
          </Field>
        </div>
      </div>
    </Panel>
  );
}

function UploadButton({ kind, label, disabled, onUploaded, checkSize }: { kind: Kind; label: string; disabled?: boolean; onUploaded: (url: string) => void; checkSize?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const accept = kind === "captions" ? ".vtt,text/vtt" : UPLOAD_TYPES[kind].join(",");

  const pick = async (file?: File) => {
    if (!file) return;
    setError("");
    setWarning("");
    if (checkSize && kind === "image") {
      const w = await imageWidth(file);
      if (w && w < 1000) setWarning(`This photo is only ${w}px wide, so it may look blurry on large screens. Use the original full-size photo if you can.`);
    }
    setProgress(0);
    try {
      onUploaded(await uploadFile(file, kind, setProgress));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <input ref={input} type="file" accept={accept} className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} aria-hidden="true" />
      <button type="button" className={btnSmLine} disabled={disabled || progress !== null} onClick={() => input.current?.click()}>
        {progress !== null ? <Spinner /> : <Icon name="download" className="h-4 w-4 rotate-180" />}
        {progress !== null ? `Uploading ${Math.round(progress * 100)}%` : label}
      </button>
      {progress !== null && (
        <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-ivory/10" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-gold transition-[width]" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
      {warning && <p className="mt-2 text-xs text-gold-bright">{warning}</p>}
      {error && (
        <p className="mt-2 text-xs text-[#F4ADA6]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

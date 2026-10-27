"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { VideoSettings } from "@/lib/server/site-content";
import { site } from "@/lib/content";
import { setScrollLocked } from "./Providers";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

const youTubeId = (url: string) => url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/)?.[1] ?? "";

const channelUrl = site.socials.find((s) => s.icon === "youtube")?.url ?? "https://www.youtube.com/@RevSamOye";

const videoType = (src: string) => (/\.webm($|\?)/i.test(src) ? "video/webm" : "video/mp4");

export function Watch({ video }: { video: VideoSettings }) {
  const frame = useRef<HTMLDivElement>(null);
  const inView = useInView(frame, { margin: "200px 0px" });
  const [mp4Ok, setMp4Ok] = useState(true);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  const ytId = youTubeId(video.youtubeUrl);
  const useYouTube = Boolean(ytId) && (video.preferYouTube || !mp4Ok);
  const canPlay = useYouTube || mp4Ok;

  return (
    <section id="watch" aria-labelledby="watch-title" className="relative py-24 md:py-36">
      <div className="absolute inset-x-0 top-0 hairline" />
      <div className="container">
        <SectionHeading id="watch-title" eyebrow={video.eyebrow} title={video.title} intro={video.description} align="center" />

        <Reveal standalone>
          <div
            ref={frame}
            className="group relative mx-auto aspect-video max-w-5xl overflow-hidden rounded-[2rem] border border-gold/20 bg-navy shadow-glow"
          >
            {/* Muted looping preview — loads only once near the viewport */}
            {!video.preferYouTube && mp4Ok && inView && (
              <video
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
                poster={video.poster || undefined}
                onCanPlay={() => setReady(true)}
                onError={() => setMp4Ok(false)}
                aria-hidden="true"
                tabIndex={-1}
              >
                <source src={video.src} type={videoType(video.src)} onError={() => setMp4Ok(false)} />
              </video>
            )}
            {useYouTube && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            {/* Poster shows while the preview loads, or instead of it */}
            {video.poster && !useYouTube && !ready && (
              <Image src={video.poster} alt="" fill sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover object-[50%_25%]" />
            )}
            {!video.poster && !ready && !useYouTube && mp4Ok && <div className="skeleton absolute inset-0" aria-hidden="true" />}

            <div className="absolute inset-0 bg-gradient-to-t from-overlay/90 via-overlay/20 to-overlay/30" />
            <div className="light-rays absolute inset-0 opacity-60" />

            {canPlay ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute inset-0 grid place-items-center"
                aria-label={`Play video: ${video.title}`}
              >
                <span className="relative grid h-24 w-24 place-items-center rounded-full bg-gold text-on-gold shadow-glow transition-transform duration-500 ease-out group-hover:scale-110 md:h-28 md:w-28">
                  <span className="pulse-ring absolute inset-0 rounded-full border border-gold" />
                  <Icon name="play" className="ml-1 h-9 w-9" />
                </span>
              </button>
            ) : (
              // No video uploaded yet: send visitors to the YouTube channel instead of a dead play button
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 grid place-items-center p-6 text-center"
                aria-label="Watch messages on YouTube"
              >
                <span className="flex flex-col items-center gap-4">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-gold text-on-gold shadow-glow transition-transform duration-500 ease-out group-hover:scale-110 md:h-24 md:w-24">
                    <Icon name="youtube" className="h-9 w-9" />
                  </span>
                  <span className="rounded-full bg-overlay/60 px-5 py-2 text-sm font-semibold text-white backdrop-blur">Watch messages on YouTube</span>
                </span>
              </a>
            )}

            <div className="pointer-events-none absolute bottom-0 left-0 p-6 md:p-10">
              <p className="eyebrow">Now playing</p>
              <p className="mt-3 font-serif text-2xl text-white md:text-3xl">{video.title}</p>
            </div>
          </div>
        </Reveal>
      </div>

      <VideoModal video={video} open={open} onClose={() => setOpen(false)} youTubeId={useYouTube ? ytId : ""} />
    </section>
  );
}

function VideoModal({ video, open, onClose, youTubeId }: { video: VideoSettings; open: boolean; onClose: () => void; youTubeId: string }) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    setScrollLocked(true);
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Keep focus inside the dialog
      if (e.key === "Tab") {
        e.preventDefault();
        closeBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      setScrollLocked(false);
      opener?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
          data-lenis-prevent
          className="fixed inset-0 z-[60] grid place-items-center bg-overlay/95 p-4 backdrop-blur-xl md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-overlay/60 text-white hover:border-gold md:right-8 md:top-8"
            aria-label="Close video"
          >
            <Icon name="close" />
          </button>
          <motion.div
            className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-2xl border border-gold/20 bg-black"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {youTubeId ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=1&rel=0&cc_load_policy=1`}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <video className="absolute inset-0 h-full w-full" controls autoPlay playsInline poster={video.poster || undefined}>
                <source src={video.src} type={videoType(video.src)} />
                {video.captions && <track kind="captions" src={video.captions} srcLang="en" label="English" default />}
                Your browser does not support HTML5 video.
              </video>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  COUNSELING_MODES,
  COUNSELING_TYPES,
  fieldErrors,
  stepOneSchema,
  stepThreeSchema,
  stepTwoSchema,
} from "@/lib/validation";
import { Icon } from "./ui/Icon";
import { MagneticButton } from "./ui/MagneticButton";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";
import { Turnstile } from "./ui/Turnstile";

const STEPS = ["Your details", "Your session", "Confirm"] as const;
const DIAL_CODES = [
  ["+234", "NG", "Nigeria"],
  ["+233", "GH", "Ghana"],
  ["+254", "KE", "Kenya"],
  ["+27", "ZA", "South Africa"],
  ["+44", "UK", "United Kingdom"],
  ["+1", "US", "USA / Canada"],
  ["+353", "IE", "Ireland"],
  ["+49", "DE", "Germany"],
  ["+971", "AE", "UAE"],
  ["+61", "AU", "Australia"],
] as const;

type Form = {
  fullName: string;
  email: string;
  phoneCode: string;
  phone: string;
  country: string;
  city: string;
  type: string;
  mode: string;
  preferredDate: string;
  preferredTime: string;
  description: string;
  consent: boolean;
  website: string;
};

const initial: Form = {
  fullName: "",
  email: "",
  phoneCode: "+234",
  phone: "",
  country: "Nigeria",
  city: "",
  type: "",
  mode: "",
  preferredDate: "",
  preferredTime: "",
  description: "",
  consent: false,
  website: "",
};

const schemas = [stepOneSchema, stepTwoSchema, stepThreeSchema];
const todayISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

export function Counseling() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [token, setToken] = useState("");
  const [minDate, setMinDate] = useState("");
  const startedAt = useRef(0);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    setMinDate(todayISO());
  }, []);

  const set = (key: keyof Form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  const validate = (i: number) => {
    const result = schemas[i].safeParse(form);
    if (result.success) return true;
    const errs = fieldErrors(result.error);
    setErrors(errs);
    // Focus the first invalid field
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus());
    return false;
  };

  const go = (to: number) => {
    if (to > step && !validate(step)) return;
    setDir(to > step ? 1 : -1);
    setErrors({});
    setStep(to);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) return go(step + 1);
    if (!validate(2)) return;
    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, startedAt: startedAt.current, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          const first = Object.keys(data.errors)[0];
          const back = [stepOneSchema, stepTwoSchema].findIndex((s) => first in s.shape);
          if (back >= 0) setStep(back);
        }
        throw new Error(data.message || "Something went wrong. Please try again.");
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <section id="counseling" aria-labelledby="counseling-title" className="relative py-24 md:py-36">
      <div className="absolute inset-x-0 top-0 hairline" />
      <div className="absolute left-0 top-1/3 -z-10 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />
      <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            id="counseling-title"
            eyebrow="Book Counseling"
            title={
              <>
                A safe place to <em className="text-gold-gradient">be heard</em>
              </>
            }
            intro="Request a personal counseling session on marriage, relationships, purpose, family or your spiritual walk. Every request is treated with complete confidentiality."
          />
          <Reveal standalone>
            <ul className="space-y-4 text-muted">
              {[
                ["lock", "Confidential — only the counseling team sees your request"],
                ["calendar", "We'll contact you to confirm a time"],
                ["globe", "In person in Abuja, by phone, or by video call"],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 text-gold">
                    <Icon name={icon as "lock"} className="h-4 w-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal standalone className="lg:col-span-7">
          <div className="card p-6 sm:p-8 md:p-10" ref={panel}>
            <AnimatePresence mode="wait">
              {status === "done" ? (
                <Success key="done" name={form.fullName.split(" ")[0]} />
              ) : (
                <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, scale: 0.97 }} aria-describedby="form-progress">
                  <Progress step={step} />

                  {/* Honeypot: hidden from people, tempting to bots */}
                  <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
                    <label>
                      Website
                      <input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
                    </label>
                  </div>

                  <div className="relative mt-8 min-h-[420px]">
                    <AnimatePresence mode="wait" custom={dir} initial={false}>
                      <motion.fieldset
                        key={step}
                        custom={dir}
                        initial={{ opacity: 0, x: dir * 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: dir * -40 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="grid gap-5 sm:grid-cols-2"
                      >
                        <legend className="sr-only">{STEPS[step]}</legend>

                        {step === 0 && (
                          <>
                            <Field label="Full name" name="fullName" error={errors.fullName} wide>
                              <input className="field" id="fullName" name="fullName" autoComplete="name" value={form.fullName} onChange={set("fullName")} />
                            </Field>
                            <Field label="Email" name="email" error={errors.email}>
                              <input className="field" id="email" name="email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set("email")} />
                            </Field>
                            <Field label="Phone" name="phone" error={errors.phone || errors.phoneCode}>
                              <div className="flex gap-2">
                                <select
                                  className="field w-[7.75rem] shrink-0 px-3"
                                  name="phoneCode"
                                  aria-label="Country code"
                                  value={form.phoneCode}
                                  onChange={set("phoneCode")}
                                >
                                  {DIAL_CODES.map(([code, iso, country]) => (
                                    <option key={code} value={code} aria-label={`${country} ${code}`}>
                                      {iso} {code}
                                    </option>
                                  ))}
                                </select>
                                <input className="field" id="phone" name="phone" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="801 234 5678" value={form.phone} onChange={set("phone")} />
                              </div>
                            </Field>
                            <Field label="Country" name="country" error={errors.country}>
                              <input className="field" id="country" name="country" autoComplete="country-name" value={form.country} onChange={set("country")} />
                            </Field>
                            <Field label="City" name="city" error={errors.city}>
                              <input className="field" id="city" name="city" autoComplete="address-level2" value={form.city} onChange={set("city")} />
                            </Field>
                          </>
                        )}

                        {step === 1 && (
                          <>
                            <ChoiceGroup label="Counseling type" name="type" options={COUNSELING_TYPES} value={form.type} onChange={set("type")} error={errors.type} />
                            <ChoiceGroup label="Preferred mode" name="mode" options={COUNSELING_MODES} value={form.mode} onChange={set("mode")} error={errors.mode} />
                            <Field label="Preferred date" name="preferredDate" error={errors.preferredDate}>
                              <input className="field [color-scheme:dark]" id="preferredDate" name="preferredDate" type="date" min={minDate} value={form.preferredDate} onChange={set("preferredDate")} />
                            </Field>
                            <Field label="Preferred time (WAT)" name="preferredTime" error={errors.preferredTime}>
                              <input className="field [color-scheme:dark]" id="preferredTime" name="preferredTime" type="time" value={form.preferredTime} onChange={set("preferredTime")} />
                            </Field>
                            <Field label="How can we help?" name="description" error={errors.description} wide hint={`${form.description.length}/1500`}>
                              <textarea
                                className="field min-h-[130px] resize-y"
                                id="description"
                                name="description"
                                maxLength={1500}
                                placeholder="Share as much or as little as you're comfortable with."
                                value={form.description}
                                onChange={set("description")}
                              />
                            </Field>
                          </>
                        )}

                        {step === 2 && (
                          <div className="space-y-6 sm:col-span-2">
                            <dl className="grid gap-x-6 gap-y-3 rounded-2xl border border-ivory/10 bg-ink/40 p-5 text-sm sm:grid-cols-2">
                              {[
                                ["Name", form.fullName],
                                ["Email", form.email],
                                ["Phone", `${form.phoneCode} ${form.phone}`],
                                ["Location", `${form.city}, ${form.country}`],
                                ["Type", form.type],
                                ["Mode", form.mode],
                                ["Preferred", `${form.preferredDate} · ${form.preferredTime} WAT`],
                              ].map(([k, v]) => (
                                <div key={k}>
                                  <dt className="text-muted">{k}</dt>
                                  <dd className="mt-0.5 break-words text-ivory">{v}</dd>
                                </div>
                              ))}
                            </dl>

                            <div>
                              <label className="flex cursor-pointer gap-3 text-[0.95rem] leading-relaxed text-ivory/90">
                                <input
                                  type="checkbox"
                                  name="consent"
                                  checked={form.consent}
                                  onChange={set("consent")}
                                  aria-invalid={Boolean(errors.consent)}
                                  aria-describedby={errors.consent ? "consent-error" : "privacy-note"}
                                  className="mt-1 h-5 w-5 shrink-0 accent-[rgb(var(--c-gold))]"
                                />
                                I agree that the ministry may store and use these details to arrange my counseling session.
                              </label>
                              <p id="privacy-note" className="mt-3 pl-8 text-sm text-muted">
                                Privacy notice: your information is kept strictly confidential, seen only by the counseling team, never shared or sold, and deleted on request.{" "}
                                <a href="/privacy" target="_blank" className="text-gold underline-offset-4 hover:underline">
                                  Read the privacy policy
                                </a>
                              </p>
                              {errors.consent && (
                                <p id="consent-error" className="field-error pl-8" role="alert">
                                  {errors.consent}
                                </p>
                              )}
                            </div>

                            <Turnstile onToken={setToken} />

                            {status === "error" && (
                              <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
                                {serverError}
                              </p>
                            )}
                          </div>
                        )}
                      </motion.fieldset>
                    </AnimatePresence>
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-ivory/10 pt-6">
                    {step > 0 ? (
                      <button type="button" onClick={() => go(step - 1)} className="btn-ghost">
                        <Icon name="arrowLeft" className="h-4 w-4" />
                        Back
                      </button>
                    ) : (
                      <span />
                    )}
                    <MagneticButton type="submit" disabled={status === "sending"}>
                      {status === "sending" ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden="true" />
                          Sending…
                        </>
                      ) : step < 2 ? (
                        <>
                          Continue
                          <Icon name="arrowRight" className="h-4 w-4" />
                        </>
                      ) : (
                        "Submit request"
                      )}
                    </MagneticButton>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div id="form-progress">
      <p className="sr-only" aria-live="polite">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>
      <ol className="flex items-center gap-3" aria-hidden="true">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 flex-col gap-2">
            <span className="relative h-1 overflow-hidden rounded-full bg-ivory/10">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-gold"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
            <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${i <= step ? "text-gold" : "text-muted/70"}`}>
              <span className="hidden sm:inline">0{i + 1} · </span>
              {label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Field({ label, name, error, wide, hint, children }: { label: string; name: string; error?: string; wide?: boolean; hint?: string; children: ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={name} className="label">
          {label}
        </label>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      <div className={error ? "[&_.field]:!border-danger/70" : ""}>{children}</div>
      {error && (
        <p className="field-error" role="alert" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function ChoiceGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <fieldset className="sm:col-span-2">
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt) => (
          <label
            key={opt}
            className={`cursor-pointer rounded-full border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold-bright ${
              value === opt ? "border-gold bg-gold/15 text-gold-bright" : "border-ivory/15 text-ivory/85 hover:border-ivory/35"
            }`}
          >
            <input type="radio" name={name} value={opt} checked={value === opt} onChange={onChange} className="sr-only" />
            {opt}
          </label>
        ))}
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function Success({ name }: { name: string }) {
  return (
    <motion.div
      className="flex min-h-[480px] flex-col items-center justify-center text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      role="status"
    >
      <div className="relative">
        <span className="pulse-ring absolute inset-0 rounded-full border border-gold" />
        <svg viewBox="0 0 80 80" className="h-24 w-24" aria-hidden="true">
          <motion.circle cx="40" cy="40" r="36" fill="none" stroke="rgb(var(--c-gold))" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: "easeInOut" }} />
          <motion.path d="M25 41l10 10 20-22" fill="none" stroke="rgb(var(--c-gold-bright))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }} />
        </svg>
      </div>
      <h3 className="mt-8 text-4xl">Thank you{name ? `, ${name}` : ""}</h3>
      <p className="mt-4 max-w-md leading-relaxed text-muted">
        Your request has been received and will be treated with complete confidentiality. A confirmation is on its way to your inbox, and our team will be in touch to arrange your session.
      </p>
      <p className="mt-8 font-script text-4xl text-gold-gradient">Grace and peace</p>
    </motion.div>
  );
}

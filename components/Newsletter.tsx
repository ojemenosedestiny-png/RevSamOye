"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { site } from "@/lib/content";
import { newsletterSchema } from "@/lib/validation";
import { Icon } from "./ui/Icon";
import { MagneticButton } from "./ui/MagneticButton";
import { Reveal, RevealGroup } from "./ui/Reveal";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const check = newsletterSchema.safeParse({ email, website });
    if (!check.success) {
      setStatus("error");
      setMessage(check.error.issues[0].message);
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not subscribe right now. Please try again.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not subscribe right now.");
    }
  };

  return (
    <section aria-labelledby="newsletter-title" className="relative py-20 md:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-card border border-gold/25 bg-gradient-to-br from-navy-2/80 via-navy to-ink px-6 py-14 text-center sm:px-12 md:py-20">
          <div className="light-rays absolute inset-0 opacity-70" aria-hidden="true" />
          <RevealGroup className="relative mx-auto max-w-2xl">
            <Reveal>
              <Icon name="mail" className="mx-auto h-10 w-10 text-gold" />
            </Reveal>
            <Reveal>
              <h2 id="newsletter-title" className="mt-6 text-display-md">
                {site.newsletter.title}
              </h2>
            </Reveal>
            <Reveal>
              <p className="mx-auto mt-4 max-w-prose text-muted">{site.newsletter.copy}</p>
            </Reveal>
            <Reveal className="mt-8">
              <AnimatePresence mode="wait">
                {status === "done" ? (
                  <motion.p
                    key="done"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-3 rounded-full border border-gold/40 bg-gold/10 px-6 py-3 text-gold-bright"
                    role="status"
                  >
                    <Icon name="check" className="h-5 w-5" />
                    You're subscribed — thank you!
                  </motion.p>
                ) : (
                  <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }} className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row">
                    <label htmlFor="nl-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="nl-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      className="field flex-1 rounded-full px-6"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      aria-invalid={status === "error"}
                      aria-describedby={status === "error" ? "nl-error" : undefined}
                    />
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    <MagneticButton type="submit" disabled={status === "sending"}>
                      {status === "sending" ? "Subscribing…" : "Subscribe"}
                    </MagneticButton>
                  </motion.form>
                )}
              </AnimatePresence>
              {status === "error" && (
                <p id="nl-error" className="field-error mt-3" role="alert">
                  {message}
                </p>
              )}
            </Reveal>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

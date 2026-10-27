"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { Notice, Spinner } from "./ui";

export function LoginForm() {
  const next = useSearchParams().get("next");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Sign in failed.");
      // Only follow same-site admin paths
      window.location.href = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-5 p-7 sm:p-9">
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            autoFocus
            className="field pr-24"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-semibold text-gold hover:text-gold-bright"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <button type="submit" className="btn-primary w-full" disabled={busy || !password}>
        {busy ? <Spinner /> : <Icon name="lock" className="h-4 w-4" />}
        Sign in
      </button>
      <p className="text-center text-xs text-muted">Sessions last 12 hours. Five failed attempts locks sign-in for 15 minutes.</p>
    </form>
  );
}

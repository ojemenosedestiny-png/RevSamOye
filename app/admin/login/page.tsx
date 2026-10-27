import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main id="main" className="grain relative grid min-h-[100svh] place-items-center overflow-hidden px-5 py-16">
      <div className="light-rays absolute inset-0 -z-10" />
      <div className="absolute left-1/2 top-1/4 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/50 font-serif text-2xl italic text-gold-bright">SO</span>
          <h1 className="mt-5 text-4xl">Admin panel</h1>
          <p className="mt-2 text-muted">Rev. Dr. Sam Oye · website management</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

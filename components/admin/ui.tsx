import type { ReactNode } from "react";

export function PageHeader({ title, intro, actions }: { title: string; intro?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-ivory/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-muted">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-ivory/10 bg-navy/60 ${className}`}>{children}</div>;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: ReactNode }) {
  const styles = {
    info: "border-gold/30 bg-gold/10 text-gold-bright",
    error: "border-[#F4ADA6]/40 bg-[#F4ADA6]/10 text-[#F4ADA6]",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  }[tone];
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}

export function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-ivory/15 px-6 py-14 text-center">
      <p className="font-serif text-2xl text-ivory">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-muted">{children}</div>}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading" role="status">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-14 rounded-xl" />
      ))}
    </div>
  );
}

/** Small-button variants used across the panel. */
export const btnSm = "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-50";
export const btnSmGold = `${btnSm} bg-gold text-ink hover:bg-gold-bright`;
export const btnSmLine = `${btnSm} border border-ivory/20 text-ivory hover:border-gold hover:text-gold-bright`;
export const btnSmDanger = `${btnSm} border border-[#F4ADA6]/40 text-[#F4ADA6] hover:bg-[#F4ADA6]/10`;

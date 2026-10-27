import Image from "next/image";
import { site } from "@/lib/content";

/** Official Apple / Google badges (public/badges). Keep the artwork unmodified per store guidelines. */
export function StoreBadges({ size = "md" }: { size?: "sm" | "md" }) {
  const h = size === "sm" ? 40 : 52;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a href={site.app.appStore} target="_blank" rel="noopener noreferrer" className="inline-block transition-transform hover:-translate-y-0.5">
        <Image src="/badges/app-store.svg" alt="Download on the App Store" width={Math.round(h * 2.99)} height={h} style={{ height: h, width: "auto" }} />
      </a>
      {/* The Google badge includes its own transparent padding, so it is drawn larger to match. */}
      <a href={site.app.googlePlay} target="_blank" rel="noopener noreferrer" className="-my-[0.6em] inline-block transition-transform hover:-translate-y-0.5">
        <Image src="/badges/google-play.png" alt="Get it on Google Play" width={Math.round(h * 1.5 * 2.584)} height={Math.round(h * 1.5)} style={{ height: h * 1.5, width: "auto" }} />
      </a>
    </div>
  );
}

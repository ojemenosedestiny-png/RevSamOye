import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { bio, site } from "@/lib/content";

export const alt = `${site.name} — Raising Transformed Lives for Global Impact`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const portrait = await readFile(path.join(process.cwd(), "public", bio.heroPortrait.src));
  const mime = bio.heroPortrait.src.endsWith(".png") ? "image/png" : "image/jpeg";
  const src = `data:${mime};base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg, #162242 0%, #060914 65%)", color: "#F6F0E4" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px" }}>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#C9A55A", textTransform: "uppercase" }}>The Transforming Church · Abuja</div>
          <div style={{ fontSize: 72, lineHeight: 1.05, marginTop: 28, fontFamily: "serif" }}>Raising Transformed Lives for Global Impact</div>
          <div style={{ width: 160, height: 4, background: "#C9A55A", marginTop: 32, borderRadius: 4 }} />
          <div style={{ fontSize: 34, marginTop: 28, color: "#E8CC8C" }}>{site.name}</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={420} height={630} style={{ objectFit: "cover", borderLeft: "4px solid #C9A55A" }} alt="" />
      </div>
    ),
    size,
  );
}

import QRCode from "qrcode";
import { site } from "@/lib/content";
import { PhoneMockup } from "./PhoneMockup";
import { Icon } from "./ui/Icon";
import { Reveal, RevealGroup } from "./ui/Reveal";
import { StoreBadges } from "./ui/StoreBadges";

const qr = (url: string) =>
  QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#060914", light: "#00000000" } });

// Server component: QR codes are generated at build time, so no client JS is needed for them.
export async function AppDownload() {
  const [iosQr, androidQr] = await Promise.all([qr(site.app.appStore), qr(site.app.googlePlay)]);
  const { app } = site;
  const [title, subtitle] = app.headline.split(" — ");

  return (
    <section id="app" aria-labelledby="app-title" className="relative overflow-hidden py-24 md:py-36">
      <div className="absolute inset-x-0 top-0 hairline" />
      <div className="container">
        <div className="card relative grid items-center gap-12 overflow-visible px-6 py-14 sm:px-10 lg:grid-cols-2 lg:gap-6 lg:px-16 lg:py-20">
          <div className="absolute inset-0 -z-10 rounded-card bg-[radial-gradient(70%_90%_at_85%_40%,rgb(var(--c-gold)/0.16),transparent)]" />

          <RevealGroup>
            <Reveal>
              <p className="eyebrow">Download the App</p>
            </Reveal>
            <Reveal>
              <h2 id="app-title" className="mt-5 text-display-lg">
                {title}
                {subtitle && <span className="mt-2 block italic text-gold-gradient">{subtitle}</span>}
              </h2>
            </Reveal>
            <Reveal>
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted">{app.copy}</p>
            </Reveal>
            <Reveal>
              <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-ivory/90 sm:grid-cols-3">
                {app.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Icon name="check" className="h-4 w-4 text-gold" />
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal className="mt-10">
              <StoreBadges />
            </Reveal>
            <Reveal className="mt-10 hidden gap-5 md:flex">
              {[
                ["App Store", iosQr],
                ["Google Play", androidQr],
              ].map(([label, svg]) => (
                <figure key={label} className="flex items-center gap-4 rounded-2xl border border-ivory/10 bg-ink/40 p-3 pr-5">
                  <div
                    className="h-24 w-24 rounded-xl bg-white p-2.5 [&_svg]:h-full [&_svg]:w-full"
                    role="img"
                    aria-label={`QR code to download Sam Oye Global on ${label}`}
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                  <figcaption className="text-sm leading-snug text-muted">
                    Scan for
                    <br />
                    <span className="font-semibold text-ivory">{label}</span>
                  </figcaption>
                </figure>
              ))}
            </Reveal>
          </RevealGroup>

          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

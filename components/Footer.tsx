import { site } from "@/lib/content";
import { Icon, type IconName } from "./ui/Icon";
import { PlaceholderTag } from "./ui/SectionHeading";
import { StoreBadges } from "./ui/StoreBadges";

export function Footer() {
  const year = new Date().getFullYear();
  const { contact } = site;
  const pending = (field: string) => (contact.placeholderFields as string[]).includes(field);

  return (
    <footer className="relative border-t border-ivory/10 pt-20" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Footer
      </h2>
      <div className="container grid gap-12 pb-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 font-serif text-lg italic text-gold-bright">SO</span>
            <span className="font-serif text-2xl text-ivory">{site.name}</span>
          </a>
          <p className="mt-5 max-w-xs leading-relaxed text-muted">{site.tagline}</p>
          <ul className="mt-6 flex gap-3">
            {site.socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target={s.url.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={`${s.name}${"placeholder" in s && s.placeholder ? " (link coming soon)" : ""}`}
                  className="grid h-11 w-11 place-items-center rounded-full border border-ivory/15 text-ivory/80 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon name={s.icon as IconName} className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="lg:col-span-2" aria-label="Footer">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Explore</p>
          <ul className="mt-5 space-y-3">
            {site.nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="text-muted transition-colors hover:text-ivory">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Contact</p>
          <address className="mt-5 space-y-4 not-italic text-muted">
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-ivory">
              <Icon name="mail" className="h-4 w-4 shrink-0 text-gold" />
              {contact.email}
            </a>
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-ivory">
              <Icon name="phone" className="h-4 w-4 shrink-0 text-gold" />
              {contact.phone}
              {pending("phone") && <PlaceholderTag />}
            </a>
            <p className="flex gap-3">
              <Icon name="pin" className="mt-1 h-4 w-4 shrink-0 text-gold" />
              <span>
                {contact.address} {pending("address") && <PlaceholderTag />}
              </span>
            </p>
          </address>
        </div>

        <div className="lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Get the app</p>
          <p className="mt-5 text-muted">{site.app.name}</p>
          <div className="mt-4">
            <StoreBadges size="sm" />
          </div>
        </div>
      </div>

      <div className="hairline" />
      <div className="container flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted sm:flex-row">
        <p>
          © {year} {site.name}. All rights reserved.
        </p>
        <a href="/privacy" className="hover:text-gold">
          Privacy Policy
        </a>
        <a href="#top" className="inline-flex items-center gap-2 hover:text-gold">
          Back to top
          <Icon name="arrowDown" className="h-4 w-4 rotate-180" />
        </a>
      </div>
    </footer>
  );
}

import { bio, site, siteUrl, type EventItem } from "@/lib/content";

/** Structured data: Person, Organization (church) and upcoming Events. */
export function JsonLd({ events }: { events: EventItem[] }) {
  const sameAs = site.socials.map((s) => s.url).filter((u) => u.startsWith("http"));
  const church = {
    "@type": "Church",
    "@id": `${siteUrl}/#church`,
    name: "The Transforming Church",
    address: { "@type": "PostalAddress", addressLocality: "Abuja", addressCountry: "NG" },
  };

  const graph = [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: bio.name,
      jobTitle: "Founder & Lead Pastor",
      worksFor: { "@id": `${siteUrl}/#church` },
      image: `${siteUrl}${bio.heroPortrait.src}`,
      url: siteUrl,
      description: site.description,
      award: "Outstanding Pastor of the Year, CLIMA Africa Awards 2024",
      sameAs,
    },
    { ...church, founder: { "@id": `${siteUrl}/#person` }, url: siteUrl },
    ...events
      .filter((e) => !e.placeholder)
      .map((e) => ({
        "@type": "Event",
        name: e.title,
        startDate: e.start,
        endDate: e.end,
        description: e.description,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: e.online
          ? e.venue
            ? "https://schema.org/MixedEventAttendanceMode"
            : "https://schema.org/OnlineEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
        location: [
          ...(e.venue ? [{ "@type": "Place", name: e.venue, address: { "@type": "PostalAddress", addressLocality: "Abuja", addressCountry: "NG" } }] : []),
          ...(e.online ? [{ "@type": "VirtualLocation", url: e.registerUrl?.startsWith("http") ? e.registerUrl : siteUrl }] : []),
        ],
        performer: e.speakers.map((name) => ({ "@type": "Person", name })),
        organizer: { "@id": `${siteUrl}/#church` },
      })),
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }}
    />
  );
}

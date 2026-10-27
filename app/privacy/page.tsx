import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { PlaceholderTag } from "@/components/ui/SectionHeading";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name}'s website collects, uses and protects your personal information.`,
  alternates: { canonical: "/privacy" },
};

// DRAFT — have this reviewed against the Nigeria Data Protection Act 2023 before launch.
const sections: [string, string[]][] = [
  [
    "What we collect",
    [
      "When you book counseling: your name, email address, phone number, country and city, the type of counseling, your preferred mode, date and time, and what you choose to share about your situation.",
      "When you subscribe to updates: your email address.",
      "We do not use advertising trackers on this website.",
    ],
  ],
  [
    "How we use it",
    [
      "Counseling details are used only to arrange and provide your counseling session, and to contact you about it.",
      "Your email address for updates is used only to send messages, teachings and event announcements. Every email includes a way to unsubscribe.",
    ],
  ],
  [
    "Confidentiality",
    [
      "Counseling requests are confidential. They are seen only by the ministry's counseling team, are never sold or shared with third parties for marketing, and are stored with access restricted to authorised staff.",
    ],
  ],
  [
    "Where it is stored",
    [
      "Information is stored securely with our service providers (database hosting and email delivery), who process it only on our instructions.",
    ],
  ],
  [
    "How long we keep it",
    ["We keep counseling requests only as long as needed to provide care, and newsletter addresses until you unsubscribe."],
  ],
  [
    "Your rights",
    [
      `You can ask to see, correct or delete the information we hold about you at any time by emailing ${site.contact.email}.`,
    ],
  ],
];

export default function PrivacyPage() {
  return (
    <main id="main" className="container max-w-3xl py-20 md:py-28">
      <Link href="/" className="btn-ghost">
        <Icon name="arrowLeft" className="h-4 w-4" /> Back to home
      </Link>
      <p className="eyebrow mt-10">Privacy</p>
      <h1 className="mt-5 text-display-lg">Privacy Policy</h1>
      <p className="mt-4">
        <PlaceholderTag>Draft — to be reviewed before launch</PlaceholderTag>
      </p>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        {site.name} and The Transforming Church respect your privacy. This policy explains what we collect through this website and how we look after it.
      </p>
      <div className="mt-12 space-y-10">
        {sections.map(([heading, paras]) => (
          <section key={heading}>
            <h2 className="text-3xl">{heading}</h2>
            {paras.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </section>
        ))}
        <section>
          <h2 className="text-3xl">Contact</h2>
          <p className="mt-3 leading-relaxed text-muted">
            Questions about this policy:{" "}
            <a className="text-gold hover:text-gold-bright" href={`mailto:${site.contact.email}`}>
              {site.contact.email}
            </a>{" "}
            · {site.contact.phone}
          </p>
        </section>
      </div>
    </main>
  );
}

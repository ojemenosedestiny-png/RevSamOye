import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookLibrary } from "@/components/books/BookLibrary";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Icon } from "@/components/ui/Icon";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { bio, bookList, books, site, siteUrl } from "@/lib/content";

export const metadata: Metadata = {
  title: "Books",
  description: `E-books by ${site.name} on marriage, relationships, singlehood, leadership, ministry and personal growth — available from the official stores.`,
  alternates: { canonical: "/books" },
  openGraph: { title: `Books by ${site.name}`, url: "/books", images: [{ url: bookList[0].cover, width: 900, height: 900 }] },
};

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function BooksPage() {
  const featured = bookList.find((b) => b.featured) ?? bookList[0];
  const fan = ["becoming-a-power-couple", "mind-your-mind", "becoming-a-high-impact-leader"].map((id) => bookList.find((b) => b.id === id)!);
  const { bundle } = books;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Books by ${site.name}`,
    url: `${siteUrl}/books`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: bookList.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/books/${b.id}`,
        name: b.title,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Navbar />
      <main id="main">
        {/* Header */}
        <section className="grain relative isolate overflow-hidden pb-20 pt-36 md:pb-28 md:pt-44" aria-labelledby="books-title">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(110%_80%_at_85%_0%,rgb(var(--c-navy-2))_0%,rgb(var(--c-ink))_62%)]" />
          <div className="light-rays absolute inset-0 -z-10" />
          <div className="container grid items-center gap-16 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="rise eyebrow">The Library</p>
              <h1 id="books-title" className="rise mt-6 text-display-xl" style={{ "--d": "0.08s" } as CSSProperties}>
                Books by <em className="text-gold-gradient">Rev. Dr. Sam Oye</em>
              </h1>
              <p className="rise mt-7 max-w-xl text-lg leading-relaxed text-muted" style={{ "--d": "0.18s" } as CSSProperties}>
                Practical, Bible-based wisdom for marriage and relationships, singlehood, leadership, ministry and personal growth —
                written to inform, inspire and transform.
              </p>
              <ul className="rise mt-10 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-ivory/10 bg-ivory/10" style={{ "--d": "0.28s" } as CSSProperties}>
                {[
                  [String(bookList.length), "Titles"],
                  ["Instant", "E-book download"],
                  ["Secure", "Checkout"],
                ].map(([big, small]) => (
                  <li key={small} className="bg-ink px-4 py-5 text-center">
                    <p className="font-serif text-3xl text-ivory">{big}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">{small}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fanned covers */}
            <div className="portrait-in relative mx-auto h-[22rem] w-full max-w-lg sm:h-[26rem] lg:col-span-6" aria-hidden="true">
              <div className="absolute inset-x-10 bottom-0 h-24 rounded-full bg-gold/20 blur-3xl" />
              {fan.map((b, i) => (
                <div
                  key={b.id}
                  className={`absolute top-1/2 aspect-square w-[58%] -translate-y-1/2 overflow-hidden rounded-3xl border border-ivory/10 shadow-card ${
                    ["left-0 -rotate-[8deg]", "left-1/2 z-10 -translate-x-1/2 shadow-glow", "right-0 rotate-[8deg]"][i]
                  }`}
                >
                  <Image src={b.cover} alt="" fill priority={i === 1} sizes="(min-width: 1024px) 22vw, 55vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured */}
        <section className="relative py-20 md:py-28" aria-labelledby="featured-title">
          <div className="absolute inset-x-0 top-0 hairline" />
          <div className="container">
            <Reveal standalone className="card grid overflow-hidden lg:grid-cols-2">
              <Link href={`/books/${featured.id}`} className="group relative block aspect-square overflow-hidden lg:aspect-auto lg:min-h-[34rem]">
                <Image src={featured.cover} alt={`Cover of ${featured.title}`} fill sizes="(min-width: 1024px) 45vw, 92vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
              </Link>
              <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
                <p className="eyebrow">Featured title</p>
                <h2 id="featured-title" className="mt-5 text-display-md">{featured.title}</h2>
                <p className="mt-3 font-serif text-xl italic text-gold">{featured.subtitle}</p>
                {featured.about?.slice(0, 2).map((p) => (
                  <p key={p} className="mt-5 max-w-prose leading-relaxed text-muted">
                    {p}
                  </p>
                ))}
                {featured.highlights && (
                  <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                    {featured.highlights.map((h) => (
                      <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-ivory/90">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-9 flex flex-wrap gap-3">
                  <a href={featured.gumroad} {...ext} className="btn-primary">
                    Buy the e-book
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </a>
                  <Link href={`/books/${featured.id}`} className="btn-secondary">
                    Read more
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Library */}
        <section id="library" className="relative pb-24 md:pb-32" aria-labelledby="library-title">
          <div className="container">
            <RevealGroup as="header" className="mb-10 max-w-3xl">
              <Reveal>
                <p className="eyebrow">Browse</p>
              </Reveal>
              <Reveal>
                <h2 id="library-title" className="mt-5 text-display-lg">
                  The complete <em className="text-gold-gradient">collection</em>
                </h2>
              </Reveal>
            </RevealGroup>
            <BookLibrary books={bookList} categories={books.categories} />
          </div>
        </section>

        {/* Bundle */}
        <section className="relative pb-24 md:pb-32" aria-labelledby="bundle-title">
          <div className="container">
            <Reveal standalone className="relative overflow-hidden rounded-card border border-gold/25 bg-gradient-to-br from-navy-2/80 via-navy to-ink">
              <div className="grid items-center md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <div className="relative aspect-square">
                  <Image src={bundle.cover} alt={`${bundle.title} cover`} fill sizes="(min-width: 768px) 38vw, 92vw" className="object-cover" />
                </div>
                <div className="p-8 md:p-12 lg:p-16">
                  <p className="eyebrow">Best value</p>
                  <h2 id="bundle-title" className="mt-5 text-display-md">{bundle.title}</h2>
                  <p className="mt-3 font-serif text-xl italic text-gold">{bundle.subtitle}</p>
                  {bundle.about.map((p) => (
                    <p key={p} className="mt-4 max-w-prose leading-relaxed text-muted">
                      {p}
                    </p>
                  ))}
                  <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                    {bundle.includes.map((t) => (
                      <li key={t} className="flex gap-2.5 text-ivory/90">
                        <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-gold" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <a href={bundle.url} {...ext} className="btn-primary mt-9">
                    Get all four books
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Where to buy */}
        <section className="relative pb-24 md:pb-32" aria-labelledby="stores-title">
          <div className="container">
            <Reveal standalone className="glass grid gap-10 rounded-card p-8 md:grid-cols-2 md:p-12">
              <div>
                <p className="eyebrow">Where to buy</p>
                <h2 id="stores-title" className="mt-5 text-display-md">Official stores</h2>
                <p className="mt-4 max-w-prose leading-relaxed text-muted">
                  Every e-book is sold through the ministry&rsquo;s own stores. Payment is handled securely by the store, and your download is
                  available straight away.
                </p>
                <p className="mt-6 text-sm text-muted">
                  Also by {bio.name}: {bio.biography.earlierTitles.join(", ")}.
                </p>
              </div>
              <ul className="grid content-center gap-3">
                {books.storefronts.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      {...ext}
                      className="group flex items-center justify-between rounded-2xl border border-ivory/10 bg-ink/40 px-6 py-5 transition-colors hover:border-gold/50"
                    >
                      <span className="font-serif text-2xl text-ivory">{s.name}</span>
                      <Icon name="arrowRight" className="h-5 w-5 text-gold transition-transform duration-300 group-hover:translate-x-1.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer home={false} />
    </>
  );
}

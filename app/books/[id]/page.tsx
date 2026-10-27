import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCard } from "@/components/books/BookCard";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Icon } from "@/components/ui/Icon";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { bio, bookList, getBook, relatedBooks, site, siteUrl } from "@/lib/content";

type Params = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => bookList.map((b) => ({ id: b.id }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const book = getBook((await params).id);
  if (!book) return {};
  const description = book.about?.[0] ?? book.subtitle;
  return {
    title: `${book.title} — ${book.subtitle}`.slice(0, 90),
    description: description.slice(0, 160),
    alternates: { canonical: `/books/${book.id}` },
    openGraph: { type: "book", title: book.title, description: book.subtitle, url: `/books/${book.id}`, images: [{ url: book.cover, width: 900, height: 900 }] },
  };
}

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default async function BookPage({ params }: Params) {
  const book = getBook((await params).id);
  if (!book) notFound();
  const related = relatedBooks(book);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        name: book.title,
        alternativeHeadline: book.subtitle,
        description: book.about?.join(" ") ?? book.subtitle,
        image: `${siteUrl}${book.cover}`,
        url: `${siteUrl}/books/${book.id}`,
        genre: book.category,
        bookFormat: "https://schema.org/EBook",
        author: { "@type": "Person", name: site.name, url: siteUrl },
        offers: { "@type": "Offer", url: book.gumroad, availability: "https://schema.org/InStock" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Books", item: `${siteUrl}/books` },
          { "@type": "ListItem", position: 3, name: book.title, item: `${siteUrl}/books/${book.id}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Navbar />
      <main id="main">
        {/* overflow-x-clip (not overflow-hidden) so the cover can stay sticky while the text scrolls */}
        <section className="relative isolate overflow-x-clip pb-20 pt-32 md:pb-28 md:pt-40" aria-labelledby="book-title">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(90%_60%_at_20%_0%,rgb(var(--c-navy-2))_0%,rgb(var(--c-ink))_65%)]" />
          <div className="container">
            <nav aria-label="Breadcrumb" className="rise mb-10 text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-gold">Home</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/books" className="hover:text-gold">Books</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-ivory/80">{book.title}</li>
              </ol>
            </nav>

            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              {/* Cover */}
              <div className="lg:col-span-5">
                <div className="portrait-in lg:sticky lg:top-28">
                  <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-ivory/10 shadow-glow">
                    <Image src={book.cover} alt={`Cover of ${book.title} by Dr. Sam Oye`} fill priority sizes="(min-width: 1024px) 38vw, 92vw" className="object-cover" />
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="lg:col-span-7">
                <p className="rise inline-flex rounded-full border border-gold/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                  {book.category}
                </p>
                <h1 id="book-title" className="rise mt-6 text-display-lg">{book.title}</h1>
                <p className="rise mt-4 font-serif text-2xl italic leading-snug text-gold">{book.subtitle}</p>
                <p className="rise mt-5 text-muted">
                  by <Link href="/#about" className="font-semibold text-ivory hover:text-gold">{bio.name}</Link>
                </p>

                {/* Buy box */}
                <div className="rise glass mt-9 rounded-3xl p-6 md:p-8">
                  <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                    {[
                      ["Format", "E-book"],
                      ["Delivery", "Instant download"],
                      ["Checkout", "Secure, via Gumroad"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs uppercase tracking-[0.16em] text-muted">{k}</dt>
                        <dd className="mt-1 font-medium text-ivory">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <a href={book.gumroad} {...ext} className="btn-primary sm:flex-1">
                      Buy the e-book
                      <Icon name="arrowRight" className="h-4 w-4" />
                    </a>
                    {book.store && (
                      <a href={book.store} {...ext} className="btn-secondary sm:flex-1">
                        Official bookstore
                      </a>
                    )}
                    {book.amazon && (
                      <a href={book.amazon} {...ext} className="btn-secondary sm:flex-1">
                        Amazon
                      </a>
                    )}
                  </div>
                </div>

                {/* About */}
                {book.about && (
                  <RevealGroup className="mt-14">
                    <Reveal>
                      <h2 className="text-3xl md:text-4xl">About the book</h2>
                    </Reveal>
                    {book.about.map((p) => (
                      <Reveal key={p}>
                        <p className="mt-5 max-w-prose text-lg leading-relaxed text-muted">{p}</p>
                      </Reveal>
                    ))}
                  </RevealGroup>
                )}

                {book.highlights && (
                  <Reveal standalone className="mt-12">
                    <h2 className="text-3xl md:text-4xl">Inside this book</h2>
                    <ul className="mt-6 grid gap-3">
                      {book.highlights.map((h) => (
                        <li key={h} className="flex gap-4 rounded-2xl border border-ivory/10 bg-ivory/[0.03] p-4">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-bright">
                            <Icon name="check" className="h-3.5 w-3.5" />
                          </span>
                          <span className="leading-relaxed text-ivory/90">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}

                {book.closing && (
                  <Reveal standalone as="article" className="relative mt-14 border-l border-gold/50 pl-8">
                    <Icon name="quote" className="absolute -left-4 -top-1 h-8 w-8 bg-ink text-gold" />
                    {book.closing.map((p) => (
                      <p key={p} className={`mt-3 font-serif italic leading-snug text-ivory first:mt-0 ${p.length > 160 ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"}`}>
                        {p}
                      </p>
                    ))}
                  </Reveal>
                )}

                {/* Author */}
                <Reveal standalone className="card mt-16 flex flex-col gap-6 p-6 sm:flex-row sm:items-center md:p-8">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-gold/40">
                    <Image src={bio.heroPortrait.src} alt={bio.name} fill sizes="96px" className="object-cover object-[50%_20%]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">About the author</p>
                    <p className="mt-2 font-serif text-2xl text-ivory">{bio.name}</p>
                    <p className="mt-2 leading-relaxed text-muted">{bio.paragraphs[0]}</p>
                    <Link href="/#biography" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-bright">
                      Read his biography
                      <Icon name="arrowRight" className="h-4 w-4" />
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* More books */}
        <section className="relative pb-24 md:pb-32" aria-labelledby="more-title">
          <div className="absolute inset-x-0 top-0 hairline" />
          <div className="container pt-20 md:pt-28">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 id="more-title" className="text-display-md">
                You may also <em className="text-gold-gradient">like</em>
              </h2>
              <Link href="/books" className="inline-flex items-center gap-2 font-semibold text-gold hover:text-gold-bright">
                All books
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            </div>
            <RevealGroup as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((b) => (
                <Reveal as="li" key={b.id}>
                  <BookCard book={b} />
                </Reveal>
              ))}
            </RevealGroup>
          </div>
        </section>
      </main>
      <Footer home={false} />
    </>
  );
}

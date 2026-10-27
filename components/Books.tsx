"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { bio, books } from "@/lib/content";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

const ALL = "All books";
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export function Books() {
  const [filter, setFilter] = useState(ALL);
  const list = filter === ALL ? books.books : books.books.filter((b) => b.category === filter);
  const { bundle } = books;

  return (
    <section id="books" aria-labelledby="books-title" className="relative py-24 md:py-36">
      <div className="absolute inset-x-0 top-0 hairline" />
      <div className="container">
        <SectionHeading
          id="books-title"
          eyebrow="Books"
          title={
            <>
              Wisdom for <em className="text-gold-gradient">every season</em>
            </>
          }
          intro="Practical, Bible-based books on marriage, relationships, singlehood, leadership, ministry and personal growth — available as e-books from the official stores."
        />

        <Reveal standalone>
          <div role="group" aria-label="Filter books by topic" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {[ALL, ...books.categories].map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={filter === c}
                onClick={() => setFilter(c)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                  filter === c ? "border-gold bg-gold text-ink" : "border-ivory/15 text-ivory/80 hover:border-gold/60 hover:text-ivory"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <motion.ul layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((b) => (
              <motion.li
                layout
                key={b.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="card group flex flex-col overflow-hidden"
              >
                <a href={b.gumroad} {...ext} className="relative block aspect-square overflow-hidden" aria-label={`${b.title} on Gumroad`}>
                  <Image
                    src={b.cover}
                    alt={`Cover of ${b.title} by Dr. Sam Oye`}
                    fill
                    sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-gold-bright backdrop-blur">
                    {b.category}
                  </span>
                </a>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl leading-snug md:text-2xl">{b.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{b.subtitle}</p>
                  <div className="mt-auto pt-6">
                    <a href={b.gumroad} {...ext} className="btn-primary w-full">
                      Buy on Gumroad
                      <Icon name="arrowRight" className="h-4 w-4" />
                    </a>
                    {(b.store || b.amazon) && (
                      <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
                        {b.store && (
                          <a href={b.store} {...ext} className="font-semibold text-gold hover:text-gold-bright">
                            Official store
                          </a>
                        )}
                        {b.amazon && (
                          <a href={b.amazon} {...ext} className="font-semibold text-gold hover:text-gold-bright">
                            Amazon
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {/* Bundle */}
        <Reveal standalone className="card mt-14 grid items-center overflow-hidden md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="relative aspect-square">
            <Image src={bundle.cover} alt={`${bundle.title} cover`} fill sizes="(min-width: 768px) 38vw, 92vw" className="object-cover" />
          </div>
          <div className="p-8 md:p-12">
            <p className="eyebrow">Bundle</p>
            <h3 className="mt-4 text-display-md">{bundle.title}</h3>
            <p className="mt-3 text-lg text-gold">{bundle.subtitle}</p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {bundle.includes.map((t) => (
                <li key={t} className="flex gap-2 text-ivory/85">
                  <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-gold" />
                  {t}
                </li>
              ))}
            </ul>
            <a href={bundle.url} {...ext} className="btn-primary mt-8">
              Get the bundle on Gumroad
              <Icon name="arrowRight" className="h-4 w-4" />
            </a>
          </div>
        </Reveal>

        <Reveal standalone className="mt-12 flex flex-col gap-4 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            Also by Rev. Dr. Sam Oye: {bio.biography.earlierTitles.join(", ")}.
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>Shop all:</span>
            {books.storefronts.map((s) => (
              <a key={s.url} href={s.url} {...ext} className="font-semibold text-gold hover:text-gold-bright">
                {s.name}
              </a>
            ))}
            {books.amazonAuthorUrl && (
              <a href={books.amazonAuthorUrl} {...ext} className="font-semibold text-gold hover:text-gold-bright">
                Amazon
              </a>
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

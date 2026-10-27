"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Book } from "@/lib/content";
import { BookCard } from "./BookCard";

const ALL = "All books";

/** Topic filter + grid for the /books page. */
export function BookLibrary({ books, categories }: { books: Book[]; categories: string[] }) {
  const [filter, setFilter] = useState(ALL);
  const list = filter === ALL ? books : books.filter((b) => b.category === filter);
  const count = (c: string) => (c === ALL ? books.length : books.filter((b) => b.category === c).length);

  return (
    <>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filter books by topic" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {[ALL, ...categories].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                filter === c ? "border-gold bg-gold text-on-gold" : "border-ivory/15 text-ivory/80 hover:border-gold/60 hover:text-ivory"
              }`}
            >
              {c}
              <span className={`text-xs ${filter === c ? "text-on-gold/70" : "text-muted"}`}>{count(c)}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-muted" aria-live="polite">
          Showing {list.length} {list.length === 1 ? "title" : "titles"}
        </p>
      </div>

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
            >
              <BookCard book={b} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </>
  );
}

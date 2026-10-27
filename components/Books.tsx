import Link from "next/link";
import { bookList, books } from "@/lib/content";
import { BookCard } from "./books/BookCard";
import { Icon } from "./ui/Icon";
import { Reveal, RevealGroup } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

/** Home-page preview of the library; the full catalogue lives at /books. */
export function Books() {
  const featured = books.homeFeatured.map((id) => bookList.find((b) => b.id === id)!).filter(Boolean);

  return (
    <section id="books" aria-labelledby="books-title" className="relative py-24 md:py-36">
      <div className="absolute inset-x-0 top-0 hairline" />
      <div className="container">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="books-title"
            eyebrow="Books"
            title={
              <>
                Wisdom for <em className="text-gold-gradient">every season</em>
              </>
            }
            intro="Practical, Bible-based books on marriage, relationships, singlehood, leadership, ministry and personal growth."
          />
          <Reveal standalone className="mb-12 md:mb-16">
            <Link href="/books" className="btn-secondary">
              Explore all {bookList.length} books
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <RevealGroup as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((b) => (
            <Reveal as="li" key={b.id}>
              <BookCard book={b} />
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Book } from "@/lib/content";
import { Icon } from "../ui/Icon";

/** Cover, topic, title and subtitle; the whole card opens the book's own page. */
export function BookCard({ book, sizes = "(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw" }: { book: Book; sizes?: string }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="card group flex h-full flex-col overflow-hidden transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:border-gold/40"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={book.cover}
          alt={`Cover of ${book.title} by Dr. Sam Oye`}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-overlay/75 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
          {book.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl leading-snug md:text-2xl">{book.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{book.subtitle}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-gold">
          View book
          <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}

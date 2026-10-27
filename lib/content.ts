import site from "@/data/site.json";
import bio from "@/data/bio.json";
import ministry from "@/data/ministry.json";
import stats from "@/data/stats.json";
import eventsFile from "@/data/events.json";
import video from "@/data/video.json";
import testimonies from "@/data/testimonies.json";
import books from "@/data/books.json";

export type SiteData = typeof site;
export type BioData = typeof bio;
export type MinistryArm = (typeof ministry.arms)[number];
export type StatsData = typeof stats;
export type VideoData = typeof video;
export type TestimoniesData = typeof testimonies;
export type Book = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  cover: string;
  gumroad: string;
  store: string;
  amazon: string;
  featured?: boolean;
  about?: string[];
  highlights?: string[];
  closing?: string[];
};

export type EventItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  venue?: string;
  online?: boolean;
  onlineLabel?: string;
  description: string;
  speakers: string[];
  registerUrl?: string;
  placeholder?: boolean;
};

// Canonical address for SEO links, sitemap and structured data. Override with NEXT_PUBLIC_SITE_URL.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://revsamoye.com" : "http://localhost:3000")
).replace(/\/$/, "");

export const events = eventsFile.events as EventItem[];

/** Events whose end time has not passed yet, soonest first. */
export function upcomingEvents(list: EventItem[] = events, now: Date = new Date()): EventItem[] {
  return list
    .filter((e) => new Date(e.end ?? e.start).getTime() > now.getTime())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export const bookList = books.books as Book[];
export const getBook = (id: string) => bookList.find((b) => b.id === id);

/** Up to `n` other books, same topic first. */
export function relatedBooks(book: Book, n = 4): Book[] {
  const others = bookList.filter((b) => b.id !== book.id);
  return [...others.filter((b) => b.category === book.category), ...others.filter((b) => b.category !== book.category)].slice(0, n);
}

export { site, bio, ministry, stats, video, testimonies, books };

import type { MetadataRoute } from "next";
import { bookList, siteUrl } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/books`, changeFrequency: "monthly", priority: 0.8 },
    ...bookList.map((b) => ({ url: `${siteUrl}/books/${b.id}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}

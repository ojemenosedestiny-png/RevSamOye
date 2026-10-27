import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Pinyon_Script } from "next/font/google";
import { Providers } from "@/components/Providers";
import { site, siteUrl } from "@/lib/content";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const script = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });

const title = `${site.name} — Founder & Lead Pastor, The Transforming Church`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: ["Sam Oye", "Rev Sam Oye", "The Transforming Church", "Prophetic Prayer Hour", "Sam Oye Podcast", "Abuja church", "Sam Oye Global"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title,
    description: site.description,
    locale: "en_NG",
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#060914",
  colorScheme: "dark light",
};

// Runs before first paint: flags JS (animated text can start hidden without being lost when
// scripts are off) and applies the saved theme, else the device setting. Admin stays dark.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');var t='dark';try{var s=localStorage.getItem('theme');t=s==='light'||s==='dark'?s:matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}catch(e){}if(location.pathname.indexOf('/admin')===0)t='dark';d.dataset.theme=t;if(t==='light'){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#FAF7F0');}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${script.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a href="#main" className="sr-only z-[100] rounded-full bg-gold px-5 py-3 font-semibold text-on-gold focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

# Rev. Dr. Sam Oye — Official Website

A single-page site for Rev. Dr. Sam Oye, Founder & Lead Pastor of The Transforming Church, Abuja.
It's built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, GSAP and Lenis.

> **Before launch:** anything marked with a dashed gold **PLACEHOLDER** tag on the page must be confirmed or replaced by the ministry. That covers the stats, events, quote, testimonies, contact details, and the Facebook and X links. Also check the bio wording in `data/bio.json`.

---

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local   # optional for local preview
npm run dev                  # http://localhost:3000
```

- `/` is the landing page.
- `/design-system` shows the colours, type, buttons and cards. It is not indexed by search engines.

Without any keys, the counseling and newsletter forms still work locally. Submissions are accepted but not stored, and no email is sent.

## Editing content (no coding needed)

All text lives in `/data`. Edit the JSON, save, and redeploy.

| File | What it controls |
| --- | --- |
| `site.json` | Name, navigation, social links, contact details, app links and copy, newsletter text |
| `bio.json` | About section: paragraphs, highlights, quote, portraits |
| `ministry.json` | Ministry cards: title, 2-line description, icon, link |
| `stats.json` | Impact counters. Set `"placeholder": false` once the figures are confirmed |
| `events.json` | Upcoming events |
| `video.json` | The Watch section |
| `testimonies.json` | Testimony slider |

JSON tips: keep the quotes and commas exactly as they are, and paste a file into [jsonlint.com](https://jsonlint.com) if the site fails to build after an edit.

### Adding an event

Add a new block to `data/events.json`:

```json
{
  "id": "unique-id-with-dashes",
  "title": "Event title",
  "start": "2027-03-14T17:00:00+01:00",
  "end": "2027-03-14T20:00:00+01:00",
  "venue": "The Transforming Church, Abuja",
  "online": true,
  "onlineLabel": "Streaming live on YouTube",
  "description": "One or two sentences.",
  "speakers": ["Rev. Dr. Sam Oye"],
  "registerUrl": "https://…",
  "placeholder": false
}
```

- Times use West Africa Time (`+01:00`).
- Events disappear automatically once their `end` time has passed. The page re-checks every hour, and visitors' browsers re-check every minute.
- The soonest event becomes the featured card with the live countdown.
- "Add to Calendar" generates an `.ics` file automatically.

## Replacing photos and video

Use only official ministry photos.

| Asset | Location |
| --- | --- |
| Hero portrait | `public/images/pastor-portrait.jpg`. The current file was enlarged from a small original (kept in `photo-originals/`). Replace it with an official photo of at least 1200×1500px, and update `heroPortrait` in `bio.json` if the size or filename changes |
| About portrait | `public/images/pastor-ministering.jpg`, also enlarged from a small original. Swap it by changing `aboutPortrait.src` in `bio.json` |
| Intro video | `public/videos/intro.mp4`. Use H.264, ideally 15 MB or less, 30–90 seconds |
| Video poster | e.g. `public/images/video-poster.jpg`, then set `poster` in `video.json` |
| Captions | `public/videos/intro.en.vtt` (WebVTT) |
| YouTube fallback | Set `youtubeUrl` in `video.json`. It's used if the MP4 is missing, or always if `preferYouTube` is `true` |
| App screenshot | The phone in the App section is a CSS illustration. You can swap it for a real screenshot in `components/PhoneMockup.tsx` |

Photos are optimised automatically by `next/image` (AVIF/WebP, responsive sizes, lazy-loaded). Compress the video before uploading, for example with HandBrake's "Web" preset.

The App Store and Google Play badges in `public/badges/` are the official artwork. Don't alter them.

## Forms, database and email

### 1. Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy the Project URL and the service-role key into `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

Requests can be viewed in Supabase under Table Editor → `counseling_requests`.

### 2. Email (Resend)

1. Create an account at [resend.com](https://resend.com) and verify the ministry's domain.
2. Set `RESEND_API_KEY`, `EMAIL_FROM` and `MINISTRY_EMAIL`.

Each request sends a notification to `MINISTRY_EMAIL` and a confirmation to the person. If you'd rather use SMTP through Nodemailer, replace `sendEmail()` in `lib/server/email.ts`.

### 3. Spam protection

These are always on:

- a honeypot field
- a minimum time-to-submit check
- a per-IP rate limit (5 per 10 minutes)
- server-side validation

**Optional:** Cloudflare Turnstile. Create a widget in Cloudflare and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.

The rate limiter is in-memory. On Vercel it is per-instance, so for stricter limits swap `lib/server/rate-limit.ts` for Upstash Redis.

### Confidentiality

- Submission contents are never written to logs.
- Database tables use Row Level Security, so they're readable only with the service-role key.
- In production, the form refuses submissions if neither the database nor email is configured, so no request is silently lost.

## Admin panel (`/admin`)

Sign in at `https://your-site/admin` with `ADMIN_PASSWORD`.

| Page | What you can do |
| --- | --- |
| **Dashboard** | See new and total bookings, subscribers and upcoming events, the latest requests, and a setup checklist showing which services are connected |
| **Bookings** | Read every counseling request, filter by status (new → contacted → scheduled → completed → archived), search, add private notes, email/call/WhatsApp the person in one tap, export to CSV, delete |
| **Photos & video** | Upload the main portrait, the About photo, the intro video, its cover image and captions, or set a YouTube link. Changes go live as soon as you press **Save** |
| **Events** | Add, edit, hide or delete events (times in West Africa Time). Once you add one, the sample events from `data/events.json` stop showing |
| **Subscribers** | View, search, remove and export newsletter sign-ups (CSV for Mailchimp etc.) |

How it works:

- **Storage:** uploads go **directly from the browser to Supabase Storage** (the public `media` bucket), so large videos don't pass through the web server. Render's own disk is wiped on every deploy, which is why files aren't stored there.
- **Upload size:** the Supabase free plan allows files up to **50 MB**, so compress videos first (HandBrake "Web" preset, 1080p) or use a YouTube link.
- **Small photos:** the uploader warns you when a photo is under 1000px wide, because it will look blurry.
- **Security:**
  - The panel and its API are protected by a signed, HTTP-only session cookie that lasts 12 hours.
  - Login is rate-limited: 5 attempts per 15 minutes.
  - Requests from other websites are refused.
  - The whole panel is hidden from search engines.
- **Without a database:** if Supabase isn't connected, the panel still opens and the checklist shows what's missing. The site keeps using the files in `/public` and `/data`.

## Deploying

### Render (recommended for this project)

The repo includes a `render.yaml` blueprint.

1. **Set up Supabase:**
   1. Create a project at [supabase.com](https://supabase.com).
   2. Open **SQL Editor** and run all of `supabase/schema.sql`. This creates the tables and the `media` storage bucket.
   3. Copy the **Project URL** and the **service_role key** from Project Settings → API.
2. **Create the service on Render:** in the dashboard, choose **New → Blueprint** and connect this GitHub repo. Render reads `render.yaml` and asks for the secret values:
   - `NEXT_PUBLIC_SITE_URL`: the site address, e.g. `https://rev-sam-oye.onrender.com` (later, your own domain).
   - `ADMIN_PASSWORD`: a long, unique password.
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
   - `RESEND_API_KEY` and `EMAIL_FROM` to send booking emails. You can skip these at first.
   - Leave the Turnstile keys blank unless you set it up.
3. **Deploy:** click **Apply**. The first build takes about 3–5 minutes. After that, every push to GitHub redeploys automatically.
4. **Add your domain:** under Settings → Custom Domains, add your domain (e.g. `www.samoyeglobal.org`), add the DNS records Render shows, then update `NEXT_PUBLIC_SITE_URL`.

The blueprint uses the **Starter** plan. The free plan works, but it sleeps after 15 minutes without visitors, so the next visitor waits around 30–60 seconds for the site to wake up.

### Vercel (alternative)

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Add every variable from `.env.example`.
3. Deploy.

## Project structure

```
app/              site page, /privacy, /admin (panel), API routes, SEO (sitemap, robots, OG image, icon)
components/       one component per site section + ui/ primitives
components/admin/ admin panel screens (bookings, media, events, subscribers)
data/             default content (JSON), used unless overridden in the admin panel
lib/              content loaders, validation, formatting, .ics export, auth
lib/server/       database/storage client, email, rate limiting, admin guards
middleware.ts     protects /admin and /api/admin
public/           images, videos, official store badges
photo-originals/  the original small photos the site images were enlarged from
supabase/         database schema + storage bucket
render.yaml       Render deployment blueprint
```

## Motion and accessibility

- **Hero headline:** GSAP kinetic letters, then a hand-drawn underline.
- **Scroll:** Framer Motion scroll-reveals and parallax, a GSAP ScrollTrigger pull-quote, and Lenis smooth scroll.
- **Reduced motion:** all heavy motion is disabled for visitors who set `prefers-reduced-motion`. That covers particles, the letter assembly, smooth scroll, auto-rotation and parallax.
- **Keyboard and screen readers:** skip link, visible focus states, labelled form fields with inline errors, focus-managed menu and video dialogs, and alt text on all images.

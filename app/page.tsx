import { About } from "@/components/About";
import { AppDownload } from "@/components/AppDownload";
import { Counseling } from "@/components/Counseling";
import { Events } from "@/components/Events";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { ImpactStats } from "@/components/ImpactStats";
import { JsonLd } from "@/components/JsonLd";
import { MinistryArms } from "@/components/MinistryArms";
import { Navbar } from "@/components/Navbar";
import { Newsletter } from "@/components/Newsletter";
import { Testimonies } from "@/components/Testimonies";
import { Watch } from "@/components/Watch";
import { getSiteMedia, getUpcomingEvents } from "@/lib/server/site-content";

// Re-render hourly so past events drop off; admin saves refresh it immediately.
export const revalidate = 3600;

export default async function Home() {
  const [media, events] = await Promise.all([getSiteMedia(), getUpcomingEvents()]);
  return (
    <>
      <JsonLd events={events} />
      <Navbar />
      <main id="main">
        <Hero portrait={media.heroPortrait} />
        <About portrait={media.aboutPortrait} />
        <MinistryArms />
        <ImpactStats />
        <Watch video={media.video} />
        <Events initial={events} />
        <Counseling />
        <AppDownload />
        <Testimonies />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}

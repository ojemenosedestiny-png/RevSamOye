import Image from "next/image";
import { bio } from "@/lib/content";
import { Icon } from "./ui/Icon";
import { Reveal, RevealGroup } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function Biography() {
  const { biography: b } = bio;
  const { family } = b;

  return (
    <section id="biography" aria-labelledby="biography-title" className="relative py-24 md:py-36">
      <div className="absolute inset-x-0 top-0 hairline" />
      <div className="container">
        <SectionHeading
          id="biography-title"
          eyebrow="Biography"
          title={
            <>
              From a student fellowship <em className="text-gold-gradient">to the nations</em>
            </>
          }
          intro={b.intro}
        />

        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <RevealGroup as="ul" className="space-y-10 lg:col-span-7">
            {b.chapters.map((c, i) => (
              <Reveal as="li" key={c.title} className="grid grid-cols-[auto_1fr] gap-x-6">
                <span className="font-serif text-3xl italic leading-none text-gold/70">0{i + 1}</span>
                <div>
                  <h3 className="text-2xl md:text-3xl">{c.title}</h3>
                  <p className="mt-3 max-w-prose leading-relaxed text-muted">{c.text}</p>
                </div>
              </Reveal>
            ))}
          </RevealGroup>

          <div className="lg:col-span-5">
            <Reveal standalone className="glass rounded-[2rem] p-7 md:p-9 lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Milestones</p>
              <ol className="relative mt-6 space-y-6 border-l border-gold/30 pl-6">
                {b.timeline.map((t) => (
                  <li key={t.year + t.text} className="relative">
                    <span className="absolute -left-[1.85rem] top-1.5 h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_0_4px_rgb(var(--c-ink))]" />
                    <p className="font-serif text-xl text-gold-bright">{t.year}</p>
                    <p className="mt-1 leading-relaxed text-ivory/85">{t.text}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>

        {/* Family */}
        <Reveal standalone className="card mt-24 grid overflow-hidden md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto md:min-h-[30rem]">
            <Image
              src={family.photo.src}
              alt={family.photo.alt}
              fill
              quality={90}
              sizes="(min-width: 768px) 45vw, 92vw"
              className="object-cover object-[50%_20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-ink/40" />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <p className="eyebrow">{family.title}</p>
            <h3 className="mt-5 text-display-md">
              Rev. Dr. Sam Oye <span className="text-muted">&amp;</span>{" "}
              <span className="text-gold-gradient">{family.spouse}</span>
            </h3>
            <p className="mt-5 max-w-prose text-lg leading-relaxed text-muted">{family.text}</p>
            <p className="mt-8 font-script text-5xl leading-none text-gold-gradient">The Oyes</p>
          </div>
        </Reveal>

        {/* Awards */}
        <div className="mt-24">
          <Reveal standalone>
            <h3 className="text-display-md">Honours &amp; recognition</h3>
          </Reveal>
          <RevealGroup as="ul" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {b.awards.map((a) => (
              <Reveal as="li" key={a.title} className="glass flex gap-4 rounded-2xl p-5">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-bright">
                  <Icon name="sparkle" className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium leading-snug text-ivory">{a.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {a.by}
                    {a.year && <span className="text-gold/80"> · {a.year}</span>}
                  </p>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

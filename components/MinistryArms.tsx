"use client";

import type { MouseEvent } from "react";
import { ministry } from "@/lib/content";
import { Icon, type IconName } from "./ui/Icon";
import { Reveal, RevealGroup } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

const spotlight = (e: MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

export function MinistryArms() {
  return (
    <section id="ministry" aria-labelledby="ministry-title" className="relative py-24 md:py-36">
      <div className="absolute inset-x-0 top-0 hairline" />
      <div className="container">
        <SectionHeading
          id="ministry-title"
          eyebrow="Ministry"
          title={
            <>
              One mandate, <em className="text-gold-gradient">many expressions</em>
            </>
          }
          intro="From the local church in Abuja to a global online audience — each arm of the ministry exists to see lives transformed."
        />

        <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ministry.arms.map((arm, i) => (
            <Reveal as="li" key={arm.id} className={arm.featured ? "md:col-span-2 lg:row-span-1" : ""}>
              <a
                href={arm.href}
                onMouseMove={spotlight}
                className="card card-spotlight group flex h-full flex-col p-7 transition-[transform,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-gold/40 md:p-9"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold-bright transition-transform duration-500 ease-out group-hover:rotate-[-6deg] group-hover:scale-110">
                    <Icon name={arm.icon as IconName} className="h-7 w-7" />
                  </span>
                  <span className="font-serif text-sm text-muted">0{i + 1}</span>
                </div>
                <h3 className={`mt-8 ${arm.featured ? "text-3xl md:text-4xl" : "text-2xl"}`}>{arm.title}</h3>
                <p className="mt-3 line-clamp-2 max-w-prose leading-relaxed text-muted">{arm.description}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-gold">
                  Learn more
                  <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </a>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

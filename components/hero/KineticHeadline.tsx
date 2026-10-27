import { Fragment, type CSSProperties } from "react";

type Props = {
  text: string;
  /** Words rendered in gold italic; the first one receives the hand-drawn underline. */
  accent?: string[];
  className?: string;
};

/**
 * Letters rise into place from a soft blur, then a gold underline draws itself beneath
 * the accent word. Pure CSS (see .kinetic-char in globals.css), so the headline animates
 * from the very first paint instead of waiting for JavaScript to load.
 */
export function KineticHeadline({ text, accent = [], className = "" }: Props) {
  const words = text.split(" ");
  const underlineWord = accent[0];
  let i = 0;

  return (
    <h1 className={className} aria-label={text}>
      {words.map((word, wi) => {
        const isAccent = accent.includes(word);
        return (
          // The space sits between the word boxes; inside an inline-block it would collapse
          <Fragment key={wi}>
            <span aria-hidden="true" className="inline-block whitespace-nowrap">
              <span className={`relative inline-block ${isAccent ? "font-semibold italic text-gold-bright" : ""}`}>
                {Array.from(word).map((ch, ci) => (
                  <span key={ci} className="kinetic-char inline-block" style={{ "--i": i++ } as CSSProperties}>
                    {ch}
                  </span>
                ))}
                {word === underlineWord && (
                  <svg
                    className="pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.3em] w-full overflow-visible text-gold"
                    viewBox="0 0 300 20"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      className="kinetic-underline"
                      d="M3 14C60 6 140 3 297 9"
                      pathLength={1}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
            </span>
            {wi < words.length - 1 && " "}
          </Fragment>
        );
      })}
    </h1>
  );
}

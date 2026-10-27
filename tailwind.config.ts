import type { Config } from "tailwindcss";

// Every colour points at a CSS variable defined in app/globals.css,
// so the palette can be tuned in one place.
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", md: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        ink: token("ink"),
        navy: { DEFAULT: token("navy"), 2: token("navy-2") },
        gold: { DEFAULT: token("gold"), bright: token("gold-bright"), deep: token("gold-deep") },
        ivory: token("ivory"),
        muted: token("muted"),
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 6.6vw, 6rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.3rem, 5vw, 4.25rem)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(1.85rem, 3.4vw, 3rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.28em" }],
      },
      borderRadius: { card: "var(--radius-card)" },
      boxShadow: {
        glow: "var(--shadow-glow)",
        card: "0 30px 60px -30px rgb(0 0 0 / 0.6)",
      },
      transitionTimingFunction: { out: "var(--ease-out)" },
      maxWidth: { prose: "62ch" },
    },
  },
  plugins: [],
};

export default config;

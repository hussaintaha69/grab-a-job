import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F3",
        ink: "#1F2A44",
        muted: "#8A8578",
        line: "#E4DFD3",
        saved: "#8A8578",
        applied: "#2F6F9E",
        interview: "#B8862B",
        offer: "#2F6F4F",
        rejected: "#9E3B3B",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

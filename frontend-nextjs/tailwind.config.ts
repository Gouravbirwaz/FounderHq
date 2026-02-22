import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#0B0E11",
          50: "#1A1F27",
          100: "#141920",
          200: "#0F1319",
          300: "#0B0E11",
        },
        violet: {
          DEFAULT: "#7C3AED",
          light: "#9D5FF5",
          dark: "#5B21B6",
          glow: "rgba(124, 58, 237, 0.4)",
        },
        cyan: {
          DEFAULT: "#06B6D4",
          light: "#22D3EE",
          glow: "rgba(6, 182, 212, 0.35)",
        },
        glass: "rgba(255,255,255,0.04)",
        "glass-border": "rgba(255,255,255,0.10)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #0B0E11 0%, #0D1117 50%, #100E1A 100%)",
        "violet-cyan": "linear-gradient(135deg, #7C3AED, #06B6D4)",
        "violet-glow": "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "glass": "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        "violet-glow": "0 0 20px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.15)",
        "cyan-glow": "0 0 20px rgba(6,182,212,0.35)",
        "neon-border": "inset 0 0 0 1px rgba(124,58,237,0.5)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "20px",
      },
      animation: {
        "ticker-scroll": "ticker-scroll 30s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "ticker-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(124,58,237,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(124,58,237,0.7), 0 0 60px rgba(124,58,237,0.3)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

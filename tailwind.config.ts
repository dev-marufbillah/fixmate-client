import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s ease both",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    logs: false,
    themes: [
      {
        fixmate: {
          primary: "#0f766e",
          secondary: "#f59e0b",
          accent: "#0ea5e9",
          neutral: "#1e293b",
          "base-100": "#f8fafc",
          "base-200": "#f1f5f9",
          "base-300": "#e2e8f0",
          "base-content": "#0f172a",
          info: "#2563eb",
          success: "#16a34a",
          warning: "#f59e0b",
          error: "#dc2626",
        },
      },
      {
        "fixmate-dark": {
          primary: "#14b8a6",
          secondary: "#fbbf24",
          accent: "#38bdf8",
          neutral: "#0f172a",
          "base-100": "#0b1120",
          "base-200": "#0f172a",
          "base-300": "#1e293b",
          "base-content": "#e2e8f0",
          info: "#60a5fa",
          success: "#4ade80",
          warning: "#fbbf24",
          error: "#f87171",
        },
      },
    ],
  },
};

export default config;

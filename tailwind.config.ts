import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        surface: "#111111",
        border: "#1f1f1f",
        "text-primary": "#ededed",
        "text-muted": "#666666",
        accent: "#79c14a",
        danger: "#e05252",
        "chart-green": "#79c14a",
        "chart-slate": "#64748b",
        "chart-amber": "#d97706",
        "chart-rose": "#e05252",
        "chart-sky": "#0ea5e9",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      borderColor: {
        DEFAULT: "#1f1f1f",
      },
      backgroundColor: {
        DEFAULT: "#0a0a0a",
      },
    },
  },
  plugins: [],
};

export default config;
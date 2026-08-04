/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "hsl(var(--page) / <alpha-value>)",
        brand: {
          50: "#f0f5f2",
          100: "#dbe7e0",
          200: "#b8d0c3",
          300: "#8fb3a0",
          400: "#5f8b76",
          500: "#436b58",
          dark: "#3a5f4d",    // Бараан ногоон
          darker: "#233c33",  // Хар ногоон
          900: "#182922",
        },
        accent: {
          DEFAULT: "#c8963e", // Зэсэн түлхүүрийн алт өнгө
          light: "#e0b568",
          dark: "#a3782c",
        },
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",       // Хил, зааг
          light: "hsl(var(--surface-light) / <alpha-value>)",   // Сул дэвсгэр
          card: "hsl(var(--surface-card) / <alpha-value>)",     // Карт/input/modal дэвсгэр
        },
        ink: {
          DEFAULT: "hsl(var(--ink) / <alpha-value>)", // Үндсэн текст
          inverse: "#FFFFFF", // Цагаан текст (үргэлж бараан дэвсгэр дээр)
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      gridTemplateRows: {
        layout: "auto 1fr auto", // Header / Content / Footer (3/1 structure)
      },
      boxShadow: {
        soft: "0 1px 2px rgba(24,41,34,0.06), 0 2px 8px rgba(24,41,34,0.06)",
        lift: "0 8px 24px rgba(24,41,34,0.12)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
};

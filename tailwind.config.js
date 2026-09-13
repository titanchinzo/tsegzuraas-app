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
          50: "#eef4fb",
          100: "#d7e6f5",
          200: "#aecdeb",
          300: "#7aabd9",
          400: "#4785c0",
          500: "#2f66a0",
          dark: "#234f80",    // Гүн цэнхэр
          darker: "#0a1420",  // Бараг хар (SpaceX маягийн) шөнийн хөх
          900: "#05090f",
        },
        accent: {
          DEFAULT: "#0d9488", // Дохионы цэнхэр-ногоон гэрэл
          light: "#5eead4",
          dark: "#0b7a70",
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
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "sans-serif"],
      },
      gridTemplateRows: {
        layout: "auto 1fr auto", // Header / Content / Footer (3/1 structure)
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,30,48,0.07), 0 2px 8px rgba(15,30,48,0.07)",
        lift: "0 10px 28px rgba(13,68,94,0.16)",
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
        "signal-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(13,148,136,0.45)" },
          "50%": { boxShadow: "0 0 0 5px rgba(13,148,136,0)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(4%, -5%) scale(1.08)" },
        },
        "drift-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-5%, 4%) scale(1.05)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.18s ease-out",
        "signal-pulse": "signal-pulse 2.2s cubic-bezier(0.4,0,0.6,1) infinite",
        drift: "drift 16s ease-in-out infinite",
        "drift-slow": "drift-slow 20s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#4A5D4E",   // Бараан ногоон
          darker: "#2F4F4F", // Хар ногоон
        },
        surface: {
          DEFAULT: "#EAEAEA", // Саарал
          light: "#F5F5F5",   // Цайвар саарал
        },
        ink: {
          DEFAULT: "#1A1A1A", // Хар текст
          inverse: "#FFFFFF", // Цагаан текст
        },
      },
      gridTemplateRows: {
        layout: "auto 1fr auto", // Header / Content / Footer (3/1 structure)
      },
    },
  },
  plugins: [],
};

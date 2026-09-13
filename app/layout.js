import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono, Unbounded } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NicknameModal from "@/components/NicknameModal";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
// Гарчигт зориулсан цэвэрхэн, зузаан геометрик фонт (SpaceX-ийн маягийн —
// Exo 2-ийн "тоглоомын" мэдрэмжтэй хурц булантай үсгээс илүү цэвэр) —
// кирилл дэмждэг тул монгол гарчгууд дээр ч харагдана.
const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

export const metadata = {
  title: "Цэг Зураас | tsegzuraas.mn",
  description:
    "Телеграфын түлхүүр ашиглан Морзын кодоор бичих, дадлага хийх, сургалтын систем.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#070a0e" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="mn"
        className={`${inter.variable} ${jetbrainsMono.variable} ${unbounded.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen grid grid-rows-layout font-sans antialiased">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Navbar />
            <NicknameModal />
            <main className="container-page py-8 md:py-12">{children}</main>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

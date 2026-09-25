import { ClerkProvider } from "@clerk/nextjs";
// Фонтуудыг npm багцаас (Fontsource) өөрсдөө host хийнэ. Өмнө нь
// next/font/google build бүрд Google Fonts-оос татдаг байсан бөгөөд Google
// хааяа өргөтгөлгүй файлын URL буцаахад Next 14-ийн loader унаж, Vercel build
// бүтэлгүйтдэг байв (интернэтгүй локал build ч мөн адил).
// Inter — үндсэн текст, JetBrains Mono — код, Unbounded — гарчиг (SpaceX-ийн
// маягийн цэвэрхэн, зузаан геометрик фонт, кирилл дэмждэг). CSS хувьсагчид нь
// globals.css-ийн :root дээр.
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/unbounded";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NicknameModal from "@/components/NicknameModal";
import "./globals.css";

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
      <html lang="mn" suppressHydrationWarning>
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

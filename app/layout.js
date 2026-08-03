import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NicknameModal from "@/components/NicknameModal";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

export const metadata = {
  title: "Цэг Зураас | tsegzuraas.mn",
  description:
    "Телеграфын түлхүүр ашиглан Морзын кодоор бичих, дадлага хийх, сургалтын систем.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="mn" className={inter.variable}>
        <body className="min-h-screen grid grid-rows-layout font-sans antialiased">
          <Navbar />
          <NicknameModal />
          <main className="container-page py-8 md:py-12">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}

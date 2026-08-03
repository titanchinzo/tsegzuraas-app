import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NicknameModal from "@/components/NicknameModal";
import "./globals.css";

export const metadata = {
  title: "Цэг Зураас | tsegzuraas.mn",
  description:
    "Телеграфын түлхүүр ашиглан Морзын кодоор бичих, дадлага хийх, сургалтын систем.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="mn">
        <body className="min-h-screen grid grid-rows-layout">
          <Navbar />
          <NicknameModal />
          <main className="container-page py-8">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}

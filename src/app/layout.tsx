import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Angkringan Kita — Pesan Online",
  description:
    "Pesan makanan dan minuman favoritmu langsung dari Angkringan Kita. Menu lengkap, harga terjangkau, rasa beneran.",
  keywords: ["angkringan", "kopi", "cemilan", "pesan online", "coffee shop"],
  openGraph: {
    title: "Angkringan Kita — Pesan Online",
    description: "Pesan makanan dan minuman favoritmu langsung dari Angkringan Kita.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <CartProvider>
          <Navbar />
          <main className="min-h-screen pt-16">{children}</main>
          <footer className="bg-coffee-900 text-cream-200 text-center py-6 mt-16 text-sm">
            <Link href="/admin" className="block font-display text-lg text-cream-100 mb-1 hover:text-white transition-colors">
              Angkringan Kita ☕
            </Link>
            <p className="text-coffee-300">Dibuat dengan ❤️ — Nikmati setiap tegukan</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import { ToastProvider } from "@/hooks/useToast";
import Navbar from "@/components/Navbar";


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

export const viewport: Viewport = {
  themeColor: "#2c1a14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <ToastProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen pt-16">{children}</main>
            <footer className="bg-coffee-900 text-cream-200 text-center py-6 mt-16 text-sm">
              <span className="block font-display text-lg text-cream-100 mb-1">
                Angkringan Kita ☕
              </span>
              <p className="text-coffee-300">Dibuat dengan ❤️ — Nikmati setiap tegukan</p>
            </footer>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

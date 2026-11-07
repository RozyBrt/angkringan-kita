import type { Metadata, Viewport } from "next";
import Image from "next/image";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import { ToastProvider } from "@/hooks/useToast";
import Navbar from "@/components/Navbar";


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Angkringan Kita — Pesan Online",
  description:
    "Pesan makanan dan minuman favoritmu langsung dari Angkringan Kita. Menu lengkap, harga terjangkau, rasa beneran.",
  keywords: ["angkringan", "kopi", "cemilan", "pesan online", "coffee shop"],
  openGraph: {
    title: "Angkringan Kita — Pesan Online",
    description: "Pesan makanan dan minuman favoritmu langsung dari Angkringan Kita.",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 1200,
        alt: "Logo Angkringan Kita",
      },
    ],
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
            <footer className="bg-coffee-900 text-cream-200 text-center py-8 mt-16 text-sm flex flex-col items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden mb-2 shadow border border-coffee-700/50">
                <Image
                  src="/images/logo.png"
                  alt="Logo Angkringan Kita"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
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

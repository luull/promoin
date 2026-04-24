import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Promoin - Cari Promo & Diskon Semua Brand",
  description:
    "Temukan promo terbaru dari berbagai brand favoritmu. Diskon makanan, minuman, lifestyle, dan banyak lagi di Promoin.",
  keywords: [
    "promo hari ini",
    "diskon makanan",
    "promo brand",
    "voucher",
    "promo terdekat",
    "deal terbaik",
  ],
  openGraph: {
    title: "Promoin - Semua Promo Dalam Satu Tempat",
    description:
      "Cari promo terbaru dari berbagai brand dalam satu platform. Hemat lebih mudah dengan Promoin.",
    url: "https://promoin.id",
    siteName: "Promoin",
    images: [
      {
        url: "https://promoin.id/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

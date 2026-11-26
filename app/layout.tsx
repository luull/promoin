import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Promok - Cari Promo & Diskon Semua Brand",
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
      lang="id"
      suppressHydrationWarning
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

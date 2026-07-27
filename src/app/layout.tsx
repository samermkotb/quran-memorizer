import type { Metadata, Viewport } from "next";
import { Cairo, Amiri_Quran, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ui",
  display: "swap",
});

const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-quran",
  display: "swap",
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-wordmark",
  display: "swap",
});

export const metadata: Metadata = {
  title: "فاستمعوا له — Listen & Repeat",
  description:
    "Listen to any Quran segment with your choice of reciter, repeat ayahs for memorization, and share sessions with friends.",
  keywords: ["Quran", "Memorization", "Hafiz", "Islamic", "Audio", "Reciter"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "فاستمعوا له",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b2e29",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cairo.variable} ${amiriQuran.variable} ${notoNaskhArabic.variable} font-ui antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

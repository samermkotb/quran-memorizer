import type { Metadata, Viewport } from "next";
import { Cairo, Noto_Naskh_Arabic } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ui",
  display: "swap",
});

// Amiri Quran 1.003 (SIL OFL 1.1, https://github.com/aliftype/amiri), bundled
// locally so Quran text never depends on a runtime font URL. It covers every
// code point in the bundled Tanzil Uthmani text. See docs/QURAN-TEXT-SOURCES.md.
const amiriQuran = localFont({
  src: "../fonts/AmiriQuran-1.003.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-quran",
  display: "swap",
  fallback: ["serif"],
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

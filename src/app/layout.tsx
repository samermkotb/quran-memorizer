import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quran Memorizer — Listen & Repeat",
  description:
    "Listen to any Quran segment with your choice of reciter, repeat ayahs for memorization, and share sessions with friends.",
  keywords: ["Quran", "Memorization", "Hafiz", "Islamic", "Audio", "Reciter"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quran Memorizer",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

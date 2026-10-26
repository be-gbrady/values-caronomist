import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { publicSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl()),
  title: "The Caronomist — Enthusiast Vehicle Rankings",
  description:
    "The most comprehensive ranking of collector and enthusiast vehicles (1968–2013). Data-driven scores across appreciation, heritage, liquidity, performance, cost of ownership, and upgradability.",
  openGraph: {
    title: "The Caronomist — Enthusiast Vehicle Rankings",
    description: "Data-driven rankings for collector and enthusiast vehicles.",
    siteName: "The Caronomist",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}

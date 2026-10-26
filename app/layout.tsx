import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { siteDefinition } from "@/lib/readerCopy";
import { publicSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl()),
  title: "The Caronomist — Enthusiast Vehicle Rankings",
  description: siteDefinition(),
  openGraph: {
    title: "The Caronomist — Enthusiast Vehicle Rankings",
    description: siteDefinition(),
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

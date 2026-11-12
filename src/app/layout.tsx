import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartDrawer } from "@/components/catalog/CartDrawer";
import { BurgerMenu } from "@/components/catalog/BurgerMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://foiteplkbfwwjshykpgj.supabase.co';
const LOGO_URL = `${SUPABASE_URL}/storage/v1/object/public/npure-assets/logo.png`;

export const metadata: Metadata = {
  title: "NPURE E-Katalog by Elsa — Skincare sehat untuk kulit sehat",
  description:
    "E-katalog produk NPURE dikelola oleh BA NPURE (Elsa) di toko Najmia Unnes. Pesan mudah via WhatsApp.",
  keywords: [
    "NPURE",
    "katalog",
    "skincare",
    "Cica",
    "Licorice",
    "Marigold",
    "Noni",
    "Najmia Unnes",
    "Elsa",
  ],
  authors: [{ name: "NPURE E-Katalog by Elsa" }],
  icons: {
    icon: LOGO_URL,
    apple: LOGO_URL,
    shortcut: LOGO_URL,
  },
  openGraph: {
    title: "NPURE E-Katalog by Elsa",
    description: "Skincare sehat untuk kulit sehat. Pesan via WhatsApp.",
    type: "website",
    locale: "id_ID",
    images: [{ url: LOGO_URL, alt: "NPURE Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NPURE E-Katalog by Elsa",
    description: "Skincare sehat untuk kulit sehat. Pesan via WhatsApp.",
  },
};

export const viewport: Viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <NextTopLoader
          color="#047857"
          showSpinner={false}
          height={3}
          shadow={false}
        />
        {children}
        <BurgerMenu />
        <CartDrawer />
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import { Analytics } from "@/components/Analytics";
import { SITE } from "@/lib/site";
import { HERO_IMAGE } from "@/lib/packages";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "PRITIVO — Travel Agency in Belagavi | Custom Holiday Packages",
    template: "%s | PRITIVO",
  },
  description: SITE.description,
  keywords: [
    "travel agency in Belagavi",
    "holiday packages from Belagavi",
    "custom tour packages Karnataka",
    "international holiday planning",
    "Belgaum travel agency",
    "Goa tour package",
    "Kerala tour package",
    "Dubai holiday package",
    "Bali honeymoon package",
  ],
  applicationName: "PRITIVO",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "PRITIVO",
    title: "PRITIVO — Your World. Your Way.",
    description: SITE.description,
    url: "/",
    images: [{ url: HERO_IMAGE, width: 2000, height: 1333, alt: "Serene mountain lake at sunrise — PRITIVO travel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PRITIVO — Your World. Your Way.",
    description: SITE.description,
    images: [HERO_IMAGE],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#071629",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "PRITIVO",
  slogan: SITE.tagline,
  url: SITE.url,
  telephone: SITE.phoneE164,
  email: SITE.email,
  description: SITE.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Belagavi",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  areaServed: ["India", "Worldwide"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <body className="bg-ivory text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <AssistantWidget />
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { BRAND } from "@/lib/brand";
import CookieNoticeGate from "@/components/CookieNoticeGate";
import { isPathIndexable } from "@/lib/indexability";
import Analytics from "@/components/Analytics";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.canonicalUrl),
  title: { default: `${BRAND.name} — Social media scheduler + Instagram auto-DM`, template: `%s | ${BRAND.name}` },
  description: BRAND.description,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: `${BRAND.name} — Social media scheduler + Instagram auto-DM`,
    description: BRAND.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — Social media scheduler + Instagram auto-DM`,
    description: BRAND.description,
  },
  // Indexing is controlled by BRAND.indexable (src/lib/brand.ts); the same isPathIndexable helper gates the sitemap.
  robots: isPathIndexable("/") ? { index: true, follow: true } : { index: false, follow: false },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": BRAND.canonicalUrl + "#org",
      name: BRAND.name,
      legalName: BRAND.company,
      url: BRAND.canonicalUrl,
      email: BRAND.supportEmail,
      sameAs: BRAND.social,
      logo: {
        "@type": "ImageObject",
        url: BRAND.canonicalUrl + "/brand/poskoo-icon-1024.png",
        width: 1024,
        height: 1024,
      },
      description: BRAND.description,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: BRAND.supportEmail,
        availableLanguage: "English",
      },
    },
    {
      "@type": "WebSite",
      "@id": BRAND.canonicalUrl + "#website",
      url: BRAND.canonicalUrl,
      name: BRAND.name,
      publisher: { "@id": BRAND.canonicalUrl + "#org" },
      inLanguage: "en",
      description: BRAND.description,
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
        <CookieNoticeGate />
        <Analytics />
      </body>
    </html>
  );
}

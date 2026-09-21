import type { Metadata } from "next";
import "./globals.css";
import { getBaseUrl, getSchoolJsonLd, getSeoSourceData } from "@/lib/seo";

const baseUrl = getBaseUrl();
const seoData = getSeoSourceData();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: seoData.pages.home.title,
    template: `%s | ${seoData.name}`,
  },
  description: seoData.pages.home.description,
  keywords: seoData.keywords,
  authors: seoData.authors,
  creator: seoData.name,
  publisher: seoData.name,
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: seoData.pages.home.title,
    description: seoData.pages.home.description,
    url: baseUrl,
    siteName: seoData.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${baseUrl}/assets/Logos/IPSLOGO.png`,
        width: 800,
        height: 800,
        alt: `${seoData.name} Logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoData.pages.home.title,
    description: seoData.pages.home.description,
    images: [`${baseUrl}/assets/Logos/IPSLOGO.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || (seoData as { googleSiteVerification?: string }).googleSiteVerification || "engKHLFSN6vuogQ4pzJdacKjgrNZzocgJb57R9GmsE0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = getSchoolJsonLd();

  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}



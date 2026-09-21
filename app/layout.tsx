import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://indian-public-school-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Indian Public School | Best CBSE School Admissions 2026–27",
    template: "%s | Indian Public School",
  },
  description:
    "Indian Public School is a top-rated CBSE co-educational school in Sambalpur, Odisha. Modern smart classrooms, experienced faculty, sports infrastructure, and holistic learning. Admissions open for Session 2026–27.",
  keywords: [
    "Indian Public School",
    "Indian Public School Sambalpur",
    "CBSE School Sambalpur",
    "School Admission 2026-27",
    "Best CBSE School Odisha",
    "School near Khetrajpur Sambalpur",
    "Top English Medium School",
    "Co-educational CBSE School",
    "K-12 Education Sambalpur",
  ],
  authors: [{ name: "Indian Public School" }],
  creator: "Indian Public School",
  publisher: "Indian Public School",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Indian Public School | Best CBSE School Admissions 2026–27",
    description:
      "Indian Public School is a leading CBSE co-educational school in Sambalpur. Discover our campus, curriculum, faculty, and complete the online admission application.",
    url: baseUrl,
    siteName: "Indian Public School",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${baseUrl}/assets/Logos/IPSLOGO.png`,
        width: 800,
        height: 800,
        alt: "Indian Public School Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Public School | Best CBSE School Admissions 2026–27",
    description:
      "Indian Public School in Sambalpur offers holistic CBSE education, modern campus facilities, and character building. Admissions open for 2026–27.",
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "School",
    name: "Indian Public School",
    alternateName: ["IPS Sambalpur", "Indian Public School Sambalpur"],
    url: baseUrl,
    logo: `${baseUrl}/assets/Logos/IPSLOGO.png`,
    image: `${baseUrl}/assets/Logos/IPSLOGO.png`,
    description:
      "Leading CBSE co-educational school committed to academic excellence, character building, and holistic education in Sambalpur, Odisha.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Main Road, Near RMC, Khetrajpur",
      addressLocality: "Sambalpur",
      addressRegion: "Odisha",
      postalCode: "768006",
      addressCountry: "IN",
    },
    telephone: ["+918114320555", "+919735181684"],
    email: "Ipssbp75@gmail.com",
    priceRange: "₹₹",
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "CBSE Affiliation",
      educationalLevel: "School Education (K-12)",
      recognizedBy: {
        "@type": "Organization",
        name: "Central Board of Secondary Education (CBSE), New Delhi",
      },
    },
  };

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


import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryAlbumClient } from "@/components/site/GalleryAlbumClient";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://indian-public-school-app.vercel.app";

export const metadata: Metadata = {
  title: "Campus Photo & Video Gallery | Indian Public School",
  description:
    "Explore photo galleries, annual functions, sports events, science exhibitions, and campus infrastructure photos at Indian Public School, Sambalpur.",
  keywords: [
    "Indian Public School Gallery",
    "School Campus Photos Sambalpur",
    "School Event Photos Odisha",
    "Indian Public School Facilities",
  ],
  alternates: {
    canonical: `${baseUrl}/gallery`,
  },
  openGraph: {
    title: "School Media Gallery | Indian Public School Sambalpur",
    description: "Browse pictures of campus life, academic projects, sports tournaments, and student activities.",
    url: `${baseUrl}/gallery`,
    siteName: "Indian Public School",
    locale: "en_IN",
    type: "website",
  },
};


export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-20 text-center text-muted-foreground">Loading Gallery...</div>}>
      <GalleryAlbumClient mode="everything" />
    </Suspense>
  );
}

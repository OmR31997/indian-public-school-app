import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryAlbumClient } from "@/components/site/GalleryAlbumClient";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://indian-public-school-app.vercel.app";

export const metadata: Metadata = {
  title: "Photo Albums & Media Collections | Indian Public School",
  description: "Browse photo albums, campus events, and media collections at Indian Public School.",
  alternates: {
    canonical: `${baseUrl}/gallery`,
  },
};


export default function GalleryAlbumRoutePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-20 text-center text-muted-foreground">Loading Photo Albums...</div>}>
      <GalleryAlbumClient mode="album" />
    </Suspense>
  );
}

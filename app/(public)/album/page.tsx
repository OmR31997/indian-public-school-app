import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryAlbumClient } from "@/components/site/GalleryAlbumClient";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://indian-public-school-app.vercel.app";

export const metadata: Metadata = {
  title: "School Photo Albums | Indian Public School",
  description: "Explore photo albums, campus events, and celebrations at Indian Public School.",
  alternates: {
    canonical: `${baseUrl}/gallery`,
  },
};


export default function AlbumIndexPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-20 text-center text-muted-foreground">Loading Photo Albums...</div>}>
      <GalleryAlbumClient mode="album" />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryAlbumClient } from "@/components/site/GalleryAlbumClient";

export const metadata: Metadata = {
  title: "School Photo Albums | Indian Public School",
  description: "Explore photo albums, events, campus architecture, and celebrations under /album/* at Indian Public School.",
};

export default function AlbumIndexPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-20 text-center text-muted-foreground">Loading Photo Albums...</div>}>
      <GalleryAlbumClient mode="album" />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryAlbumClient } from "@/components/site/GalleryAlbumClient";

export const metadata: Metadata = {
  title: "Photo Albums & Media Collections | Indian Public School",
  description: "Browse photo albums and media collections under /album/* at Indian Public School.",
};

export default function GalleryAlbumRoutePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-20 text-center text-muted-foreground">Loading Photo Albums...</div>}>
      <GalleryAlbumClient mode="album" />
    </Suspense>
  );
}

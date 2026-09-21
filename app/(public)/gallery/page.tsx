import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryAlbumClient } from "@/components/site/GalleryAlbumClient";
import { getPageSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageSeoMetadata("gallery", "/gallery");



export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-20 text-center text-muted-foreground">Loading Gallery...</div>}>
      <GalleryAlbumClient mode="everything" />
    </Suspense>
  );
}

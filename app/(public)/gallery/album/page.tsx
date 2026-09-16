import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryAlbumClient } from "@/components/site/GalleryAlbumClient";

export const metadata: Metadata = {
  title: "School Gallery & Photo Albums | Indian Public School",
  description: "Browse all photo albums, events, campus architecture, sports activities, and school celebrations at Indian Public School.",
};

export default function GalleryAlbumPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-20 text-center text-muted-foreground">Loading Photo Albums...</div>}>
      <GalleryAlbumClient />
    </Suspense>
  );
}

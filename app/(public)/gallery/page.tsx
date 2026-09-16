import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryAlbumClient } from "@/components/site/GalleryAlbumClient";

export const metadata: Metadata = {
  title: "Complete School Gallery & Media Repository | Indian Public School",
  description: "Browse all photo galleries, campus architecture, sports meets, cultural events, activities, and school celebrations at Indian Public School.",
};

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-20 text-center text-muted-foreground">Loading Gallery...</div>}>
      <GalleryAlbumClient mode="everything" />
    </Suspense>
  );
}

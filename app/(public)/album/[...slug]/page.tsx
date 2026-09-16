import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryAlbumClient } from "@/components/site/GalleryAlbumClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const albumTitle = slug
    .map((s) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" - ");

  return {
    title: `${albumTitle} - Photo Album | Indian Public School`,
    description: `Browse photo album ${albumTitle} at Indian Public School.`,
  };
}

export default async function AlbumSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const rawCat = slug[0] || "All";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background py-20 text-center text-muted-foreground">
          Loading Album...
        </div>
      }
    >
      <GalleryAlbumClient
        mode="album"
        initialCategoryName={rawCat}
        initialAlbum={slug.join("/")}
      />
    </Suspense>
  );
}

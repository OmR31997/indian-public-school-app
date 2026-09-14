"use client";

import {
  AnnouncementBar,
  Navbar,
  ScrollProgress,
} from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { BackToTop } from "@/components/site/BackToTop";
import { SiteDataProvider } from "@/components/site/SiteDataProvider";
import { FileViewerProvider } from "@/components/ui/FileViewerContext";
import type { SiteData } from "@/lib/site-data";

export function PublicLayoutClient({
  data,
  children,
}: {
  data: SiteData;
  children: React.ReactNode;
}) {
  return (
    <SiteDataProvider data={data}>
      <FileViewerProvider>
        <ScrollProgress />
        <AnnouncementBar />
        <Navbar />
        {children}
        <Footer />
        <BackToTop />
      </FileViewerProvider>
    </SiteDataProvider>
  );
}

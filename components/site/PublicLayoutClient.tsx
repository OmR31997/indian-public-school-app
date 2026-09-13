"use client";

import {
  AnnouncementBar,
  Navbar,
  ScrollProgress,
} from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { BackToTop } from "@/components/site/BackToTop";
import { SiteDataProvider } from "@/components/site/SiteDataProvider";
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
      <ScrollProgress />
      <AnnouncementBar />
      <Navbar />
      {children}
      <Footer />
      <BackToTop />
    </SiteDataProvider>
  );
}

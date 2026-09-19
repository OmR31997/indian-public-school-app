"use client";

import {
  AnnouncementBar,
  Navbar,
  ScrollProgress,
} from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { BackToTop } from "@/components/site/BackToTop";
import { WhatsAppChat } from "@/components/site/WhatsAppChat";
import { SiteDataProvider } from "@/components/site/SiteDataProvider";
import { FileViewerProvider } from "@/components/ui/FileViewerContext";
import { AdmissionApplicationModal } from "@/components/site/AdmissionApplicationModal";
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
        <WhatsAppChat />
        <BackToTop />
        <AdmissionApplicationModal />
      </FileViewerProvider>
    </SiteDataProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { homeData, imageUrl } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

import { SmartImage } from "@/components/ui/SmartImage";

export function BannerSlider() {
  const home = homeData(useSiteData());
  const banner = (home.banner as Record<string, unknown>) ?? {};
  const images = (Array.isArray(banner.fileUrls) ? banner.fileUrls : [])
    .map(imageUrl)
    .filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % images.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [images.length]);

  if (!images.length) return null;
  const changeSlide = (offset: number) =>
    setIndex((current) => (current + offset + images.length) % images.length);

  return (
    <section aria-label="School highlights" className="bg-secondary/40 py-10 lg:py-14">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
          <SmartImage
            src={images[index]!}
            alt={`Indian Public School highlight ${index + 1}`}
            className="aspect-[16/7] w-full object-cover"
          />
          {images.length > 1 ? (
            <>
              <button type="button" aria-label="Previous banner" onClick={() => changeSlide(-1)} className="absolute top-1/2 left-4 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-background/85 shadow-soft backdrop-blur hover:bg-background">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" aria-label="Next banner" onClick={() => changeSlide(1)} className="absolute top-1/2 right-4 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-background/85 shadow-soft backdrop-blur hover:bg-background">
                <ChevronRight className="size-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((_, slide) => <button key={slide} type="button" aria-label={`Show banner ${slide + 1}`} onClick={() => setIndex(slide)} className={`h-2 rounded-full transition-all ${slide === index ? "w-7 bg-gold" : "w-2 bg-background/80"}`} />)}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

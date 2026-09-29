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
              <button type="button" aria-label="Previous banner" onClick={() => changeSlide(-1)} className="absolute top-1/2 left-3 sm:left-4 -translate-y-1/2 text-white/75 hover:text-white transition-all hover:scale-125 active:scale-95 cursor-pointer p-2 focus:outline-none">
                <ChevronLeft className="size-7 sm:size-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
              </button>
              <button type="button" aria-label="Next banner" onClick={() => changeSlide(1)} className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 text-white/75 hover:text-white transition-all hover:scale-125 active:scale-95 cursor-pointer p-2 focus:outline-none">
                <ChevronRight className="size-7 sm:size-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
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

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EASE } from "@/lib/motion-presets";
import { firstSection, homeData, imageUrl, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";
import { SmartImage } from "@/components/ui/SmartImage";
import fallbackHeroImage from "@/assets/hero-campus.jpg";
import fallbackSiteData from "@/public/cloud-datasource.json";

export interface HeroSlide {
  bannerUrl: string;
  h1?: string;
  h2?: string;
  description?: string;
  enableOverlay?: boolean;
  showText?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

export function Hero() {
  const home = homeData(useSiteData());
  const hero = (home.hero as Record<string, unknown>) ?? {};
  const content = firstSection({ content: hero.content }, "content");

  // Dynamic Slide Rotation Duration (in milliseconds, e.g. 5000 = 5s)
  const rawDuration = hero.slideDuration ?? content.slideDuration ?? 5000;
  const slideDuration = typeof rawDuration === "number" && rawDuration >= 1000 ? rawDuration : 5000;

  // Fallback defaults
  const fallbackHeroConfig = (fallbackSiteData.home[0]?.hero as Record<string, unknown>) ?? {};
  const jsonHeroImage =
    imageUrl(fallbackHeroConfig.bannerUrl) ||
    imageUrl(Array.isArray(fallbackHeroConfig.fileUrls) ? fallbackHeroConfig.fileUrls[0] : "");

  // Build array of slides with per-slide properties
  const rawSlides: any[] = Array.isArray(hero.slides) ? hero.slides : [];
  const slides: HeroSlide[] = useMemoSlides(rawSlides, hero, content, jsonHeroImage, fallbackHeroImage.src);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide Timer Effect
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, slideDuration);
    return () => clearInterval(interval);
  }, [slides.length, slideDuration]);

  const currentSlide = slides[currentIndex] || slides[0]!;

  // Strict Overlay & Ambient Gradient Toggle (When enableOverlay === false -> 100% clean image, zero tint/gradient)
  const enableOverlay = currentSlide.enableOverlay !== false;
  const overlayColor = String(currentSlide.overlayColor || "#0a192f");
  const rawOpacity = currentSlide.overlayOpacity;
  const configuredOpacity =
    typeof rawOpacity === "number"
      ? Math.max(0, Math.min(1, rawOpacity))
      : typeof rawOpacity === "string" && !isNaN(parseFloat(rawOpacity))
        ? Math.max(0, Math.min(1, parseFloat(rawOpacity)))
        : 0.6;

  const overlayOpacity = enableOverlay ? configuredOpacity : 0;

  // Flexible Text Visibility Toggle (Can be turned ON/OFF per slide)
  const showText = currentSlide.showText !== false;

  const rawH1 = text(currentSlide.h1, showText ? "Where Curiosity Meets Excellence" : "");
  const rawH2 = text(currentSlide.h2, showText ? "Admissions Open 2026–27" : "");
  const rawDescription = text(
    currentSlide.description,
    showText ? "Empowering young minds with knowledge, character, creativity and confidence for a brighter tomorrow." : ""
  );

  const formattedH1 = rawH1.replace(/([a-z])([A-Z])/g, "$1 $2");
  const words = formattedH1.split(/\s+/).filter(Boolean);
  const hasTextContent = showText && (words.length > 0 || rawH2 || rawDescription);

  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "15%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.1]);

  const goToPrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);

  return (
    <section id="home" ref={ref} className="relative isolate min-h-[85svh] lg:min-h-[90svh] overflow-hidden bg-slate-950 flex items-center">
      {/* Background Banner Image with Smooth Cross-Fade Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.bannerUrl + currentIndex}
          style={{ y, scale }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 -z-20"
        >
          <SmartImage
            src={currentSlide.bannerUrl}
            fallbackSrc={jsonHeroImage || fallbackHeroImage.src}
            alt={rawH1 || "Indian Public School Campus Banner"}
            width={1920}
            height={1080}
            containerClassName="size-full"
            className="size-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Per-Slide Dynamic Overlay Layer (Rendered ONLY if enableOverlay === true) */}
      {enableOverlay && overlayOpacity > 0 && (
        <div
          className="absolute inset-0 -z-10 transition-all duration-500 pointer-events-none"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}

      {/* Ambient Gradient for Depth (Rendered ONLY if enableOverlay === true) */}
      {enableOverlay && (
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none"
          aria-hidden
        />
      )}

      {/* Main Banner Content (H1, H2, Description) - Rendered ONLY if showText === true */}
      {hasTextContent && (
        <div className="container-page relative z-10 py-20 lg:py-28 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={"content-" + currentIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5 }}
              className={`max-w-4xl ${!enableOverlay ? "drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] bg-black/40 p-6 sm:p-8 rounded-3xl backdrop-blur-xs border border-white/10" : ""}`}
            >
              {/* H2 Subheading / Session Badge */}
              {rawH2 && (
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-4 py-1.5 text-xs font-bold tracking-[0.16em] text-emerald-300 uppercase backdrop-blur-md shadow-md"
                >
                  <span>{rawH2}</span>
                </motion.h2>
              )}

              {/* H1 Main Heading */}
              {words.length > 0 && (
                <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] text-white sm:text-6xl lg:text-7xl drop-shadow-lg">
                  {words.map((word, i) => (
                    <motion.span
                      key={word + i}
                      className="mr-[0.28em] inline-block"
                      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        duration: 0.6,
                        delay: 0.08 + i * 0.06,
                        ease: EASE,
                      }}
                    >
                      {word === "Excellence" || word === "Future" || word === "Leaders" ? (
                        <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                          {word}
                        </span>
                      ) : (
                        word
                      )}
                    </motion.span>
                  ))}
                </h1>
              )}

              {/* Description Paragraph */}
              {rawDescription && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
                  className="mt-6 max-w-2xl text-base leading-relaxed text-slate-100 sm:text-lg lg:text-xl font-normal drop-shadow-md"
                >
                  {rawDescription}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Navigation Arrows & Indicator Dots (If multiple slides exist) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous Slide"
            onClick={goToPrev}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/70 hover:scale-110 cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Next Slide"
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-md transition hover:bg-black/70 hover:scale-110 cursor-pointer"
          >
            <ChevronRight size={22} />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex
                  ? "w-8 bg-emerald-400 shadow-xs"
                  : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// Helper to construct slide objects reliably
function useMemoSlides(
  rawSlides: any[],
  hero: Record<string, unknown>,
  content: Record<string, any>,
  jsonHeroImage: string,
  fallbackImage: string
): HeroSlide[] {
  if (Array.isArray(rawSlides) && rawSlides.length > 0) {
    return rawSlides.map((item: any) => ({
      bannerUrl:
        imageUrl(item.bannerUrl) ||
        imageUrl(item.imageUrl) ||
        jsonHeroImage ||
        fallbackImage,
      h1: item.h1 ?? item.title ?? content.h1 ?? content.title ?? "Where Curiosity Meets Excellence",
      h2: item.h2 ?? item.session ?? content.h2 ?? content.session ?? "Admissions Open 2026–27",
      description: item.description ?? content.description ?? "",
      enableOverlay: item.enableOverlay ?? hero.enableOverlay ?? true,
      showText: item.showText ?? hero.showText ?? true,
      overlayColor: item.overlayColor || hero.overlayColor || "#0a192f",
      overlayOpacity: item.overlayOpacity ?? hero.overlayOpacity ?? 0.6,
    }));
  }

  const fileUrls: string[] = Array.isArray(hero.fileUrls) ? hero.fileUrls : [];
  const primaryBanner = imageUrl(hero.bannerUrl) || (fileUrls[0] ? imageUrl(fileUrls[0]) : "");

  const listToUse = fileUrls.length > 0 ? fileUrls : primaryBanner ? [primaryBanner] : [fallbackImage];

  return listToUse.map((url) => ({
    bannerUrl: imageUrl(url) || fallbackImage,
    h1: content.h1 || content.title || "Where Curiosity Meets Excellence",
    h2: content.h2 || content.session || "Admissions Open 2026–27",
    description: content.description || "",
    enableOverlay: (content.enableOverlay ?? hero.enableOverlay) !== false,
    showText: (content.showText ?? hero.showText) !== false,
    overlayColor: content.overlayColor || hero.overlayColor || "#0a192f",
    overlayOpacity: content.overlayOpacity ?? hero.overlayOpacity ?? 0.6,
  }));
}

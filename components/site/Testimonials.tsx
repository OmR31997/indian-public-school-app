"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote, Star, User } from "lucide-react";
import { SectionHeading } from "@/components/site/Reveal";
import { EASE } from "@/lib/motion-presets";
import { homeData, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";
import { getOptionalApi, unwrapCollection } from "@/lib/api-client";
import { getAssetUrl } from "@/lib/utils";

function TestimonialAvatar({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);

  const cleanSrc = src && !src.includes("Anonymous.png") ? src : undefined;

  if (!cleanSrc || failed) {
    const initials = name
      ? name
          .trim()
          .split(/\s+/)
          .map((n) => n[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "";

    return (
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs border border-primary/20 shadow-xs"
        aria-hidden
      >
        {initials || <User className="size-5 text-primary/70" />}
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={name}
      onError={() => setFailed(true)}
      className="size-11 shrink-0 rounded-full object-cover border-2 border-gold/40 shadow-xs"
    />
  );
}

function getQuoteTypographyClass(length: number) {
  if (length > 220) {
    return "text-sm sm:text-base leading-relaxed sm:leading-7";
  }
  if (length > 120) {
    return "text-base sm:text-lg leading-relaxed sm:leading-8";
  }
  return "text-base sm:text-lg md:text-xl leading-relaxed sm:leading-8";
}

export function Testimonials() {
  const siteData = useSiteData();
  const initialReviews = (siteData.reviewsItems?.length
    ? siteData.reviewsItems
    : (Array.isArray(homeData(siteData).reviews) ? homeData(siteData).reviews as Record<string, unknown>[] : [])) || [];

  const [reviewsList, setReviewsList] = useState<Record<string, unknown>[]>(initialReviews);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadReviews() {
      const response = await getOptionalApi<any>("/reviews", { limit: 20, sortOrder: "desc", isApproved: "true" });
      const items = unwrapCollection(response);
      if (mounted && items && items.length > 0) {
        setReviewsList(items as Record<string, unknown>[]);
      }
    }
    loadReviews();
    return () => {
      mounted = false;
    };
  }, []);

  const items = reviewsList
    .filter((review) => review.isApproved !== false)
    .map((review) => {
      const quoteText = text(review.feedback || review.quote || review.message || review.comment);
      const nameText = text(review.name || review.author || review.title);
      if (!quoteText && !nameText) return null;

      const rawAvatar = text(
        review.avatar ||
        review.avatarUrl ||
        review.image ||
        review.photo ||
        review.photoUrl ||
        review.avatar_url ||
        review.userImage
      );

      const roleText = text(review.role);
      const batchText = text(review.batch);
      const resolvedRole = roleText
        ? roleText
        : batchText
          ? (batchText.toLowerCase().includes("batch") ? batchText : `Batch ${batchText}`)
          : "School Community";

      return {
        quote: quoteText,
        name: nameText || "Anonymous",
        role: resolvedRole,
        batch: batchText,
        rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
        avatar: rawAvatar ? getAssetUrl(rawAvatar) : undefined,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (next: number) => {
    if (!items.length) return;
    setDir(next > index || (index === items.length - 1 && next === 0) ? 1 : -1);
    setIndex((next + items.length) % items.length);
  };

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const t = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % items.length);
    }, 7000);
    return () => clearInterval(t);
  }, [items.length, isPaused]);

  if (!items.length) {
    return null;
  }

  const t = items[index] ?? items[0]!;
  const cleanQuote = t.quote
    .replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const quoteClass = getQuoteTypographyClass(cleanQuote.length);

  return (
    <section className="py-20 lg:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Testimonials"
          title="What families and students say"
          description="Voices from our community."
        />

        <div className="relative mx-auto mt-12 max-w-3xl">
          <div
            className="group relative min-h-[300px] overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-secondary/30 p-6 sm:p-10 shadow-lift transition-all hover:border-gold/30 hover:shadow-xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Subtle background quote watermark */}
            <Quote
              className="pointer-events-none absolute -bottom-6 -right-6 size-36 text-primary/[0.03] dark:text-primary/[0.06] -rotate-12 select-none"
              aria-hidden
            />

            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.blockquote
                key={index}
                custom={dir}
                initial={{ opacity: 0, x: dir * 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -30 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="relative z-10 flex min-h-[220px] flex-col justify-between"
              >
                {/* Header: badge + rating */}
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30 shadow-2xs">
                      <Quote className="size-4.5 fill-gold/20 text-gold" aria-hidden />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Testimonial
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/70 px-3 py-1 text-xs font-medium backdrop-blur-xs">
                    <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-foreground">{t.rating}.0</span>
                  </div>
                </div>

                {/* Quote text */}
                <div className="py-5 sm:py-6">
                  <p className={`font-normal text-foreground/85 italic tracking-normal ${quoteClass}`}>
                    “{cleanQuote}”
                  </p>
                </div>

                {/* Author footer */}
                <footer className="flex items-center justify-between gap-4 border-t border-border/50 pt-4">
                  <div className="flex items-center gap-3.5">
                    <TestimonialAvatar src={t.avatar} name={t.name} />
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{t.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{t.role}</span>
                        {t.batch && t.batch !== t.role && !t.role.includes(t.batch) && (
                          <>
                            <span className="size-1 rounded-full bg-border" />
                            <span className="text-xs text-muted-foreground font-medium">{t.batch}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {items.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous testimonial"
                className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition-all hover:-translate-x-0.5 hover:bg-secondary hover:border-gold/40 shadow-2xs active:scale-95"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="flex items-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: i === index ? 32 : 8,
                      backgroundColor: i === index ? "var(--gold)" : "var(--border)",
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next testimonial"
                className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition-all hover:translate-x-0.5 hover:bg-secondary hover:border-gold/40 shadow-2xs active:scale-95"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}



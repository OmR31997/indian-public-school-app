import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/site/Reveal";
import { EASE } from "@/lib/motion-presets";
import { homeData, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

const TESTIMONIALS = [
  {
    quote:
      "The teachers know our daughter as a person, not a roll number. Her confidence in speaking and writing has grown remarkably in two years.",
    name: "Parent of a Grade VI student",
    role: "Parent · Middle School",
    rating: 5,
  },
  {
    quote:
      "I joined the robotics club in Grade VIII and it changed what I want to study. The labs are open, and teachers actually encourage experiments that fail.",
    name: "Student, Grade X",
    role: "Student · Secondary",
    rating: 5,
  },
  {
    quote:
      "Communication from the school is clear and regular. Parent-teacher meetings are honest and always end with a practical plan for the term ahead.",
    name: "Parent of a Grade III student",
    role: "Parent · Primary",
    rating: 5,
  },
  {
    quote:
      "Balancing board preparation with basketball felt impossible until my mentor helped me build a schedule. I managed both without burning out.",
    name: "Student, Grade XII",
    role: "Student · Senior Secondary",
    rating: 5,
  },
];

export function Testimonials() {
  const siteData = useSiteData();
  const fallbackReviews = homeData(siteData).reviews;
  const testimonials = siteData.reviewsItems?.length
    ? siteData.reviewsItems
    : (Array.isArray(fallbackReviews) ? fallbackReviews as Record<string, unknown>[] : []);
  const items = testimonials.length ? testimonials.map((review) => ({
    quote: text(review.feedback),
    name: text(review.name),
    role: text(review.batch, "School community"),
    rating: Number(review.rating) || 5,
  })) : TESTIMONIALS;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (next: number) => {
    setDir(next > index || (index === items.length - 1 && next === 0) ? 1 : -1);
    setIndex((next + items.length) % items.length);
  };

  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % items.length);
    }, 7000);
    return () => clearInterval(t);
  }, [items.length]);

  const t = items[index] ?? items[0]!;

  return (
    <section className="py-20 lg:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Testimonials"
          title="What families and students say"
          description="Voices from our community. Names are withheld as placeholders until the school shares approved quotes."
        />

        <div className="relative mx-auto mt-14 max-w-3xl">
          <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-lift sm:min-h-[280px] sm:p-12">
            <Quote className="size-9 text-gold" aria-hidden />
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.blockquote
                key={index}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <p className="mt-5 font-display text-xl leading-snug sm:text-2xl">&quot;{t.quote}&quot;</p>
                <footer className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5" aria-label={`${t.rating} out of 5`}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-gold text-gold" />
                    ))}
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous testimonial"
              className="grid size-10 place-items-center rounded-full border border-border transition-all hover:-translate-x-0.5 hover:bg-secondary"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className="h-1.5 rounded-full bg-border transition-all"
                  style={{
                    width: i === index ? 28 : 10,
                    backgroundColor: i === index ? "var(--gold)" : undefined,
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next testimonial"
              className="grid size-10 place-items-center rounded-full border border-border transition-all hover:translate-x-0.5 hover:bg-secondary"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

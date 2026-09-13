import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowRight, Compass, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import {
  firstSection,
  homeData,
  imageUrl,
  text,
  textList,
} from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

export function About() {
  const section = firstSection(homeData(useSiteData()), "section-1");
  const descriptions = textList(section.description);
  const cards = Array.isArray(section.cardItem)
    ? (section.cardItem as Record<string, unknown>[])
    : [];
  const brief = Array.isArray(section.briefCard)
    ? (section.briefCard[0] as Record<string, unknown>)
    : {};
  const briefImage = imageUrl(brief.fileUrl);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["-6%", reduced ? "-6%" : "8%"],
  );

  return (
    <section id="about" className="py-20 lg:py-32">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div ref={ref} className="relative">
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            whileInView={{ clipPath: "inset(0 0 0% 0)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-[2rem] shadow-lift"
          >
            {briefImage ? (
              <motion.img
                style={{ y }}
                src={briefImage}
                alt="A teacher guiding students in a bright, technology-enabled classroom"
                width={1400}
                height={1600}
                loading="lazy"
                className="aspect-[4/5] w-full scale-110 object-cover"
              />
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.8,
              delay: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute -right-2 -bottom-8 hidden w-56 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-lift sm:block lg:-right-10"
          >
            {briefImage ? (
              <img
                src={briefImage}
                alt="Aerial view of the school campus and sports grounds"
                width={1600}
                height={900}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            ) : null}
            <p className="px-2 py-2 text-xs font-semibold text-muted-foreground">
              {text(brief.heading)}
            </p>
          </motion.div>
        </div>

        <div>
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-gold" aria-hidden />
              {text(section.heading)}
            </span>
            <h2 className="mt-4 text-3xl leading-[1.1] sm:text-4xl lg:text-5xl">
              {text(section.subHeading)}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {descriptions[0]}
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {descriptions[1]}
            </p>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {cards.map((card, i) => {
              const Icon = i === 0 ? Target : Compass;
              const title = text(card.heading);
              const redirectUrl = text(card.redirectUrl);
              return (
                <Reveal key={`${title || "about-card"}-${i}`} delay={0.1 * i}>
                  <a
                    href={redirectUrl || undefined}
                    className="block h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-lg">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {text(card.description)}
                    </p>
                  </a>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.2}>
            <Button asChild size="lg" className="group mt-8 rounded-full">
              <a href="#academics">
                {text(
                  (section.btnLinkText as Record<string, unknown> | undefined)
                    ?.text,
                  "Discover Our Story",
                )}
                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

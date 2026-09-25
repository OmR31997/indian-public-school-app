import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowRight,
  Building2,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/motion-presets";
import { firstSection, homeData, imageUrl, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";
import { openAdmissionModal } from "@/components/site/AdmissionApplicationModal";
import fallbackHeroImage from "@/assets/hero-campus.jpg";

const BADGES = [
  { icon: ShieldCheck, label: "CBSE Affiliated" },
  { icon: Sparkles, label: "Holistic Education" },
  { icon: Building2, label: "Modern Campus" },
];

export function Hero() {
  const home = homeData(useSiteData());
  const hero = (home.hero as Record<string, unknown>) ?? {};
  const content = firstSection({ content: hero.content }, "content");
  const rawTitle = text(content.title, "Where Curiosity Meets Excellence");
  const formattedTitle = rawTitle.replace(/([a-z])([A-Z])/g, "$1 $2");
  const words = formattedTitle.split(/\s+/).filter(Boolean);
  const heroImage =
    imageUrl(Array.isArray(hero.fileUrls) ? hero.fileUrls[0] : "") ||
    fallbackHeroImage.src;
  const badges = Array.isArray(content.icoBtn)
    ? (content.icoBtn as Record<string, unknown>[])
    : [];
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", reduced ? "0%" : "18%"],
  );
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.12]);
  const veil = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  return (
    <section id="home" ref={ref} className="relative isolate overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-20">
        <img
          src={heroImage}
          alt="Students walking through the Indian Public School campus at golden hour"
          width={1920}
          height={1200}
          className="size-full object-cover object-[70%_20%] lg:object-[75%_25%]"
        />
      </motion.div>
      <motion.div
        style={{ opacity: veil }}
        className="absolute inset-0 -z-10"
        aria-hidden
      >
        <div
          className="size-full"
          style={{ backgroundImage: "var(--gradient-hero-veil)" }}
        />
      </motion.div>

      <div className="container-page relative flex min-h-[88svh] flex-col justify-center py-20 lg:min-h-[92svh] lg:py-28">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-navy-foreground/25 bg-navy-foreground/10 px-4 py-1.5 text-xs font-semibold tracking-[0.16em] text-navy-foreground uppercase backdrop-blur-sm"
        >
          <span className="size-1.5 rounded-full bg-gold" />
          {text(content.session, "Admissions Open")}
        </motion.span>

        <h1 className="mt-6 max-w-4xl font-display text-4xl leading-[1.05] text-navy-foreground sm:text-6xl lg:text-7xl">
          {words.map((word, i) => (
            <motion.span
              key={word + i}
              className="mr-[0.28em] inline-block"
              initial={{ opacity: 0, y: 36, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.85,
                delay: 0.15 + i * 0.09,
                ease: EASE,
              }}
            >
              {word === "Excellence" ? (
                <span className="text-gradient-gold">{word}</span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          className="mt-6 max-w-xl text-base leading-relaxed text-navy-foreground/85 sm:text-lg"
        >
          {text(content.description)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            variant="gold"
            className="group rounded-full"
          >
            <a
              href={text(
                (Array.isArray(content.linksBtn)
                  ? (content.linksBtn[0] as Record<string, unknown>)
                  : {}
                ).url,
                "#about",
              )}
            >
              {text(
                (Array.isArray(content.linksBtn)
                  ? (content.linksBtn[0] as Record<string, unknown>)
                  : {}
                ).text,
                "Explore Our School",
              )}
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="glass"
            onClick={() => openAdmissionModal()}
            className="group rounded-full cursor-pointer"
          >
            <Play className="mr-1 size-4" />
            {text(
              (Array.isArray(content.linksBtn)
                ? (content.linksBtn[1] as Record<string, unknown>)
                : {}
              ).text,
              "Apply for Admission",
            )}
          </Button>
        </motion.div>

        <motion.ul
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.9 } },
          }}
          className="mt-12 flex flex-wrap gap-3"
        >
          {(badges.length
            ? badges
            : BADGES.map((badge) => ({ text: badge.label }))
          ).map((badge, i) => {
            const Icon = BADGES[i % BADGES.length]!.icon;
            const label = text(badge.text, BADGES[i % BADGES.length]!.label);
            return (
              <motion.li
                key={`${label || "hero-badge"}-${i}`}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: EASE },
                  },
                }}
                className="flex items-center gap-2 rounded-full border border-navy-foreground/20 bg-navy-foreground/10 px-4 py-2 text-xs font-semibold text-navy-foreground backdrop-blur-md sm:text-sm"
              >
                <Icon className="size-4 text-gold" />
                {label}
              </motion.li>
            );
          })}
        </motion.ul>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 lg:block"
        aria-hidden
      >
        <motion.div
          animate={reduced ? {} : { y: [0, 10, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-navy-foreground/40 p-1.5"
        >
          <span className="size-1.5 rounded-full bg-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}

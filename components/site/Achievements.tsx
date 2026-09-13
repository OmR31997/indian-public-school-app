import { motion } from "motion/react";
import { Counter } from "@/components/site/Counter";
import { SectionHeading } from "@/components/site/Reveal";
import { EASE } from "@/lib/motion-presets";
import {
  firstSection,
  homeData,
  imageUrl,
  text,
  textList,
} from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

const NUMBERS = [
  {
    value: 98,
    suffix: "%",
    label: "Board pass rate",
    note: "Indicative placeholder",
  },
  {
    value: 60,
    suffix: "+",
    label: "Olympiad medals",
    note: "Across recent sessions",
  },
  {
    value: 35,
    suffix: "+",
    label: "Inter-school titles",
    note: "Sports & culture",
  },
  {
    value: 12,
    suffix: "+",
    label: "State-level athletes",
    note: "Represented the region",
  },
];

const CARDS = [
  {
    title: "Academic Distinction",
    text: "Consistent CBSE board results with students earning distinctions across science, commerce and humanities streams.",
  },
  {
    title: "Sporting Success",
    text: "Regular podium finishes at district and state meets in athletics, football, chess and badminton.",
  },
  {
    title: "Creative Recognition",
    text: "Awards in inter-school music, dance, debate and art competitions through the academic calendar.",
  },
];

export function Achievements() {
  const section = firstSection(homeData(useSiteData()), "section-8");
  const cards = Array.isArray(section.cardItem)
    ? (section.cardItem as Record<string, unknown>[])
    : [];
  const achievementImage = imageUrl(
    Array.isArray(section.fileUrls) ? section.fileUrls[0] : "",
  );
  return (
    <section className="surface-navy relative overflow-hidden py-20 lg:py-32">
      <div className="container-page relative">
        <SectionHeading
          eyebrow="Achievements"
          title={text(section.heading, "Achievements")}
          description={textList(section.description)[0]}
          tone="dark"
        />

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4"
        >
          {NUMBERS.map((n) => (
            <motion.li
              key={n.label}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, ease: EASE },
                },
              }}
              className="rounded-3xl border border-navy-foreground/15 bg-navy-foreground/5 p-6 backdrop-blur-sm"
            >
              <p className="font-display text-3xl font-semibold text-gold sm:text-4xl">
                <Counter to={n.value} suffix={n.suffix} />
              </p>
              <p className="mt-3 text-sm font-semibold text-navy-foreground">
                {n.label}
              </p>
              <p className="mt-1 text-xs text-navy-foreground/60">{n.note}</p>
            </motion.li>
          ))}
        </motion.ul>

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="overflow-hidden rounded-3xl shadow-lift"
          >
            {achievementImage ? (
              <img
                src={achievementImage}
                alt="Students celebrating with trophies and certificates at a school assembly"
                width={1200}
                height={1200}
                loading="lazy"
                className="aspect-[5/4] w-full object-cover"
              />
            ) : null}
          </motion.div>

          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
            className="space-y-4"
          >
            {(cards.length
              ? cards
              : CARDS.map((c) => ({ heading: c.title, description: c.text }))
            ).map((c, i) => (
              <motion.li
                key={`${text(c.heading, "achievement-card")}-${i}`}
                variants={{
                  hidden: { opacity: 0, x: 30 },
                  show: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.6, ease: EASE },
                  },
                }}
                className="rounded-2xl border border-navy-foreground/15 bg-navy-foreground/5 p-6 transition-colors hover:bg-navy-foreground/10"
              >
                <h3 className="text-lg text-navy-foreground">
                  {text(c.heading)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-foreground/70">
                  {text(c.description)}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

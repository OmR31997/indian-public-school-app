import { motion } from "motion/react";
import { SectionHeading } from "@/components/site/Reveal";
import { EASE } from "@/lib/motion-presets";
import { firstSection, homeData, text, textList } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

const STAGES = [
  {
    stage: "Pre-Primary",
    grades: "Nursery – KG",
    text: "Play-based learning, phonics, motor skills and gentle routines that make school feel like a happy second home.",
  },
  {
    stage: "Primary",
    grades: "Grades I – V",
    text: "Strong foundations in language, mathematics and enquiry, supported by activity-led classrooms and reading habits.",
  },
  {
    stage: "Middle School",
    grades: "Grades VI – VIII",
    text: "Concept clarity across sciences, humanities and languages, with projects, labs and structured study skills.",
  },
  {
    stage: "Secondary",
    grades: "Grades IX – X",
    text: "Focused CBSE board preparation, regular assessment cycles and mentoring for confident performance.",
  },
  {
    stage: "Senior Secondary",
    grades: "Grades XI – XII",
    text: "Science, Commerce and Humanities streams with career counselling and competitive exam guidance.",
  },
];

export function Academics() {
  const section = firstSection(homeData(useSiteData()), "section-4");
  const stages = Array.isArray(section.cardItem)
    ? (section.cardItem as Record<string, unknown>[])
    : [];
  return (
    <section id="academics" className="bg-secondary/40 py-20 lg:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Academics"
          title={text(section.mainHeading)}
          description={textList(section.description)[0]}
        />

        <div className="relative mt-16">
          <motion.span
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="absolute top-0 bottom-0 left-4 w-px origin-top bg-border md:left-1/2"
            aria-hidden
          />

          <ol className="space-y-8 md:space-y-14">
            {(stages.length
              ? stages
              : STAGES.map((s) => ({
                  mainHeading: s.stage,
                  heading: s.grades,
                  description: s.text,
                }))
            ).map((s, i) => (
              <motion.li
                key={`${text(s.mainHeading, "academic-stage")}-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="relative pl-12 md:grid md:grid-cols-2 md:gap-12 md:pl-0"
              >
                <span
                  className="absolute top-6 left-4 z-10 grid size-8 -translate-x-1/2 place-items-center rounded-full border-4 border-background bg-primary text-[11px] font-bold text-primary-foreground md:left-1/2"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div
                  className={
                    i % 2 === 0
                      ? "md:col-start-1 md:pr-6 md:text-right"
                      : "md:col-start-2 md:pl-6"
                  }
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift sm:p-8"
                  >
                    <span className="eyebrow">{text(s.heading)}</span>
                    <h3 className="mt-3 text-xl sm:text-2xl">
                      {text(s.mainHeading)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {text(s.description)}
                    </p>
                  </motion.div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

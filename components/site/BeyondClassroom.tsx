import { motion } from "motion/react";
import {
  Award,
  Compass,
  Drama,
  Globe2,
  Music4,
  Palette,
  Trophy,
  Users2,
} from "lucide-react";
import { SectionHeading } from "@/components/site/Reveal";
import { EASE } from "@/lib/motion-presets";
import { firstSection, homeData, text, textList } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

const ITEMS = [
  {
    icon: Trophy,
    title: "Sports",
    text: "Inter-house leagues, athletics meets and daily coaching.",
  },
  {
    icon: Music4,
    title: "Music",
    text: "Vocal, keyboard, percussion and school ensemble.",
  },
  {
    icon: Drama,
    title: "Dance",
    text: "Classical and contemporary forms, staged every term.",
  },
  {
    icon: Palette,
    title: "Art",
    text: "Drawing, painting, pottery and design thinking studios.",
  },
  {
    icon: Users2,
    title: "Clubs",
    text: "Robotics, eco, debate, literary, coding and photography.",
  },
  {
    icon: Award,
    title: "Competitions",
    text: "Olympiads, quizzes, MUN and inter-school festivals.",
  },
  {
    icon: Globe2,
    title: "Educational Tours",
    text: "Field visits, heritage walks and residential trips.",
  },
  {
    icon: Compass,
    title: "Leadership",
    text: "Student council, house captains and peer mentoring.",
  },
];

export function BeyondClassroom() {
  const section = firstSection(homeData(useSiteData()), "section-5");
  const items = Array.isArray(section.cardItem)
    ? (section.cardItem as Record<string, unknown>[])
    : [];
  const classroomItems: Record<string, unknown>[] = items.length
    ? items
    : ITEMS.map((item) => ({
        heading: item.title,
        description: item.text,
      }));
  return (
    <section id="campus-life" className="overflow-hidden py-20 lg:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Learning Beyond the Classroom"
          title={text(section.mainHeading)}
          description={textList(section.description)[0]}
          align="left"
        />
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 [scrollbar-width:thin] lg:px-[max(1.25rem,calc((100vw-84rem)/2+1.25rem))]"
      >
        {classroomItems.map((item, index) => {
          const fallback = ITEMS[index % ITEMS.length]!;
          const Icon = fallback.icon;
          const title = text(item.heading, fallback.title);
          const redirectUrl = text(item.redirectUrl);
          return (
            <motion.a
              key={`${title}-${index}`}
              href={redirectUrl || undefined}
              variants={{
                hidden: { opacity: 0, x: 40 },
                show: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.6, ease: EASE },
                },
              }}
              whileHover={{ y: -8 }}
              className="group w-[72vw] shrink-0 snap-start rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift sm:w-[300px]"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {text(item.description, fallback.text)}
              </p>
            </motion.a>
          );
        })}
      </motion.div>
      <p className="container-page text-xs text-muted-foreground">
        Scroll sideways to see more →
      </p>
    </section>
  );
}

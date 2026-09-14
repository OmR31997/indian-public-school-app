import { motion } from "motion/react";
import { ArrowUpRight, CalendarDays, Megaphone, Newspaper } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/site/Reveal";
import { EASE } from "@/lib/motion-presets";
import { Badge } from "@/components/ui/badge";
import { firstSection, homeData, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

const POSTS = [
  {
    type: "Latest News",
    icon: Newspaper,
    date: "14 Sep 2026",
    title: "Annual Science Exhibition showcases student-built prototypes",
    text: "Middle and senior school teams presented working models on energy, water and accessibility.",
  },
  {
    type: "Event",
    icon: CalendarDays,
    date: "14 Sep 2026",
    title: "Inter-house Athletics Meet returns to the main ground",
    text: "Four houses compete across track, field and relay events, followed by the prize ceremony.",
  },
  {
    type: "Announcement",
    icon: Megaphone,
    date: "14 Sep 2026",
    title: "Admission forms for Session 2026–27 are now available",
    text: "Applications for Nursery to Grade IX may be submitted online or at the school office.",
  },
  {
    type: "Press Release",
    icon: Newspaper,
    date: "14 Sep 2026",
    title: "School expands its digital learning and robotics programme",
    text: "New workstations and a dedicated maker space will support coding from Grade IV upwards.",
  },
];

function formatDate(rawDate?: string, fallback: string = "") {
  if (!rawDate) return fallback;
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return rawDate;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function NewsEvents() {
  const siteData = useSiteData();
  const section = firstSection(homeData(siteData), "section-10");
  const fallbackPosts = Array.isArray(section.list)
    ? (section.list as Record<string, unknown>[])
    : [];
  const posts = siteData.news?.length ? siteData.news : fallbackPosts;
  return (
    <section className="bg-secondary/40 py-20 lg:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="News & Events"
          title="Happening at Indian Public School"
          description={text(
            section.description,
            "Announcements, events and updates from the school community.",
          )}
        />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ show: { transition: { staggerChildren: 0.09 } } }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {posts.map((post, index) => {
            const fallback = POSTS[index % POSTS.length]!;
            const Icon = fallback.icon;
            const redirectUrl = text(post.redirectUrl)?.trim();
            const hasLink = Boolean(redirectUrl);
            const p = {
              type: text(post.type, fallback.type),
              date: formatDate(text(post.createdAt), fallback.date),
              title: text(post.title, fallback.title),
              text: text(post.description, fallback.text),
            };

            const isExternal = redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://");

            const cardContent = (
              <motion.article
                key={`${p.title || "news-item"}-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: EASE },
                  },
                }}
                whileHover={hasLink ? { y: -6 } : undefined}
                className={`group flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-soft transition-all ${
                  hasLink ? "hover:shadow-lift hover:border-primary/40 cursor-pointer" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="gap-1.5 rounded-full">
                    <Icon className="size-3.5" />
                    {p.type}
                  </Badge>
                  {hasLink && (
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </div>
                <p className="mt-5 text-xs font-medium text-muted-foreground">
                  {p.date}
                </p>
                <h3 className="mt-2 text-lg leading-snug">{p.title}</h3>
                {p.text && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {p.text}
                  </p>
                )}
              </motion.article>
            );

            if (hasLink) {
              if (isExternal) {
                return (
                  <a
                    key={`${p.title || "news-item"}-${index}`}
                    href={redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full no-underline"
                  >
                    {cardContent}
                  </a>
                );
              }
              return (
                <Link
                  key={`${p.title || "news-item"}-${index}`}
                  href={redirectUrl}
                  className="block h-full no-underline"
                >
                  {cardContent}
                </Link>
              );
            }

            return cardContent;
          })}
        </motion.div>
      </div>
    </section>
  );
}

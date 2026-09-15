import { motion } from "motion/react";
import { ArrowUpRight, CalendarDays, Megaphone, Newspaper } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/site/Reveal";
import { EASE } from "@/lib/motion-presets";
import { Badge } from "@/components/ui/badge";
import { firstSection, homeData, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";
import { useFileViewer } from "@/components/ui/FileViewerContext";
import { isPdfFile, getCloudinaryInlineViewerUrl, normalizePdfUrl } from "@/lib/file-preview";

interface NewsPost {
  type: string;
  icon: any;
  date: string;
  title: string;
  text: string;
  redirectUrl?: string;
}

const POSTS: NewsPost[] = [
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

export function NewsEvents() {
  const siteData = useSiteData();
  const sec = firstSection(homeData(siteData), "section-10");
  const rawNewsList = siteData?.news || [];
  const { openFileViewer } = useFileViewer();

  const newsList: NewsPost[] =
    rawNewsList.length > 0
      ? rawNewsList.map((item: any) => ({
          type: item.category || "Update",
          icon: Newspaper,
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recent",
          title: item.title,
          text: item.content || item.summary || "",
          redirectUrl: normalizePdfUrl(item.linkUrl || item.imageUrl || item.attachmentUrl || item.fileUrl || ""),
        }))
      : POSTS;

  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={text(sec?.badge, "Updates & Highlights")}
          title={text(sec?.title, "Latest from IPS")}
          description={text(
            sec?.description,
            "News, upcoming events, academic achievements and announcements."
          )}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="mt-14 grid gap-6 md:grid-cols-3"
        >
          {newsList.map((p, index) => {
            const Icon = p.icon || Newspaper;
            const redirectUrl = p.redirectUrl ? String(p.redirectUrl).trim() : "";
            const hasLink = Boolean(redirectUrl);
            const isPdf = isPdfFile(redirectUrl);
            const isExternal = redirectUrl.startsWith("http://") || redirectUrl.startsWith("https://");

            const cardContent = (
              <motion.article
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                }}
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
              if (isPdf) {
                return (
                  <div
                    key={`${p.title || "news-item"}-${index}`}
                    onClick={() => openFileViewer(redirectUrl, p.title)}
                    className="block h-full no-underline"
                  >
                    {cardContent}
                  </div>
                );
              }
              if (isExternal) {
                const inlineTarget = getCloudinaryInlineViewerUrl(redirectUrl);
                return (
                  <a
                    key={`${p.title || "news-item"}-${index}`}
                    href={inlineTarget}
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

            return (
              <div key={`${p.title || "news-item"}-${index}`} className="block h-full">
                {cardContent}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

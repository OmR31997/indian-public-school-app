import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { SectionHeading } from "@/components/site/Reveal";
import { EASE } from "@/lib/motion-presets";
import { cn } from "@/lib/utils";
import { homeData, imageUrls, imageUrl, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

type Category = "Campus" | "Events" | "Sports" | "Activities" | "Hostel" | "Arts";

const CATEGORIES = ["All", "Campus", "Events", "Sports", "Activities", "Hostel", "Arts"] as const;

function isStaffOrStudentItem(item: Record<string, unknown>): boolean {
  const type = String(item.eventType || item.type || "").toLowerCase().trim();
  const name = String(item.eventName || item.title || item.name || "").toLowerCase().trim();
  const cat = String(item.category || "").toLowerCase().trim();
  const tags = Array.isArray(item.tags)
    ? item.tags.map((t) => String(t).toLowerCase())
    : [String(item.tags || "").toLowerCase()];

  const forbiddenTerms = ["staff", "staffs", "teacher", "teachers", "faculty", "student", "students", "profile", "avatar"];

  if (forbiddenTerms.some((term) => type === term || type.includes(`${term}_`) || type.includes(`_${term}`))) return true;
  if (forbiddenTerms.some((term) => cat === term)) return true;
  if (forbiddenTerms.some((term) => tags.includes(term))) return true;
  if (
    name.includes("staff photo") ||
    name.includes("student photo") ||
    name.includes("staff profile") ||
    name.includes("student profile")
  ) {
    return true;
  }
  return false;
}

function isStaffOrStudentUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes("/staff/") ||
    lower.includes("/staffs/") ||
    lower.includes("/student/") ||
    lower.includes("/students/") ||
    lower.includes("/profiles/") ||
    lower.includes("/avatars/") ||
    lower.includes("staff_photo") ||
    lower.includes("student_photo") ||
    lower.includes("staff-photo") ||
    lower.includes("student-photo") ||
    lower.includes("staff_profile") ||
    lower.includes("student_profile")
  ) && !lower.includes("campus");
}

function mapEventTypeToCategory(rawType: unknown): Category {
  const t = text(rawType, "Campus").trim();
  if (["Campus", "Events", "Sports", "Activities", "Hostel", "Arts"].includes(t)) {
    return t as Category;
  }
  const lower = t.toLowerCase();
  if (lower.includes("sports") || lower.includes("winner")) return "Sports";
  if (
    lower.includes("activity") ||
    lower.includes("skill") ||
    lower.includes("experiential") ||
    lower.includes("training") ||
    lower.includes("trip") ||
    lower.includes("speech")
  ) {
    return "Activities";
  }
  if (lower.includes("hostel")) return "Hostel";
  if (lower.includes("art") || lower.includes("cultural")) return "Arts";
  if (lower.includes("campus")) return "Campus";
  return "Events";
}

export function Gallery() {
  const siteData = useSiteData();
  const home = homeData(siteData);
  const gallery = siteData.galleryItems?.length ? siteData.galleryItems : home.gallery;

  const galleryImages = useMemo(() => {
    return (Array.isArray(gallery) ? (gallery as Record<string, unknown>[]) : [])
      .filter((item) => !isStaffOrStudentItem(item))
      .flatMap((item) => {
        const category = mapEventTypeToCategory(item.eventType);
        const eventName = text(item.eventName, "School gallery");
        return imageUrls(item)
          .filter((file) => !isStaffOrStudentUrl(file))
          .map((file) => ({
            src: file,
            alt: eventName,
            cat: category,
          }));
      });
  }, [gallery]);

  const banner = (home.banner as Record<string, unknown>) ?? {};
  const bannerImages = useMemo(() => {
    return (Array.isArray(banner.fileUrls) ? banner.fileUrls : []).map((file, index) => ({
      src: imageUrl(file),
      alt: `School campus image ${index + 1}`,
      cat: "Campus" as Category,
    }));
  }, [banner.fileUrls]);

  // Strict deduplication by image URL so uploaded images never appear multiple times
  const visibleImages = useMemo(() => {
    const seen = new Set<string>();
    return (galleryImages.length ? galleryImages : bannerImages).filter((image) => {
      if (!image.src || isStaffOrStudentUrl(image.src)) return false;
      if (seen.has(image.src)) return false;
      seen.add(image.src);
      return true;
    });
  }, [galleryImages, bannerImages]);

  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const shown = useMemo(
    () => visibleImages.filter((i) => active === "All" || i.cat === active),
    [active, visibleImages],
  );

  return (
    <section id="gallery" className="py-20 lg:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Gallery"
          title="Moments from around the school"
          description="A glimpse of campus, classrooms, competitions and celebrations through the year."
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active === c ? "text-primary-foreground" : "text-foreground hover:bg-secondary",
              )}
            >
              {active === c ? (
                <motion.span
                  layoutId="gallery-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ duration: 0.4, ease: EASE }}
                />
              ) : null}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>

        <motion.div layout className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          <AnimatePresence mode="popLayout">
            {shown.map((img, i) => (
              <motion.button
                key={`${img.src}-${i}`}
                layout
                type="button"
                onClick={() => setLightbox(visibleImages.indexOf(img))}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, ease: EASE, delay: i * 0.03 }}
                className="group block w-full break-inside-avoid overflow-hidden rounded-2xl shadow-soft"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightbox !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] grid place-items-center bg-navy-deep/90 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              src={visibleImages[lightbox]!.src}
              alt={visibleImages[lightbox]!.alt}
              className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain shadow-lift"
            />
            <button
              type="button"
              aria-label="Close image"
              onClick={() => setLightbox(null)}
              className="absolute top-5 right-5 grid size-11 place-items-center rounded-full border border-navy-foreground/30 text-navy-foreground transition-colors hover:bg-navy-foreground/15"
            >
              <X className="size-5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/site/Reveal";
import { EASE } from "@/lib/motion-presets";
import { cn } from "@/lib/utils";
import { homeData, imageUrls, imageUrl, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";
import { getOptionalApi, unwrapCollection } from "@/lib/api-client";

type Category = "Campus" | "Events" | "Sports" | "Activities" | "Hostel" | "Arts";

const CATEGORIES: ("All" | Category)[] = ["All", "Campus", "Events", "Sports", "Activities", "Hostel", "Arts"];

interface AlbumImage {
  src: string;
  alt: string;
  category: Category | "Banners";
  album: string;
  directory?: string;
  directoryName?: string;
}

const FORBIDDEN_TERMS = [
  "staff",
  "staffs",
  "teacher",
  "teachers",
  "faculty",
  "student",
  "students",
  "profile",
  "profiles",
  "avatar",
  "avatars",
  "press",
  "pressrelease",
  "press-release",
  "press_release",
  "news release",
  "media release",
  "press_doc",
];

function isStaffStudentOrPressItem(item: Record<string, unknown>): boolean {
  if (!item) return false;
  const type = String(item.eventType || item.type || item.directory || "").toLowerCase().trim();
  const name = String(item.eventName || item.title || item.name || item.album || "").toLowerCase().trim();
  const cat = String(item.category || "").toLowerCase().trim();
  const tags = Array.isArray(item.tags)
    ? item.tags.map((t) => String(t).toLowerCase())
    : [String(item.tags || "").toLowerCase()];

  if (FORBIDDEN_TERMS.some((term) => type === term || type.includes(`${term}_`) || type.includes(`_${term}`) || type.includes(term))) {
    return true;
  }
  if (FORBIDDEN_TERMS.some((term) => cat === term || cat.includes(term))) return true;
  if (FORBIDDEN_TERMS.some((term) => tags.some((tag) => tag.includes(term)))) return true;
  if (
    name.includes("staff photo") ||
    name.includes("student photo") ||
    name.includes("staff profile") ||
    name.includes("student profile") ||
    name.includes("press release") ||
    name.includes("press document")
  ) {
    return true;
  }
  return false;
}

function isStaffStudentOrPressUrl(url: string): boolean {
  if (!url) return true;
  const lower = url.toLowerCase();

  if (lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx") || lower.endsWith(".mp4")) {
    return true;
  }

  const forbiddenSubstrings = [
    "/staff/",
    "/staffs/",
    "/student/",
    "/students/",
    "/profiles/",
    "/avatars/",
    "/press/",
    "/pressrelease/",
    "staff_photo",
    "student_photo",
    "staff-photo",
    "student-photo",
    "staff_profile",
    "student_profile",
    "press_release",
    "press-release",
    "pressrelease",
    "press_doc",
    "press-doc",
    "logo",
    "favicon",
  ];

  return forbiddenSubstrings.some((term) => lower.includes(term)) && !lower.includes("campus");
}

function mapEventTypeToCategory(rawType: unknown): Category {
  const t = text(rawType, "Campus").trim();
  if (t.startsWith("/album/")) {
    const folder = t.replace(/^\/album\//i, "").trim();
    const matched = CATEGORIES.find((c) => c.toLowerCase() === folder.toLowerCase());
    if (matched && matched !== "All") return matched as Category;
  }
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

const DEFAULT_CLOUDINARY_MEDIA: AlbumImage[] = [
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789163175/indian-public-school/assets/Home/hero-campus.jpg",
    alt: "Campus Aerial Main View",
    category: "Campus",
    album: "Main Campus Aerial Banners",
    directory: "/album/campus",
    directoryName: "/album/campus",
  },
  {
    src: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80",
    alt: "School Academic Building Front View",
    category: "Campus",
    album: "School Infrastructure",
    directory: "/album/campus",
    directoryName: "/album/campus",
  },
  {
    src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80",
    alt: "Smart Science & Innovation Lab",
    category: "Activities",
    album: "Science & Innovation",
    directory: "/album/activities",
    directoryName: "/album/activities",
  },
  {
    src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&auto=format&fit=crop&q=80",
    alt: "Digital Smart Interactive Classroom",
    category: "Campus",
    album: "Classrooms & Labs",
    directory: "/album/campus",
    directoryName: "/album/campus",
  },
  {
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80",
    alt: "Central Library & Knowledge Hub",
    category: "Campus",
    album: "Library",
    directory: "/album/campus",
    directoryName: "/album/campus",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789163160/indian-public-school/assets/Home/Banner_2.jpg",
    alt: "Annual Athletic Sports Field",
    category: "Sports",
    album: "Sports Ground",
    directory: "/album/sports",
    directoryName: "/album/sports",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789163161/indian-public-school/assets/Home/Banner_3.jpg",
    alt: "Cultural Festival & Auditorium Stage",
    category: "Events",
    album: "Auditorium & Events",
    directory: "/album/events",
    directoryName: "/album/events",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789163162/indian-public-school/assets/Home/Banner_4.jpg",
    alt: "Student Activity Center",
    category: "Activities",
    album: "Co-Curricular Activities",
    directory: "/album/activities",
    directoryName: "/album/activities",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789163164/indian-public-school/assets/Home/Banner_6.jpg",
    alt: "Art Studio & Creative Corner",
    category: "Arts",
    album: "Art & Craft Studio",
    directory: "/album/arts",
    directoryName: "/album/arts",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789163165/indian-public-school/assets/Home/Banner_7.jpg",
    alt: "Hostel & Living Facility",
    category: "Hostel",
    album: "Hostel Premises",
    directory: "/album/hostel",
    directoryName: "/album/hostel",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789163166/indian-public-school/assets/Home/Banner_8.jpg",
    alt: "Open Green Playgrounds",
    category: "Sports",
    album: "Playgrounds",
    directory: "/album/sports",
    directoryName: "/album/sports",
  },
];

export function Gallery() {
  const siteData = useSiteData();
  const home = homeData(siteData);

  const [extraApiImages, setExtraApiImages] = useState<AlbumImage[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveGallery = async () => {
      try {
        const [galleryRes, cdnRes] = await Promise.all([
          getOptionalApi<any>("/gallery?limit=500"),
          getOptionalApi<any>("/uploads/cloudinary-resources"),
        ]);

        const dbItems = unwrapCollection<any>(galleryRes);
        const cdnItems = unwrapCollection<any>(cdnRes);

        const fetchedFromDb: AlbumImage[] = (Array.isArray(dbItems) ? dbItems : [])
          .filter((item) => !isStaffStudentOrPressItem(item))
          .flatMap((item: any) => {
            const cat = mapEventTypeToCategory(item.eventType || item.category || item.directory);
            const albumName = text(item.eventName || item.title || item.album, "School Album");
            const dir = String(item.directoryName || item.directory || "").trim() || `/album/${cat.toLowerCase()}`;
            const urls = Array.isArray(item.fileUrl)
              ? item.fileUrl
              : typeof item.fileUrl === "string" && item.fileUrl.trim()
              ? [item.fileUrl]
              : [];
            return urls
              .filter((u: string) => !isStaffStudentOrPressUrl(u))
              .map((u: string) => ({
                src: u,
                alt: albumName,
                category: cat,
                album: albumName,
                directory: dir,
                directoryName: dir,
              }));
          });

        const fetchedFromCdn: AlbumImage[] = (Array.isArray(cdnItems) ? cdnItems : [])
          .filter((item) => !isStaffStudentOrPressItem(item))
          .map((item: any) => {
            const url = item.secure_url || item.url || item.fileUrl || "";
            const cat = mapEventTypeToCategory(item.folder || item.category);
            const folderStr = String(item.folder || item.category || "general").toLowerCase();
            const dir = folderStr.startsWith("/album/") ? folderStr : `/album/${folderStr}`;
            const title = item.public_id ? item.public_id.split("/").pop() || "Cloudinary Image" : "Cloudinary Asset";
            return {
              src: url,
              alt: title,
              category: cat,
              album: item.folder || "Cloudinary Album",
              directory: dir,
              directoryName: dir,
            };
          })
          .filter((img) => img.src && !isStaffStudentOrPressUrl(img.src));

        if (isMounted) {
          setExtraApiImages([...fetchedFromDb, ...fetchedFromCdn]);
        }
      } catch (err) {
        console.error("Failed to load live gallery API images:", err);
      }
    };

    fetchLiveGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  const datasourceImages = useMemo(() => {
    const rawGallery = siteData.galleryItems?.length ? siteData.galleryItems : (home.gallery as Record<string, unknown>[]);
    const list = Array.isArray(rawGallery) ? (rawGallery as Record<string, unknown>[]) : [];

    const galleryMapped = list
      .filter((item) => !isStaffStudentOrPressItem(item))
      .flatMap((item) => {
        const cat = mapEventTypeToCategory(item.eventType);
        const eventName = text(item.eventName, "Campus Photo");
        const dir = String(item.directoryName || item.directory || "").trim() || `/album/${cat.toLowerCase()}`;
        return imageUrls(item)
          .filter((url) => !isStaffStudentOrPressUrl(url))
          .map((url) => ({
            src: url,
            alt: eventName,
            category: cat,
            album: text(item.album || item.eventName, "School Gallery"),
            directory: dir,
            directoryName: dir,
          }));
      });

    const bannerObj = (home.banner as Record<string, unknown>) ?? {};
    const bannerUrls = Array.isArray(bannerObj.fileUrls) ? bannerObj.fileUrls : [];
    const bannerMapped: AlbumImage[] = bannerUrls
      .map((file, idx) => ({
        src: imageUrl(file),
        alt: `School Banner Image ${idx + 1}`,
        category: "Campus" as Category,
        album: "Hero Campus Banners",
        directory: "/album/campus",
        directoryName: "/album/campus",
      }))
      .filter((img) => img.src && !isStaffStudentOrPressUrl(img.src));

    return [...galleryMapped, ...bannerMapped];
  }, [siteData, home]);

  // Combined & deduplicated album images
  const allAlbumImages = useMemo(() => {
    const combined = [...extraApiImages, ...datasourceImages, ...DEFAULT_CLOUDINARY_MEDIA];
    const seen = new Set<string>();
    const uniqueList: AlbumImage[] = [];

    for (const img of combined) {
      if (!img.src || isStaffStudentOrPressUrl(img.src)) continue;

      // Strictly filter for album images matching /gallery-album logic
      const dirPath = (img.directoryName || img.directory || "").toLowerCase().trim();
      const isForbiddenFolder =
        dirPath.includes("/staff") ||
        dirPath.includes("/press") ||
        dirPath.includes("/documents") ||
        dirPath.includes("/logos");

      if (isForbiddenFolder) continue;

      const isExplicitAlbum = dirPath.startsWith("/album/") || dirPath.includes("/album");
      const isAlbumCategory = ["Campus", "Events", "Sports", "Activities", "Hostel", "Arts", "Banners"].includes(img.category);

      if (!isExplicitAlbum && !isAlbumCategory) continue;

      if (seen.has(img.src)) continue;
      seen.add(img.src);
      uniqueList.push(img);
    }
    return uniqueList;
  }, [extraApiImages, datasourceImages]);

  const [active, setActive] = useState<Category | "All">("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const shownAll = useMemo(
    () => allAlbumImages.filter((i) => active === "All" || i.category === active),
    [active, allAlbumImages],
  );

  // Show a preview subset (max 9 images) on homepage, as user specified "not need to show all"
  const homepageShown = useMemo(() => shownAll.slice(0, 9), [shownAll]);

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
            {homepageShown.map((img, i) => (
              <motion.button
                key={`${img.src}-${i}`}
                layout
                type="button"
                onClick={() => setLightbox(homepageShown.indexOf(img))}
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

        <div className="mt-12 text-center">
          <Link
            href={active !== "All" ? `/album/${encodeURIComponent(active.toLowerCase())}` : "/gallery-album"}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lift transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span>{active !== "All" ? `Explore ${active} Photo Albums` : "Explore All Photo Albums"}</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && homepageShown[lightbox] ? (
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
              src={homepageShown[lightbox].src}
              alt={homepageShown[lightbox].alt}
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


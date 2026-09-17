"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  Search,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Newspaper,
  Calendar,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { EASE } from "@/lib/motion-presets";
import { cn } from "@/lib/utils";
import { getOptionalApi, unwrapCollection } from "@/lib/api-client";

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export interface PressReleaseImage {
  src: string;
  alt: string;
  title: string;
  date?: string;
  source?: "database" | "cloudinary" | "static";
}

const STATIC_PRESS_RELEASE_IMAGES: PressReleaseImage[] = [
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453144/indian-public-school/assets/PressRelease/17862583261000230814.jpg",
    alt: "Press Release - CBSE Board Results Announcement",
    title: "CBSE Board Examination Outstanding Results & Merit Recognition",
    date: "2024-05-15",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453143/indian-public-school/assets/PressRelease/17757957511000058001.jpg",
    alt: "Press Release - Academic Excellence & School Awards",
    title: "State Level Academic Excellence Award Presentation",
    date: "2024-05-14",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453142/indian-public-school/assets/PressRelease/17753674921000050424.jpg",
    alt: "Press Release - Campus Event Coverage",
    title: "Annual Sports & Cultural Festival Media Feature",
    date: "2024-05-14",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453141/indian-public-school/assets/PressRelease/1715858224IMG-20240515-WA0014%282%29.jpg",
    alt: "Press Release - CBSE Class 10 & 12 Toppers",
    title: "CBSE Class X & XII Toppers Felicitation Ceremony",
    date: "2024-05-15",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453140/indian-public-school/assets/PressRelease/1715858206IMG-20240514-WA0004.jpg",
    alt: "Press Release - School Distinction Highlights",
    title: "Leading Public School Achievement Report in Media",
    date: "2024-05-14",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453138/indian-public-school/assets/PressRelease/1715858187IMG-20240514-WA0001.jpg",
    alt: "Press Release - Regional News Feature",
    title: "Indian Public School Highlights in Regional Daily",
    date: "2024-05-14",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453138/indian-public-school/assets/PressRelease/1715858169IMG-20240514-WA0000.jpg",
    alt: "Press Release - Education Leadership Recognition",
    title: "Education Leadership & Innovation Press Feature",
    date: "2024-05-14",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453137/indian-public-school/assets/PressRelease/1715858150IMG-20240514-WA0002.jpg",
    alt: "Press Release - Student Achievement Coverage",
    title: "National Olympiad & Competition Winners Featured",
    date: "2024-05-14",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453136/indian-public-school/assets/PressRelease/1715858130IMG-20240514-WA0003.jpg",
    alt: "Press Release - IPS Media Bulletin",
    title: "IPS Media Bulletin & Annual Academic Benchmark",
    date: "2024-05-14",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453135/indian-public-school/assets/PressRelease/1708060020IMG-20240215-WA0022.jpg",
    alt: "Press Release - Co-Curricular & Sports Meet",
    title: "Annual Athletic & Cultural Meet Press Release",
    date: "2024-02-15",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453134/indian-public-school/assets/PressRelease/1708059977IMG_20240216_102843.jpg",
    alt: "Press Release - School Infrastructure Expansion",
    title: "Smart Classroom & Lab Facilities Inauguration News",
    date: "2024-02-16",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453133/indian-public-school/assets/PressRelease/1684324770BEST_RESULT_OF_SAMBALPUR__page-000111.jpg",
    alt: "Press Release - Best Results of Sambalpur Region",
    title: "Sambalpur Top Academic Ranking Announcement",
    date: "2023-05-17",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453131/indian-public-school/assets/PressRelease/1684324697BEST_RESULT_OF_SAMBALPUR__page-0001.jpg",
    alt: "Press Release - Top Academic Rankers List",
    title: "Best Board Examination Results in Sambalpur Region",
    date: "2023-05-17",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453130/indian-public-school/assets/PressRelease/168432457210__12_nAVBHARAT.jpg",
    alt: "Press Release - Nav Bharat News Coverage",
    title: "Nav Bharat Daily Newspaper Feature on IPS Toppers",
    date: "2023-05-17",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453129/indian-public-school/assets/PressRelease/168432451610__12.jpg",
    alt: "Press Release - Class 10 & 12 Academic Success",
    title: "100% Success Rate in Class 10 & 12 CBSE Board Exams",
    date: "2023-05-17",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453128/indian-public-school/assets/PressRelease/168432446212.jpg",
    alt: "Press Release - Class 12 Science & Commerce Highlights",
    title: "Senior Secondary (Class XII) Toppers List & Press Release",
    date: "2023-05-17",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453127/indian-public-school/assets/PressRelease/168432438910.jpg",
    alt: "Press Release - Class 10 High Achievers",
    title: "Secondary (Class X) Merit Holders Felicitation",
    date: "2023-05-17",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453126/indian-public-school/assets/PressRelease/1675064263Press_Release.png",
    alt: "Press Release - Official IPS Document",
    title: "Official School Media Communication & Press Statement",
    date: "2023-01-30",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453125/indian-public-school/assets/PressRelease/1659155454WhatsApp_Image_2022-07-30_at_9.51.06_AM_11zon.jpg",
    alt: "Press Release - Media Clipping 2022",
    title: "State Educational Ranking & Achievement Release",
    date: "2022-07-30",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453123/indian-public-school/assets/PressRelease/1659155404WhatsApp_Image_2022-07-30_at_9.52.24_AM_11zon.jpg",
    alt: "Press Release - Daily News Feature 2022",
    title: "IPS Excellence in Holistic Education Newspaper Feature",
    date: "2022-07-30",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453122/indian-public-school/assets/PressRelease/1659155343WhatsApp_Image_2022-07-30_at_9.52.15_AM_11zon.jpg",
    alt: "Press Release - Merit List Publication 2022",
    title: "Publication of CBSE Board Examination Merit Achievers",
    date: "2022-07-30",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453121/indian-public-school/assets/PressRelease/1659155286nav_bharat_1_11zon.jpg",
    alt: "Press Release - Nav Bharat Daily Report",
    title: "Nav Bharat Press Feature on Indian Public School",
    date: "2022-07-30",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453119/indian-public-school/assets/PressRelease/1633588204WhatsApp_Image_2021-09-18_at_16.38.23_-_Copy.jpg",
    alt: "Press Release - Academic Year Highlights 2021",
    title: "Annual Academic Excellence & Merit Commendation",
    date: "2021-09-18",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453118/indian-public-school/assets/PressRelease/1633588189WhatsApp_Image_2021-09-18_at_16.38.22_%281%29.jpg",
    alt: "Press Release - Press Release Clipping 2021",
    title: "School Leadership & Student Development Report",
    date: "2021-09-18",
    source: "static",
  },
  {
    src: "https://res.cloudinary.com/niefrrkx/image/upload/v1789453117/indian-public-school/assets/PressRelease/1631531588EducationExellenceAward.jpg",
    alt: "Press Release - Education Excellence Award",
    title: "Prestigious Education Excellence Award Winner Announcement",
    date: "2021-09-13",
    source: "static",
  },
];

function cleanTitle(raw: string): string {
  if (!raw) return "Press Release Clipping";
  const name = raw.split("/").pop() || raw;
  const noExt = name.replace(/\.(jpg|jpeg|png|webp|svg|pdf)$/i, "");
  const stripped = noExt.replace(/^\d+/, "").replace(/^[_ -]+/, "");
  if (!stripped || stripped.length < 3) {
    return "Press Release Media Clipping";
  }
  return stripped
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PressReleaseClient() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [extraApiImages, setExtraApiImages] = useState<PressReleaseImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 24;

  useEffect(() => {
    let isMounted = true;
    const fetchLivePressReleaseImages = async () => {
      try {
        const directoryPath = encodeURIComponent("indian-public-school/assets/PressRelease");
        const [dirGalleryRes, cdnRes] = await Promise.all([
          getOptionalApi<any>(`/gallery?page=1&limit=500&sortBy=createdAt&sortOrder=desc&directory=${directoryPath}`),
          getOptionalApi<any>("/uploads/cloudinary-resources"),
        ]);

        const dirItems = unwrapCollection<any>(dirGalleryRes);

        const fetchedFromDb: PressReleaseImage[] = (Array.isArray(dirItems) ? dirItems : []).flatMap((item: any) => {
          const rawTitle = text(item.eventName || item.title, "Press Release Media");
          const formattedTitle = cleanTitle(rawTitle);
          const urls = Array.isArray(item.fileUrl)
            ? item.fileUrl
            : typeof item.fileUrl === "string" && item.fileUrl.trim()
            ? [item.fileUrl]
            : [];
          return urls.map((u: string) => ({
            src: u,
            alt: formattedTitle,
            title: formattedTitle,
            date: item.createdAt ? new Date(item.createdAt).toISOString().split("T")[0] : undefined,
            source: "database" as const,
          }));
        });

        if (isMounted) {
          setExtraApiImages(fetchedFromDb);
        }
      } catch (err) {
        console.error("Failed to fetch live press release images:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLivePressReleaseImages();
    return () => {
      isMounted = false;
    };
  }, []);

  const allImages = useMemo(() => {
    const list = extraApiImages.length ? extraApiImages : STATIC_PRESS_RELEASE_IMAGES;
    return list;
  }, [extraApiImages]);

  const filteredImages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allImages;

    return allImages.filter(
      (img) =>
        img.title.toLowerCase().includes(query) ||
        img.alt.toLowerCase().includes(query) ||
        (img.date && img.date.includes(query))
    );
  }, [allImages, searchQuery]);

  const totalPages = Math.ceil(filteredImages.length / pageSize) || 1;
  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredImages.slice(start, start + pageSize);
  }, [filteredImages, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const currentLightboxImage =
    lightboxIndex !== null && filteredImages[lightboxIndex]
      ? filteredImages[lightboxIndex]
      : null;

  const handlePrevLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1));
  };

  const handleNextLightbox = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrevLightbox();
      if (e.key === "ArrowRight") handleNextLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredImages]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 text-slate-900 flex flex-col font-sans">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-navy-deep py-12 sm:py-16 text-navy-foreground border-b border-gold/30 shadow-2xl">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="container-page relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white/90 backdrop-blur-md mb-6 shadow-md"
          >
            <GraduationCap className="size-4 text-gold shrink-0 mr-1" />
            <Link href="/" className="hover:text-gold transition-colors text-white/80">
              Home
            </Link>
            <span className="text-gold font-bold">*</span>
            <span className="text-gold font-bold drop-shadow">Press Release</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold border border-gold/40">
                <Newspaper className="size-3.5" /> Official Media Archives
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-md">
                Press Releases & Media Coverage
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Explore our official press clippings, newspaper publications, academic merit announcements, and media honors inside <code className="text-gold bg-black/30 px-1.5 py-0.5 rounded border border-gold/30">assets/PressRelease</code>.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search press releases..."
                className="w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-md pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-300 shadow-inner outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container-page max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-16 flex-1">
        {/* Results Info Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-8 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold" />
            <span>
              Showing <strong className="text-slate-900 font-semibold">{filteredImages.length}</strong> press release media item{filteredImages.length !== 1 ? "s" : ""}
            </span>
          </div>
          {totalPages > 1 && (
            <span>
              Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
            </span>
          )}
        </div>

        {/* Media Grid */}
        {filteredImages.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center my-12 shadow-sm">
            <ImageIcon className="mx-auto size-12 text-slate-400 mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">No press release images found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              No press releases match your search query &quot;{searchQuery}&quot;. Try resetting your search filter.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-5 rounded-lg bg-gold/20 px-4 py-2 text-xs font-bold text-amber-800 border border-gold/40 hover:bg-gold/30 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedImages.map((img, idx) => {
              const globalIdx = (currentPage - 1) * pageSize + idx;
              return (
                <motion.article
                  key={`${img.src}-${globalIdx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE, delay: (idx % 6) * 0.05 }}
                  onClick={() => setLightboxIndex(globalIdx)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-xl hover:shadow-gold/10"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="absolute right-3 top-3 rounded-full bg-slate-900/80 p-2 text-gold backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="size-4" />
                    </div>
                  </div>

                  <div className="p-4 space-y-2 bg-white">
                    <div className="flex items-center justify-between text-xs text-amber-700 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Newspaper className="size-3" /> Press Release
                      </span>
                      {img.date && (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                          <Calendar className="size-3" /> {img.date}
                        </span>
                      )}
                    </div>
                    <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {img.title}
                    </h3>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-gold/50 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" /> Previous
            </button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "size-9 rounded-xl text-sm font-semibold transition-all",
                    page === currentPage
                      ? "bg-gold text-slate-950 shadow-md shadow-gold/20"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-gold/50 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {currentLightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute right-5 top-5 z-50 rounded-full bg-slate-800/80 p-3 text-slate-200 transition-all hover:bg-red-500 hover:text-white"
              aria-label="Close Preview"
            >
              <X className="size-6" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrevLightbox}
              className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-slate-900/80 p-3 text-slate-200 transition-all hover:bg-gold hover:text-slate-950 shadow-xl"
              aria-label="Previous Image"
            >
              <ChevronLeft className="size-6" />
            </button>

            <button
              onClick={handleNextLightbox}
              className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-slate-900/80 p-3 text-slate-200 transition-all hover:bg-gold hover:text-slate-950 shadow-xl"
              aria-label="Next Image"
            >
              <ChevronRight className="size-6" />
            </button>

            {/* Modal Body */}
            <div className="relative flex max-h-[90vh] max-w-5xl flex-col items-center justify-center p-2">
              <motion.img
                key={currentLightboxImage.src}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={currentLightboxImage.src}
                alt={currentLightboxImage.alt}
                className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-slate-800"
              />

              <div className="mt-4 text-center max-w-2xl space-y-2">
                <h2 className="text-lg font-bold text-white sm:text-xl drop-shadow">
                  {currentLightboxImage.title}
                </h2>
                {currentLightboxImage.date && (
                  <p className="text-xs text-gold/90 font-medium">
                    Published: {currentLightboxImage.date}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-center gap-3">
                  <a
                    href={currentLightboxImage.src}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2 text-xs font-bold text-slate-950 shadow-lg hover:bg-amber-400 transition-all"
                  >
                    <Download className="size-4" /> Download Press Clipping
                  </a>
                  <a
                    href={currentLightboxImage.src}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all"
                  >
                    <ExternalLink className="size-4" /> Open Original Image
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

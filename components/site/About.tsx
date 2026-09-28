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
import { UniversalMedia } from "@/components/ui/UniversalMedia";
import {
  firstSection,
  homeData,
  imageUrl,
  text,
  textList,
} from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

export function About() {
  const siteHome = homeData(useSiteData());
  const section = firstSection(siteHome, "section-1");
  const secVid = firstSection(siteHome, "section-video");
  const sec8 = firstSection(siteHome, "section-8");

  const CLOUDINARY_VIDEO = "https://res.cloudinary.com/niefrrkx/video/upload/v1789615686/IPSIntroVideo.mp4";
  const configuredUrl = text(secVid.introFileUrl || secVid.videoUrl || sec8.introFileUrl || sec8.videoUrl);
  const videoSource = (configuredUrl && configuredUrl.trim().length > 0 && configuredUrl !== "/IPSIntroVideo.mp4" && !configuredUrl.includes("v1789299171"))
    ? configuredUrl
    : CLOUDINARY_VIDEO;

  const descriptions = textList(section.description);
  const cards = Array.isArray(section.cardItem)
    ? (section.cardItem as Record<string, unknown>[])
    : [];
  const brief = Array.isArray(section.briefCard)
    ? (section.briefCard[0] as Record<string, unknown>)
    : {};
  const briefImage = imageUrl(brief.fileUrl) || "https://res.cloudinary.com/niefrrkx/image/upload/v1789163167/indian-public-school/assets/Home/campus-aerial.jpg";
  const briefHeading = text(brief.heading, "A green, purpose-built campus for modern learning");
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["-4%", reduced ? "-4%" : "4%"],
  );

  return (
    <section id="about" className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-950 dark:to-slate-950 overflow-hidden">
      <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-center">
        {/* Left Column: Video & Campus Card */}
        <div ref={ref} className="lg:col-span-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-slate-950 shadow-2xl shadow-slate-900/15 dark:border-slate-800"
          >
            <UniversalMedia
              src={videoSource}
              type="video"
              alt={text(secVid.title || section.heading || "IPS Intro Video")}
              title={text(secVid.title || section.heading || "Experience life at Indian Public School")}
              poster={briefImage}
              autoPlay={typeof secVid.autoPlay === "boolean" ? secVid.autoPlay : true}
              muted={typeof secVid.muted === "boolean" ? secVid.muted : true}
              loop={typeof secVid.loop === "boolean" ? secVid.loop : true}
              controls={typeof secVid.controls === "boolean" ? secVid.controls : true}
              aspectRatio="auto"
              objectFit="cover"
              className="w-full h-full object-cover min-h-[300px] sm:min-h-[400px] lg:min-h-[480px] xl:min-h-[520px]"
              containerClassName="w-full rounded-[2.2rem] overflow-hidden min-h-[300px] sm:min-h-[400px] lg:min-h-[480px] xl:min-h-[520px]"
            />
          </motion.div>

          {/* Sub-card below video to anchor left column */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <img
              src={briefImage}
              alt={briefHeading}
              width={120}
              height={80}
              loading="lazy"
              className="h-14 w-20 flex-shrink-0 rounded-xl object-cover"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                School Campus
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {briefHeading}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: About Content */}
        <div className="lg:col-span-6">
          <Reveal>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-3.5 py-1 text-xs font-bold tracking-wider uppercase text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {text(section.heading, "About Our School")}
            </div>

            <h2 className="mt-4 text-3xl font-extrabold leading-[1.15] text-[#102a4c] dark:text-slate-100 sm:text-4xl lg:text-5xl">
              {text(section.subHeading)}
            </h2>

            {descriptions[0] && (
              <p className="mt-5 text-base font-normal leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                {descriptions[0]}
              </p>
            )}

            {descriptions[1] && (
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                {descriptions[1]}
              </p>
            )}
          </Reveal>

          {/* Cards Section */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {cards.map((card, i) => {
              const Icon = i === 0 ? Target : Compass;
              const title = text(card.heading);
              const redirectUrl = text(card.redirectUrl);
              return (
                <Reveal key={`${title || "about-card"}-${i}`} delay={0.1 * i}>
                  <a
                    href={redirectUrl || undefined}
                    className="group block h-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-xl bg-[#1a5d9c]/10 text-[#1a5d9c] transition-colors group-hover:bg-[#1a5d9c] group-hover:text-white dark:bg-slate-800 dark:text-amber-400">
                        <Icon className="size-5" />
                      </span>
                      <h3 className="text-lg font-bold text-[#102a4c] dark:text-slate-100">{title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {text(card.description)}
                    </p>
                  </a>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.2}>
            <Button asChild size="lg" className="group mt-8 rounded-full bg-[#102a4c] hover:bg-[#1a5d9c] text-white px-7 shadow-md">
              <a href={text((section.btnLinkText as Record<string, unknown> | undefined)?.url, "#academics")}>
                {text(
                  (section.btnLinkText as Record<string, unknown> | undefined)
                    ?.text,
                  "Discover Our Story",
                )}
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}


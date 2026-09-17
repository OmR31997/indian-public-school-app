import { SectionHeading } from "@/components/site/Reveal";
import { firstSection, homeData, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

export function IntroVideo() {
  const siteHome = homeData(useSiteData());
  const secVid = firstSection(siteHome, "section-video");
  const sec8 = firstSection(siteHome, "section-8");

  const FALLBACK_SEED_VIDEO = "https://www.indianpublicschool.in/assets/img/IPS.mp4";
  const CLOUDINARY_VIDEO = "https://res.cloudinary.com/niefrrkx/video/upload/v1789615686/IPSIntroVideo.mp4";
  let explicitUrl = text(secVid.introFileUrl || secVid.videoUrl || sec8.introFileUrl || sec8.videoUrl);
  if (!explicitUrl || explicitUrl === "/IPSIntroVideo.mp4" || explicitUrl.includes("v1789299171")) {
    explicitUrl = CLOUDINARY_VIDEO;
  }
  const isCleared = secVid.introFileUrl === "" || secVid.videoUrl === "" || sec8.introFileUrl === "";
  const source = explicitUrl ? explicitUrl : isCleared ? "" : CLOUDINARY_VIDEO;

  if (!source) {
    return null;
  }

  const eyebrow = text(secVid.eyebrow) || text(sec8.videoEyebrow) || "Discover IPS";
  const title = text(secVid.title || secVid.heading) || text(sec8.videoTitle) || "Experience life at Indian Public School";
  const description = text(secVid.description) || text(sec8.videoDescription) || "Take a look at the campus, learning spaces and student life.";

  const autoPlay = typeof secVid.autoPlay === "boolean" ? secVid.autoPlay : (typeof sec8.autoPlay === "boolean" ? sec8.autoPlay : true);
  const loop = typeof secVid.loop === "boolean" ? secVid.loop : (typeof sec8.loop === "boolean" ? sec8.loop : true);
  const muted = typeof secVid.muted === "boolean" ? secVid.muted : (typeof sec8.muted === "boolean" ? sec8.muted : true);
  const showControls = typeof secVid.controls === "boolean" ? secVid.controls : (typeof sec8.controls === "boolean" ? sec8.controls : true);
  const poster = text(secVid.poster || sec8.poster || secVid.posterUrl || sec8.posterUrl);

  return (
    <section className="py-20 lg:py-32">
      <div className="container-page">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-12 overflow-hidden rounded-3xl border border-border bg-navy-deep shadow-lift">
          <video
            src={source}
            className="aspect-video w-full object-cover"
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            controls={showControls}
            poster={poster || undefined}
            playsInline
            preload="auto"
            aria-label={title}
            key={`${source}-${autoPlay}-${muted}-${loop}-${showControls}`}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}


import { SectionHeading } from "@/components/site/Reveal";
import { firstSection, homeData, imageUrl, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

export function SchoolIntroduction() {
  const section = firstSection(homeData(useSiteData()), "section-9");
  const image = imageUrl(section.fileUrls ?? section.fileUrl);

  if (!section.heading && !section.description) return null;
  return (
    <section className="bg-secondary/40 py-20 lg:py-32">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading eyebrow={text(section.subHeading, "About IPS")} title={text(section.heading)} description={text(section.description)} />
          {text(section.redirectUrl) ? <a href={text(section.redirectUrl)} className="mt-7 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Learn more about IPS</a> : null}
        </div>
        {image ? <img src={image} alt={text(section.heading, "Indian Public School")} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift" loading="lazy" /> : null}
      </div>
    </section>
  );
}

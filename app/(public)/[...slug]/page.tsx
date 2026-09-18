import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Lock } from "lucide-react";
import datasource from "@/public/cloud-datasource.json";
import fallbackHeroImage from "@/assets/campus-aerial.jpg";

type Content = Record<string, unknown>;

function asRecord(value: unknown): Content | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Content)
    : null;
}

function label(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildBreadcrumbs(slug: string[], pageTitle: string) {
  const items: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
  ];

  if (slug.length === 1) {
    const s = slug[0].toLowerCase();
    if (["curriculum", "syllabus", "academics", "courses"].includes(s)) {
      items.push({ label: "Admission", href: "/#admissions" });
    } else if (["fee-structure", "procedure", "eligibility", "enrolment"].includes(s)) {
      items.push({ label: "Admission", href: "/#admissions" });
    } else if (["about", "mission", "vision"].includes(s)) {
      items.push({ label: "About Us", href: "/#about" });
    }
  } else {
    let acc = "";
    for (let i = 0; i < slug.length - 1; i++) {
      acc += `/${slug[i]}`;
      items.push({
        label: label(slug[i]),
        href: acc,
      });
    }
  }

  items.push({
    label: pageTitle,
    href: `/${slug.join("/")}`,
  });

  return items;
}

function findByRedirect(value: unknown, pathname: string): Content | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const match = findByRedirect(entry, pathname);
      if (match) return match;
    }
    return null;
  }
  const record = asRecord(value);
  if (!record) return null;
  if (record.redirectUrl === pathname) return record;
  for (const child of Object.values(record)) {
    const match = findByRedirect(child, pathname);
    if (match) return match;
  }
  return null;
}

function findBySectionKey(value: unknown, key: string): Content | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const match = findBySectionKey(entry, key);
      if (match) return match;
    }
    return null;
  }
  const record = asRecord(value);
  if (!record) return null;
  if (key in record) {
    const candidate = record[key];
    if (Array.isArray(candidate))
      return asRecord(candidate[0]) ?? { content: candidate };
    return asRecord(candidate);
  }
  for (const child of Object.values(record)) {
    const match = findBySectionKey(child, key);
    if (match) return match;
  }
  return null;
}

function strings(value: unknown): string[] {
  if (typeof value === "string" && value.trim()) return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  return [];
}

function media(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(media);
  if (typeof value === "string" && /^(https?:\/\/|\/)/.test(value))
    return [value];
  return [];
}

function contentText(page: Content) {
  return [page.description, page.content, page["sub-title"], page.subHeading]
    .flatMap(strings)
    .filter((value, index, values) => values.indexOf(value) === index);
}

function contentMedia(page: Content) {
  return [page.fileUrl, page.fileUrls, page.image, page.images]
    .flatMap(media)
    .filter((value, index, values) => values.indexOf(value) === index);
}

function childCards(page: Content): Content[] {
  const candidates = [page.cardItem, page.list, page.content];
  return candidates.flatMap((candidate) =>
    Array.isArray(candidate)
      ? candidate
          .map(asRecord)
          .filter((item): item is Content => item !== null)
      : [],
  );
}

const API_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

export const dynamic = "force-dynamic";

async function fetchDbPage(slugArray: string[]): Promise<Content | null> {
  const lastSegment = slugArray.at(-1) || "";
  const fullPath = slugArray.join("/");
  const candidates = [lastSegment, fullPath, `pages/${lastSegment}`];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const res = await fetch(`${API_URL}/pages/slug/${encodeURIComponent(candidate)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        const doc = json?.data ?? json;
        if (doc && doc.title) return doc as Content;
      }
    } catch {
      // fallback cleanly
    }
  }
  return null;
}

async function resolvePage(slug: string[]): Promise<Content | null> {
  const dbPage = await fetchDbPage(slug);
  if (dbPage) return dbPage;

  const pathname = `/${slug.join("/")}`;
  const direct = findByRedirect(datasource, pathname);
  if (direct) return direct;

  const lastSegment = slug.at(-1);
  return lastSegment ? findBySectionKey(datasource, lastSegment) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await resolvePage(slug);
  const title =
    typeof page?.title === "string"
      ? page.title
      : typeof page?.heading === "string"
      ? page.heading
      : label(slug.at(-1) ?? "Indian Public School");
  return { title: `${title} | Indian Public School` };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = await resolvePage(slug);

  if (page && (page.isPublished === false || page.isPublished === "false")) {
    return (
      <main className="container-page py-24 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-600">
            <Lock size={28} />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Page Not Accessible</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            This school information page is currently not published or is not accessible. Please contact administration for assistance.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-[#1a5d9c] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#102a4c]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const fallbackTitle = label(slug.at(-1) ?? "School information");
  const activePage: Content = page || {
    title: fallbackTitle,
    heading: fallbackTitle,
    description: [`Welcome to Indian Public School's ${fallbackTitle} section. Please explore our campus programs or contact our administrative office for details.`],
    textContent: `<p className="text-slate-700 leading-relaxed">Welcome to Indian Public School's ${fallbackTitle} section. For complete information, schedules, and guidance, please visit our main campus or reach out to our administration office.</p>`,
  };

  const title =
    typeof activePage.title === "string"
      ? activePage.title
      : typeof activePage.heading === "string"
      ? activePage.heading
      : fallbackTitle;
  const description = contentText(activePage);
  if (description.length === 0) {
    description.push(`Welcome to Indian Public School's ${title} section. For complete details, schedules, and admissions info, please visit our campus or contact our administration.`);
  }
  const images = contentMedia(activePage);
  const cards = childCards(activePage);
  const htmlContent = typeof activePage.textContent === "string" ? activePage.textContent : "";
  const breadcrumbs = buildBreadcrumbs(slug, title);
  const bannerImg =
    typeof activePage?.heroImage === "string" && activePage.heroImage
      ? (activePage.heroImage as string)
      : typeof activePage?.bannerImage === "string" && activePage.bannerImage
      ? (activePage.bannerImage as string)
      : typeof activePage?.image === "string" && activePage.image
      ? (activePage.image as string)
      : fallbackHeroImage.src;

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-slate-950 py-10 sm:py-14 text-white shadow-lg border-b border-gold/30">
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImg}
            alt={title}
            className="h-full w-full object-cover object-center filter brightness-[0.35] contrast-[1.15] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-navy-950/90 to-slate-950/95" />
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
        </div>

        <div className="container-page relative z-10 max-w-5xl flex flex-col items-start gap-4">
          <nav
            aria-label="Breadcrumb"
            className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-gold/40 bg-slate-950/75 px-5 py-2 text-xs font-semibold text-white/95 shadow-xl backdrop-blur-md sm:text-sm"
          >
            <GraduationCap className="size-4 text-gold shrink-0 mr-0.5" />
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={idx} className="inline-flex items-center gap-2.5">
                  {idx > 0 && <span className="text-gold font-extrabold text-xs sm:text-sm">*</span>}
                  {isLast ? (
                    <span className="font-bold text-gold drop-shadow-sm">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-gold hover:underline text-white/80"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mt-2 space-y-2">
            <span className="inline-block rounded-md bg-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold border border-gold/40">
              Official School Document & Information
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-md">
              {title}
            </h1>
          </div>
        </div>
      </section>
      <section className="container-page py-12 lg:py-20">
        {htmlContent ? (
          <div
            className="mx-auto max-w-4xl prose prose-slate prose-lg max-w-none space-y-6 text-slate-800 leading-relaxed font-sans dynamic-page-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <div className="mx-auto max-w-4xl space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
        {images.length ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {images.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`${title} ${index + 1}`}
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-soft"
              />
            ))}
          </div>
        ) : null}
        {cards.length ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {cards.map((card, index) => {
              const cardTitle =
                typeof card.title === "string"
                  ? card.title
                  : typeof card.heading === "string"
                  ? card.heading
                  : `Information ${index + 1}`;
              return (
                <article
                  key={`${cardTitle}-${index}`}
                  className="rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <h2 className="text-xl font-semibold text-slate-900">{cardTitle}</h2>
                  {contentText(card).map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mt-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}


import type { Metadata } from "next";
import datasource from "@/public/cloud-datasource.json";

type Content = Record<string, unknown>;

function asRecord(value: unknown): Content | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Content
    : null;
}

function label(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
    if (Array.isArray(candidate)) return asRecord(candidate[0]) ?? { content: candidate };
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
  if (typeof value === "string" && /^(https?:\/\/|\/)/.test(value)) return [value];
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
      ? candidate.map(asRecord).filter((item): item is Content => item !== null)
      : [],
  );
}

const API_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

async function fetchDbPage(slugArray: string[]): Promise<Content | null> {
  const lastSegment = slugArray.at(-1) || "";
  const fullPath = slugArray.join("/");
  const candidates = [lastSegment, fullPath, `pages/${lastSegment}`];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const res = await fetch(`${API_URL}/pages/slug/${encodeURIComponent(candidate)}`, {
        next: { revalidate: 5 },
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await resolvePage(slug);
  const title = typeof page?.title === "string"
    ? page.title
    : typeof page?.heading === "string"
      ? page.heading
      : label(slug.at(-1) ?? "Indian Public School");
  return { title: `${title} | Indian Public School` };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = await resolvePage(slug);

  if (!page) {
    return <main className="container-page py-28"><h1 className="text-4xl font-bold">Page not found</h1><p className="mt-4 text-muted-foreground">This school information page has not been published yet.</p></main>;
  }

  const title = typeof page.title === "string"
    ? page.title
    : typeof page.heading === "string"
      ? page.heading
      : label(slug.at(-1) ?? "School information");
  const description = contentText(page);
  const images = contentMedia(page);
  const cards = childCards(page);
  const htmlContent = typeof page.textContent === "string" ? page.textContent : "";

  return (
    <main>
      <section className="surface-navy py-20 lg:py-28">
        <div className="container-page max-w-4xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-gold uppercase">Indian Public School</p>
          <h1 className="mt-4 font-display text-4xl text-navy-foreground sm:text-6xl">{title}</h1>
        </div>
      </section>
      <section className="container-page py-16 lg:py-24">
        {htmlContent ? (
          <div
            className="mx-auto max-w-4xl prose prose-slate prose-lg max-w-none space-y-4 text-slate-700 leading-relaxed font-sans"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <div className="mx-auto max-w-4xl space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        )}
        {images.length ? <div className="mt-12 grid gap-5 sm:grid-cols-2">{images.map((src, index) => <img key={src} src={src} alt={`${title} ${index + 1}`} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-soft" />)}</div> : null}
        {cards.length ? <div className="mt-12 grid gap-5 md:grid-cols-2">{cards.map((card, index) => {
          const cardTitle = typeof card.title === "string" ? card.title : typeof card.heading === "string" ? card.heading : `Information ${index + 1}`;
          return <article key={`${cardTitle}-${index}`} className="rounded-2xl border border-border bg-card p-6 shadow-soft"><h2 className="text-xl font-semibold">{cardTitle}</h2>{contentText(card).map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-relaxed text-muted-foreground">{paragraph}</p>)}</article>;
        })}</div> : null}
      </section>
    </main>
  );
}


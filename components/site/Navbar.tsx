import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ChevronDown, GraduationCap, Menu, Phone, X } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { homeData, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";

const API_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Academics", href: "/#academics" },
  { label: "Admissions", href: "/#admissions" },
  { label: "Campus Life", href: "/#campus-life" },
  { label: "Infrastructure", href: "/#infrastructure" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

interface ApiMenuItem {
  title: string;
  targetUrl?: string;
  slug?: string;
  isPublished?: boolean;
  order?: number;
  subItems?: { title: string; linkUrl?: string; order?: number }[];
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.3,
  });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gold"
      aria-hidden
    />
  );
}

export function AnnouncementBar() {
  const hero = (homeData(useSiteData()).hero as Record<string, unknown>) ?? {};
  const content = Array.isArray(hero.content)
    ? (hero.content[0] as Record<string, unknown>)
    : {};
  return (
    <div className="surface-navy relative z-40 text-navy-foreground">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-2.5 text-center sm:flex-row sm:text-left">
        <p className="text-xs font-medium sm:text-sm">
          <span className="mr-2 inline-block rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold tracking-wider text-gold-foreground uppercase">
            New
          </span>
          {text(
            content.session,
            "Admissions Open for the current academic session",
          )}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/#admissions"
            className="rounded-full bg-gold px-3.5 py-1.5 text-xs font-semibold text-gold-foreground transition-transform hover:-translate-y-0.5"
          >
            Apply Now
          </Link>
          <Link
            href="/#contact"
            className="rounded-full border border-navy-foreground/30 px-3.5 py-1.5 text-xs font-semibold transition-colors hover:bg-navy-foreground/10"
          >
            Contact School
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const [dbMenuItems, setDbMenuItems] = useState<ApiMenuItem[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    axios
      .get(`${API_URL}/menu-items`, { params: { publishedOnly: "true" } })
      .then((res) => {
        if (!isMounted) return;
        const payload = res.data?.data ?? res.data;
        const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
        if (list.length > 0) {
          setDbMenuItems(list);
        }
      })
      .catch(() => {
        /* Fallback cleanly to static NAV if unreached */
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const menuCardItems = homeData(useSiteData()).menuCard;
  const legacyApiNav = Array.isArray(menuCardItems) ? (menuCardItems as Record<string, unknown>[]) : [];

  const navigation = dbMenuItems.length
    ? dbMenuItems.map((item) => {
        const rawUrl = (item.targetUrl || item.slug || "/").trim();
        const href = rawUrl.startsWith("/") || rawUrl.startsWith("http")
          ? rawUrl
          : rawUrl.startsWith("#")
          ? `/${rawUrl}`
          : `/#${rawUrl}`;
        return {
          label: item.title,
          href,
          subItems: Array.isArray(item.subItems)
            ? item.subItems
                .map((s) => {
                  const sUrl = (s.linkUrl || "/").trim();
                  const sHref = sUrl.startsWith("/") || sUrl.startsWith("http")
                    ? sUrl
                    : sUrl.startsWith("#")
                    ? `/${sUrl}`
                    : `/#${sUrl}`;
                  return { title: s.title, linkUrl: sHref };
                })
                .filter((s) => Boolean(s.title))
            : [],
        };
      })
    : legacyApiNav.length
    ? legacyApiNav.map((item) => ({
        label: text(item.heading),
        href: text(item.redirectUrl, "/"),
        subItems: [] as { title: string; linkUrl?: string }[],
      }))
    : NAV.map((item) => ({ ...item, subItems: [] as { title: string; linkUrl?: string }[] }));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border/70 bg-background/85 shadow-soft backdrop-blur-xl"
          : "bg-background/40 backdrop-blur-sm",
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform duration-300 group-hover:scale-105">
            <GraduationCap className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold tracking-tight sm:text-lg">
              Indian Public School
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Learn · Lead · Inspire
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 xl:flex">
          {navigation.map((item, index) => (
            <li key={`${item.href || "navigation-item"}-${index}`} className="group relative">
              <Link
                href={item.href}
                className="relative flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                <span className="relative">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gold transition-all duration-300 group-hover:w-full" />
                </span>
                {item.subItems.length > 0 && (
                  <ChevronDown size={13} className="text-muted-foreground transition-transform group-hover:rotate-180" />
                )}
              </Link>

              {item.subItems.length > 0 && (
                <div className="pointer-events-none absolute left-0 top-full pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                  <div className="w-56 rounded-2xl border border-border/80 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
                    {item.subItems.map((sub, sIdx) => (
                      <Link
                        key={sIdx}
                        href={sub.linkUrl || item.href}
                        className="block rounded-xl px-3.5 py-2 text-xs font-semibold text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="hidden rounded-full sm:inline-flex"
          >
            <Link href="/#admissions">Apply Now</Link>
          </Button>
          <Link
            href="/#contact"
            className="grid size-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary xl:hidden"
            aria-label="Contact school"
          >
            <Phone className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full border border-border transition-colors hover:bg-secondary xl:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="size-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="size-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border bg-background/98 backdrop-blur-xl xl:hidden"
          >
            <motion.ul
              className="container-page grid gap-1 py-4"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.045 } } }}
            >
              {navigation.map((item, index) => (
                <motion.li
                  key={`${item.href || "mobile-navigation-item"}-${index}`}
                  variants={{
                    hidden: { opacity: 0, x: -16 },
                    show: { opacity: 1, x: 0 },
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-2.5 text-base font-medium transition-colors hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                  {item.subItems.length > 0 && (
                    <div className="ml-4 space-y-1 border-l-2 border-primary/20 py-1 pl-3">
                      {item.subItems.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          href={sub.linkUrl || item.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.li>
              ))}
              <motion.li
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: { opacity: 1, y: 0 },
                }}
                className="pt-2"
              >
                <Button asChild className="w-full rounded-full">
                  <Link href="/#admissions" onClick={() => setOpen(false)}>
                    Apply Now
                  </Link>
                </Button>
              </motion.li>
            </motion.ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

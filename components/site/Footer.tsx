"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Facebook, GraduationCap, Instagram, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";
import { API_URL } from "@/lib/api-client";

interface ApiMenuItem {
  _id?: string;
  title: string;
  slug?: string;
  targetUrl?: string;
  category?: string;
  isPublished?: boolean;
  order?: number;
  subItems?: ApiMenuItem[];
}

const DEFAULT_FOOTER_COLUMNS = [
  {
    title: "About Us",
    links: [
      { title: "Chairman's Message", href: "/about/chairman-message" },
      { title: "Director's Message", href: "/about/director-message" },
      { title: "Principal's Desk", href: "/about/principal-message" },
      { title: "Mission & Vision", href: "/about/mission-vision" },
      { title: "Establishment", href: "/about/establishment" },
    ],
  },
  {
    title: "Academics",
    links: [
      { title: "Curriculum & Streams", href: "/admissions/curriculum" },
      { title: "Stream Allocation", href: "/academics/stream-allocation" },
      { title: "Social Learning", href: "/academics/social-learning" },
    ],
  },
  {
    title: "Admissions",
    links: [
      { title: "Admission Policy", href: "/admissions/policy" },
      { title: "Curriculum Prospectus", href: "/admissions/curriculum" },
      { title: "Apply Online", href: "/admission" },
    ],
  },
  {
    title: "Campus Life",
    links: [
      { title: "Our Houses", href: "/life-at-ips/our-houses" },
      { title: "Student Empowerment", href: "/life-at-ips/student-empowerment" },
      { title: "Parent-Teacher Meeting", href: "/connectivity/parent-teacher-meeting" },
      { title: "Societal Engagement", href: "/connectivity/societal-engagement" },
    ],
  },
  {
    title: "Infrastructure",
    links: [
      { title: "Science Laboratories", href: "/infrastructure/laboratories" },
      { title: "Hostels & Dining", href: "/infrastructure/hostels" },
      { title: "Sports Grounds", href: "/infrastructure/sports-room" },
      { title: "Art & Performing Arts", href: "/infrastructure/art-craft" },
    ],
  },
];

export function Footer() {
  const siteData = useSiteData();
  const footerConfig = (siteData.footer as Record<string, unknown>) ?? {};
  const contact = (siteData["contact-us"] as Record<string, unknown>) ?? {};
  const addressObj = (contact.Address as Record<string, unknown>) ?? {};
  const fallbackAddress = [addressObj.address, addressObj.district, addressObj.state, addressObj["Post-Office"]]
    .map((v) => text(v))
    .filter(Boolean)
    .join(", ");
  const fallbackPhone = Array.isArray(contact.phone) ? text(contact.phone[0]) : text(contact.phone);
  const socialsObj = (contact["social-media"] as Record<string, unknown>) ?? {};

  const addressText =
    text(footerConfig.address) ||
    fallbackAddress ||
    "Main Road, Near RMC, Khetrajpur, Sambalpur, Odisha - 768006";

  const phoneText = text(footerConfig.phone) || fallbackPhone || "+91 8114320555";
  const emailText = text(footerConfig.email) || text(contact.email) || "Ipssbp75@gmail.com";
  const brandTitle = text(footerConfig.logoText) || "Indian Public School";
  const brandSubTitle = text(footerConfig.logoSubText) || "Learn · Lead · Inspire";
  const aboutText =
    text(footerConfig.aboutText) ||
    text(contact.title, "A co-educational CBSE school committed to academic excellence, strong character and genuine care for every child.");
  const copyrightText =
    text(footerConfig.copyright) ||
    `© ${new Date().getFullYear()} Indian Public School. All rights reserved.`;

  const [dbMenuItems, setDbMenuItems] = useState<ApiMenuItem[]>([]);

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
        /* Keep fallback defaults if unreached */
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const footerColumns = dbMenuItems.length
    ? dbMenuItems.map((parent) => {
        const subLinks = Array.isArray(parent.subItems) && parent.subItems.length > 0
          ? parent.subItems
              .filter((sub) => sub.isPublished !== false)
              .map((sub) => {
                const target = (sub.targetUrl || sub.slug || "/").trim();
                const href = target.startsWith("/") || target.startsWith("http")
                  ? target
                  : target.startsWith("#")
                  ? `/${target}`
                  : `/#${target}`;
                return { title: sub.title, href };
              })
          : [
              {
                title: parent.title,
                href: (parent.targetUrl || parent.slug || "/").trim(),
              },
            ];

        return {
          title: parent.title,
          links: subLinks,
        };
      })
    : DEFAULT_FOOTER_COLUMNS;

  const socialLinks = [
    { icon: Facebook, label: "Facebook", href: text(footerConfig.facebook) || text(socialsObj.facebook, "https://facebook.com") },
    { icon: Instagram, label: "Instagram", href: text(footerConfig.instagram) || text(socialsObj.instagram, "https://instagram.com") },
    { icon: Youtube, label: "YouTube", href: text(footerConfig.youtube) || text(socialsObj.youtube, "https://youtube.com") },
    { icon: Linkedin, label: "LinkedIn", href: text(footerConfig.linkedin) || text(socialsObj.linkedin, "https://linkedin.com") },
  ];

  return (
    <footer className="surface-navy pt-16 pb-8">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_3fr]">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-gold text-gold-foreground">
                <GraduationCap className="size-5" />
              </span>
              <span>
                <span className="block font-display text-lg font-semibold text-navy-foreground">
                  {brandTitle}
                </span>
                <span className="block text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
                  {brandSubTitle}
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy-foreground/70">
              {aboutText}
            </p>
            <p className="mt-4 text-xs text-navy-foreground/50 leading-relaxed">
              {addressText} · {phoneText} · {emailText}
            </p>
            <ul className="mt-6 flex gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-full border border-navy-foreground/20 text-navy-foreground transition-all hover:-translate-y-1 hover:bg-gold hover:text-gold-foreground"
                  >
                    <Icon className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {footerColumns.map((col, i) => (
              <Reveal key={`${col.title}-${i}`} delay={i * 0.05}>
                <h3 className="text-sm font-semibold tracking-wider text-gold uppercase">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((linkItem, idx) => (
                    <li key={`${linkItem.title}-${idx}`}>
                      <Link
                        href={linkItem.href}
                        className="text-sm text-navy-foreground/70 transition-colors hover:text-navy-foreground"
                      >
                        {linkItem.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-navy-foreground/15 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-navy-foreground/60">
            {copyrightText}
          </p>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {[
              { title: "Privacy Policy", href: "/privacy-policy" },
              { title: "Terms of Use", href: "/terms" },
              { title: "Sitemap", href: "/sitemap" },
              { title: "Mandatory Disclosure", href: "/mandatory-disclosure" },
            ].map((item) => (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className="text-xs text-navy-foreground/60 transition-colors hover:text-gold"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

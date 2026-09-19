import { motion } from "motion/react";
import { Bus, ClipboardCheck, Mail, Smartphone, Users } from "lucide-react";
import { EASE } from "@/lib/motion-presets";
import { homeData, text } from "@/lib/site-data";
import { useSiteData } from "@/components/site/SiteDataProvider";
import { openAdmissionModal } from "@/components/site/AdmissionApplicationModal";

const ACTIONS = [
  {
    icon: ClipboardCheck,
    label: "Admissions",
    note: "Session 2026–27",
    href: "#admissions",
  },
  {
    icon: Smartphone,
    label: "School App",
    note: "iOS & Android",
    href: "#contact",
  },
  {
    icon: Users,
    label: "Parent Portal",
    note: "Login access",
    href: "#contact",
  },
  { icon: Bus, label: "Bus Routes", note: "Transport info", href: "#contact" },
  { icon: Mail, label: "Contact", note: "Talk to us", href: "#contact" },
];

export function QuickActions() {
  const cards = homeData(useSiteData()).menuCard;
  const actions = Array.isArray(cards)
    ? (cards as Record<string, unknown>[])
    : [];
  return (
    <section className="relative z-20 -mt-10 lg:-mt-16">
      <div className="container-page">
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 gap-3 rounded-3xl border border-border/70 bg-card/90 p-3 shadow-lift backdrop-blur-xl sm:grid-cols-3 sm:gap-4 sm:p-4 lg:grid-cols-5"
        >
          {(actions.length
            ? actions
            : ACTIONS.map((action) => ({
                heading: action.label,
                subHeading: action.note,
                redirectUrl: action.href,
              }))
          ).map((action, index) => {
            const fallback = ACTIONS[index % ACTIONS.length]!;
            const Icon = fallback.icon;
            const label = text(action.heading, fallback.label);
            const note = text(action.subHeading, fallback.note);
            const href = text(action.redirectUrl, fallback.href);
            const isAdmissionAction =
              label.toLowerCase().includes("admission") ||
              href.includes("admissions") ||
              href.includes("admission");

            return (
              <motion.li
                key={`${label || "quick-action"}-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: EASE },
                  },
                }}
              >
                <motion.a
                  href={href}
                  onClick={(e) => {
                    if (isAdmissionAction) {
                      e.preventDefault();
                      openAdmissionModal();
                    }
                  }}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="group flex h-full flex-col gap-3 rounded-2xl bg-secondary/60 p-4 transition-colors hover:bg-accent cursor-pointer"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {note}
                    </span>
                  </span>
                </motion.a>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}

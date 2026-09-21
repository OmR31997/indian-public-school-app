import type { Metadata } from "next";
import { CareersView } from "@/components/site/CareersView";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://indian-public-school-app.vercel.app";

export const metadata: Metadata = {
  title: "Teacher Jobs & Careers | Indian Public School Recruitment",
  description:
    "Join the faculty at Indian Public School, Sambalpur. Explore current teaching and non-teaching job vacancies, staff benefits, and submit your CV online.",
  keywords: [
    "School Teaching Jobs Sambalpur",
    "Teacher Recruitment CBSE School",
    "Indian Public School Careers",
    "School Vacancies Sambalpur",
  ],
  alternates: {
    canonical: `${baseUrl}/careers`,
  },
  openGraph: {
    title: "Careers & Teaching Job Vacancies | Indian Public School",
    description:
      "Explore rewarding educational career opportunities at Indian Public School. Apply online for PGT, TGT, PRT, and admin roles.",
    url: `${baseUrl}/careers`,
    siteName: "Indian Public School",
    locale: "en_IN",
    type: "website",
  },
};


export default function CareersPage() {
  return <CareersView />;
}

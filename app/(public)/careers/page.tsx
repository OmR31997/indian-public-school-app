import type { Metadata } from "next";
import { CareersView } from "@/components/site/CareersView";

export const metadata: Metadata = {
  title: "Careers & Job Openings | Indian Public School",
  description:
    "Explore current teaching and non-teaching career openings at Indian Public School. Apply online for dynamic positions with qualifications and requirements.",
};

export default function CareersPage() {
  return <CareersView />;
}

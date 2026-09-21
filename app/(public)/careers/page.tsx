import type { Metadata } from "next";
import { CareersView } from "@/components/site/CareersView";
import { getPageSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageSeoMetadata("careers", "/careers");



export default function CareersPage() {
  return <CareersView />;
}

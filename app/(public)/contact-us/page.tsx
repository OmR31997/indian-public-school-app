import type { Metadata } from "next";
import { ContactUsView } from "@/components/site/ContactUsView";
import { getPageSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageSeoMetadata("contact", "/contact-us");



export default function ContactUsPage() {
  return <ContactUsView />;
}

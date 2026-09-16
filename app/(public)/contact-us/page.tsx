import type { Metadata } from "next";
import { ContactUsView } from "@/components/site/ContactUsView";

export const metadata: Metadata = {
  title: "Contact Us | Indian Public School",
  description: "Get in touch with Indian Public School. Submit inquiries regarding admissions, fee structure, transport, facilities, or share your valuable feedback.",
};

export default function ContactUsPage() {
  return <ContactUsView />;
}

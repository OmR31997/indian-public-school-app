import type { Metadata } from "next";
import { ContactUsView } from "@/components/site/ContactUsView";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://indian-public-school-app.vercel.app";

export const metadata: Metadata = {
  title: "Contact Us | Campus Location & Phone | Indian Public School",
  description:
    "Contact Indian Public School in Sambalpur, Odisha. Find our campus address (Main Road, Khetrajpur), phone numbers (+91 8114320555), office email, and online admission desk info.",
  keywords: [
    "Indian Public School Contact",
    "Indian Public School Sambalpur Address",
    "Indian Public School Phone Number",
    "Indian Public School Khetrajpur",
  ],
  alternates: {
    canonical: `${baseUrl}/contact-us`,
  },
  openGraph: {
    title: "Contact Us | Indian Public School Sambalpur",
    description:
      "Get in touch with Indian Public School. Contact details, campus map location, admission inquiries, and helpline info.",
    url: `${baseUrl}/contact-us`,
    siteName: "Indian Public School",
    locale: "en_IN",
    type: "website",
  },
};


export default function ContactUsPage() {
  return <ContactUsView />;
}

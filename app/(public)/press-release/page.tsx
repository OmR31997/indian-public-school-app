import type { Metadata } from "next";
import { Suspense } from "react";
import { PressReleaseClient } from "@/components/site/PressReleaseClient";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://indian-public-school-app.vercel.app";

export const metadata: Metadata = {
  title: "Press Releases & News Coverage | Indian Public School",
  description:
    "Official press releases, newspaper coverage, student academic achievements, CBSE toppers, and school announcements from Indian Public School, Sambalpur.",
  keywords: [
    "Indian Public School News",
    "School Press Release Sambalpur",
    "CBSE Merit Achievements Odisha",
  ],
  alternates: {
    canonical: `${baseUrl}/press-release`,
  },
  openGraph: {
    title: "Press Releases & News Coverage | Indian Public School",
    description: "Read official news announcements, media features, and student achievement awards.",
    url: `${baseUrl}/press-release`,
    siteName: "Indian Public School",
    locale: "en_IN",
    type: "website",
  },
};


export default function PressReleasePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50/50 py-20 text-center text-slate-600 font-sans">
          Loading Press Releases...
        </div>
      }
    >
      <PressReleaseClient />
    </Suspense>
  );
}

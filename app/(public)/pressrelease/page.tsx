import type { Metadata } from "next";
import { Suspense } from "react";
import { PressReleaseClient } from "@/components/site/PressReleaseClient";

const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://indian-public-school-app.vercel.app";

export const metadata: Metadata = {
  title: "Press Releases & News Coverage | Indian Public School",
  description:
    "Explore official press releases, news clippings, academic merit recognitions, and media coverage of Indian Public School.",
  alternates: {
    canonical: `${baseUrl}/press-release`,
  },
};


export default function PressReleaseAliasPage() {
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

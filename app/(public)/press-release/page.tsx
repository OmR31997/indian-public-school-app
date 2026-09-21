import type { Metadata } from "next";
import { Suspense } from "react";
import { PressReleaseClient } from "@/components/site/PressReleaseClient";
import { getPageSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = getPageSeoMetadata("pressRelease", "/press-release");



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

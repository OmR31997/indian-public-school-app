import type { Metadata } from "next";
import { HomeClient } from "@/components/site/HomeClient";

const API_URL = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://indian-public-school-app.vercel.app";

export const metadata: Metadata = {
  title: "Indian Public School | Best CBSE School Admissions Open 2026–27",
  description:
    "Indian Public School is a leading CBSE co-educational school in Sambalpur, Odisha. Modern campus, digital smart classes, sports & arts education. Admissions open for session 2026–27.",
  alternates: {
    canonical: baseUrl,
  },
};

async function getHomePageData() {

  try {
    const res = await fetch(`${API_URL}/pages/slug/home`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      return json?.data ?? json;
    }
  } catch {
    // fallback cleanly if API server is offline or unreachable
  }
  return null;
}

export default async function Home() {
  const homeDoc = await getHomePageData();
  const customText = homeDoc && homeDoc.isPublished !== false ? homeDoc.textContent : null;

  return <HomeClient textContent={customText} />;
}


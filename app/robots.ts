import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "https://indian-public-school-app.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin/*", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true" || !!process.env.GITHUB_ACTIONS;

let basePath = "";
if (isGithubActions) {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "indian-public-school-app";
  basePath = `/${repo}`;
}

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;


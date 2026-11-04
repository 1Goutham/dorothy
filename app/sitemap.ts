import type { MetadataRoute } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://dorothy.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/find-help", "/ask", "/stories", "/get-involved", "/privacy"].map((p) => ({
    url: site + p,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
}

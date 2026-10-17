import type { MetadataRoute } from "next";
import { docs } from "@/lib/docs";
import { SITE } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/download/",
    "/docs/",
    "/changelog/",
    "/brand/",
    ...docs.map((d) => `/docs/${d.slug}/`),
  ].map((path) => ({
    url: `${SITE}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}

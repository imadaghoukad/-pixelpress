import type { MetadataRoute } from "next";
import { SITE_URL, toolPages } from "@/lib/pages";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", ...Object.keys(toolPages), "privacy"].map((path) => ({
    url: `${SITE_URL.replace(/\/$/, "")}/${path}${path ? "/" : ""}`,
  }));
}

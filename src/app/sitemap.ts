import type { MetadataRoute } from "next";
import { contact, locales } from "@/content/config";
import { radarSitemapItems } from "@/lib/radar/data";

export const dynamic = "force-dynamic";

const ROUTES = ["", "/apply", "/companies", "/future-of-ai", "/ai-radar"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await radarSitemapItems();
  const pages = locales.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${contact.siteUrl}/${locale}${route}`,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alt) => [alt, `${contact.siteUrl}/${alt}${route}`]),
        ),
      },
    })),
  );
  return [...pages,...locales.flatMap(locale=>content.map(item=>({
    url:`${contact.siteUrl}/${locale}/ai-radar/${item.kind}/${item.id}`,
    lastModified:item.updatedAt,
    changeFrequency:"weekly" as const,
    priority:0.6,
    alternates:{languages:Object.fromEntries(locales.map(alt=>[alt,`${contact.siteUrl}/${alt}/ai-radar/${item.kind}/${item.id}`]))},
  })))];
}

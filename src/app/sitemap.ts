import type { MetadataRoute } from "next";
import { contact, locales } from "@/content/config";

const ROUTES = ["", "/apply", "/companies", "/future-of-ai"];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
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
}

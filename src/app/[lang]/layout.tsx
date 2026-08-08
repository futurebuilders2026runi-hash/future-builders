import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileCta } from "@/components/MobileCta";
import { getDict } from "@/content";
import { contact, dirFor, isLocale, locales, type Locale } from "@/content/config";

/** Rubik carries matched Latin and Hebrew designs — one family for both locales. */
const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#112f73",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDict(lang);

  return {
    metadataBase: new URL(contact.siteUrl),
    title: {
      default: dict.meta.title,
      template: "%s",
    },
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        en: "/en",
        he: "/he",
        "x-default": "/he",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Future Builders",
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${lang}`,
      locale: lang === "he" ? "he_IL" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = getDict(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Future Builders",
    description: dict.meta.description,
    url: `${contact.siteUrl}/${locale}`,
    email: contact.email,
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "Reichman University",
    },
    sameAs: [contact.linkedin, contact.instagram],
  };

  return (
    <html lang={locale} dir={dirFor(locale)} className={rubik.variable}>
      <body>
        {/* Scroll reveals ship with opacity:0 inline; without JS they must still show. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:inset-s-4 focus:z-60 focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:text-ink"
        >
          {dict.common.skipToContent}
        </a>

        <Header locale={locale} dict={dict} />
        <main id="main">{children}</main>
        <Footer locale={locale} dict={dict} />
        <MobileCta locale={locale} label={dict.nav.apply} />

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}

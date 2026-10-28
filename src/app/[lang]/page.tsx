import { notFound } from "next/navigation";
import { ConferenceBanner } from "@/components/ConferenceBanner";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Leadership } from "@/components/sections/Leadership";
import { Learn } from "@/components/sections/Learn";
import { Program } from "@/components/sections/Program";
import { Industry } from "@/components/sections/Industry";
import { Projects } from "@/components/sections/Projects";
import { DemoDay } from "@/components/sections/DemoDay";
import { Who } from "@/components/sections/Who";
import { Community } from "@/components/sections/Community";
import { Speakers } from "@/components/sections/Speakers";
import { Events } from "@/components/sections/Events";
import { FinalCta } from "@/components/sections/FinalCta";
import { getDict } from "@/content";
import { isLocale, projects, type Locale } from "@/content/config";
import { RadarHome } from "@/components/radar/RadarHome";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = getDict(locale);

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <Leadership dict={dict} />
      <ConferenceBanner locale={locale} dict={dict} />
      <About dict={dict} />
      <Learn dict={dict} />
      <Program dict={dict} />
      <Events locale={locale} dict={dict} />
      <Industry locale={locale} dict={dict} />
      <DemoDay dict={dict} />
      <Who locale={locale} dict={dict} />
      <Speakers dict={dict} />
      <Community dict={dict} />
      {/* Hidden until the first project is added to `projects` in content/config.ts */}
      {projects.length > 0 && <Projects dict={dict} />}
      <RadarHome locale={locale} />
      <FinalCta locale={locale} dict={dict} />
    </>
  );
}

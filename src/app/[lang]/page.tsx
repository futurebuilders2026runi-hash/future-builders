import { notFound } from "next/navigation";
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
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { getDict } from "@/content";
import { isLocale, type Locale } from "@/content/config";

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
      <About dict={dict} />
      <Leadership dict={dict} />
      <Learn dict={dict} />
      <Program dict={dict} />
      <Industry locale={locale} dict={dict} />
      <DemoDay dict={dict} />
      <Who locale={locale} dict={dict} />
      <Speakers dict={dict} />
      <Community dict={dict} />
      <Projects dict={dict} />
      <Faq dict={dict} />
      <FinalCta locale={locale} dict={dict} />
    </>
  );
}

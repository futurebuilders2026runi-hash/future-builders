import Link from "next/link";
import { Waves } from "@/components/BrandDecor";
import { defaultLocale } from "@/content/config";

export default function NotFound() {
  return (
    <section className="brand-sky relative grid min-h-[70vh] place-items-center overflow-hidden">
      <Waves lines={14} />
      <div className="shell relative text-center">
        <p className="display grad-text">404</p>
        <p className="lede mt-4">הדף שחיפשתם לא קיים.</p>
        <Link href={`/${defaultLocale}`} className="btn btn-primary mt-8">
          חזרה ל-Future Builders
        </Link>
      </div>
    </section>
  );
}

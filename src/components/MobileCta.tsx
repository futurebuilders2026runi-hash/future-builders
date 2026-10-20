"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/content/config";

/** Persistent Apply CTA on small screens, revealed once the hero is scrolled past. */
export function MobileCta({ locale, label }: { locale: Locale; label: string }) {
  const [show, setShow] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.endsWith("/apply") || pathname.includes("/admin") || pathname.includes("/ai-radar")) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 p-3 backdrop-blur-xl transition-transform duration-300 sm:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Link href={`/${locale}/apply`} className="btn btn-primary w-full">
        {label}
      </Link>
    </div>
  );
}

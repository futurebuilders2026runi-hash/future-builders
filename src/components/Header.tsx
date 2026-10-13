"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo, ReichmanLogo } from "./Logo";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

type Props = { locale: Locale; dict: Dict };

export function Header({ locale, dict }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const home = `/${locale}`;
  const otherLocale: Locale = locale === "en" ? "he" : "en";
  const altPath =
    pathname.replace(/^\/(en|he)/, `/${otherLocale}`) || `/${otherLocale}`;

  const links = [
    { href: `${home}#about`, label: dict.nav.about },
    { href: `${home}#program`, label: dict.nav.program },
    { href: `${home}#partners`, label: dict.nav.partners },
    { href: `${home}#projects`, label: dict.nav.projects },
    { href: `${home}#faq`, label: dict.nav.faq },
    { href: `/${locale}/companies`, label: dict.nav.forCompanies },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ${
          scrolled || open
            ? "border-b border-line bg-white/85 shadow-[0_10px_30px_-24px_rgba(11,42,107,0.5)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="shell flex h-[4.5rem] items-center justify-between gap-6 text-brand">
          <div className="flex items-center gap-3.5">
            <Link
              href={home}
              className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              aria-label="Future Builders"
            >
              <Logo priority />
            </Link>
            <span aria-hidden className="hidden h-8 w-px bg-line md:block" />
            <ReichmanLogo
              alt={dict.footer.affiliation[0]}
              className="hidden h-10 md:block"
            />
          </div>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label={dict.nav.menu}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm text-(--muted-fg) transition-colors hover:bg-accent/8 hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={altPath}
              hrefLang={otherLocale}
              aria-label={dict.nav.langFull}
              className="hidden rounded-full border border-line px-3 py-2 text-xs font-medium tracking-wide text-(--muted-fg) transition-colors hover:border-accent/50 hover:text-brand sm:block"
            >
              {dict.nav.langLabel}
            </Link>

            <Link
              href={`/${locale}/apply`}
              className="btn btn-primary hidden sm:inline-flex"
            >
              {dict.nav.apply}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? dict.nav.close : dict.nav.menu}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-white/70 lg:hidden"
            >
              <span className="sr-only">
                {open ? dict.nav.close : dict.nav.menu}
              </span>
              <span aria-hidden className="grid gap-[5px]">
                <span
                  className={`block h-px w-4 bg-brand transition-transform duration-300 ${
                    open ? "translate-y-[3px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-px w-4 bg-brand transition-transform duration-300 ${
                    open ? "-translate-y-[3px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="brand-sky fixed inset-0 z-40 pt-[4.5rem] lg:hidden"
          >
            <div className="shell flex h-full flex-col justify-between py-8">
              <nav className="flex flex-col text-center md:text-start" aria-label={dict.nav.menu}>
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.045, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-line py-4 text-2xl font-medium tracking-tight text-brand"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="flex flex-col gap-3 pb-4">
                <Link
                  href={`/${locale}/apply`}
                  onClick={() => setOpen(false)}
                  className="btn btn-primary w-full"
                >
                  {dict.nav.apply}
                </Link>
                <Link
                  href={altPath}
                  hrefLang={otherLocale}
                  className="btn btn-ghost w-full"
                >
                  {dict.nav.langFull}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import Link from "next/link";
import { Logo, ReichmanLogo } from "./Logo";
import { contact } from "@/content/config";
import type { Dict } from "@/content";
import type { Locale } from "@/content/config";

export function Footer({ locale, dict }: { locale: Locale; dict: Dict }) {
  const home = `/${locale}`;

  const links = [
    { href: `${home}#about`, label: dict.nav.about },
    { href: `${home}#program`, label: dict.nav.program },
    { href: `${home}#projects`, label: dict.nav.projects },
    { href: `${home}#partners`, label: dict.nav.partners },
    { href: `${home}/apply`, label: dict.nav.apply },
  ];

  return (
    <footer className="on-dark relative overflow-hidden bg-ink pb-24 pt-20 sm:pb-16">
      <div className="glow -top-40 start-1/4 h-72 w-72 bg-accent/25" aria-hidden />
      <div className="shell relative grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo variant="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
            {dict.footer.tagline}
          </p>
          <div className="mt-7 flex items-center gap-3.5">
            <ReichmanLogo
              variant="light"
              alt={dict.footer.affiliation[0]}
              className="h-12 opacity-90"
            />
            <span aria-hidden className="h-9 w-px bg-white/15" />
            <p className="text-sm leading-snug text-white/55">
              {dict.footer.affiliation[1]}
            </p>
          </div>
        </div>

        <nav aria-label={dict.footer.linksLabel}>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">
            {dict.footer.linksLabel}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">
            {dict.footer.socialLabel}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-white"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-white"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">
            {dict.footer.contactLabel}
          </h2>
          <a
            href={`mailto:${contact.email}`}
            dir="ltr"
            className="mt-4 inline-block text-sm text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            {contact.email}
          </a>
          <Link
            href={`/${locale}/companies`}
            className="btn btn-ghost mt-6 w-full sm:w-auto"
          >
            {dict.nav.forCompanies}
          </Link>
        </div>
      </div>

      <div className="shell relative mt-14 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>{dict.footer.rights}</p>
        <p>{dict.footer.affiliation.join(" · ")}</p>
      </div>
    </footer>
  );
}

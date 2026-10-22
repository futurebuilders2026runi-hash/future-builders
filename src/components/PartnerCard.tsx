import type { ClubPartner, Locale } from "@/content/config";

export function PartnerCard({ partner, locale }: { partner: ClubPartner; locale: Locale }) {
  return (
    <article className="partner-resource" aria-labelledby={`partner-${partner.id}`}>
      <div className="partner-resource-person">
        <span className="partner-resource-monogram" aria-hidden>RL<span>↗</span></span>
        <div>
          <p className="partner-resource-eyebrow">{locale === "he" ? "שותף לקהילה · אורח בהמשך" : "COMMUNITY PARTNER · FUTURE GUEST"}</p>
          <h3 id={`partner-${partner.id}`}>{partner.name[locale]}</h3>
          <p className="partner-resource-role">{partner.role[locale]}</p>
        </div>
      </div>
      <div className="partner-resource-body">
        <p className="partner-resource-name" dir="ltr">{partner.resourceName}<span aria-hidden>_</span></p>
        <p className="partner-resource-description">{partner.description[locale]}</p>
        <a href={partner.url} target="_blank" rel="noopener noreferrer" className="partner-resource-link">
          {locale === "he" ? "להיכרות ולהרשמה לניוזלטר" : "Explore & subscribe to the newsletter"}<span aria-hidden>↗</span>
        </a>
        <p className="partner-resource-visit">{partner.guestNote[locale]}</p>
      </div>
    </article>
  );
}

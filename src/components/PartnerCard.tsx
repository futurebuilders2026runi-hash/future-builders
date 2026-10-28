import type { ClubPartner, Locale } from "@/content/config";
import { CouponCode } from "./CouponCode";

export function PartnerCard({ partner, locale }: { partner: ClubPartner; locale: Locale }) {
  const he = locale === "he";

  return (
    <article className="partner-resource" aria-labelledby={`partner-${partner.id}`}>
      <div className="partner-resource-person">
        <h3 id={`partner-${partner.id}`}>{partner.name[locale]}</h3>
        <p className="partner-resource-role">{partner.role[locale]}</p>
        <p className="partner-resource-name" dir="ltr">{partner.resourceName}</p>
      </div>
      <div className="partner-resource-body">
        <p className="partner-resource-description">{partner.description[locale]}</p>
        {partner.perk && (
          <div className="partner-resource-perk">
            <p>
              <strong dir="ltr">{partner.perk.value}</strong> {partner.perk.label[locale]}
            </p>
            {partner.perk.code && (
              <div className="partner-resource-perk-code">
                <span>{he ? "קוד קופון:" : "Coupon code:"}</span>
                <CouponCode code={partner.perk.code} label={he ? "העתקה" : "Copy"} copied={he ? "הועתק ✓" : "Copied ✓"} />
              </div>
            )}
          </div>
        )}
        <a href={partner.url} target="_blank" rel="noopener noreferrer" className="partner-resource-link">
          {partner.cta[locale]}
        </a>
        {partner.guestNote && <p className="partner-resource-visit">{partner.guestNote[locale]}</p>}
      </div>
    </article>
  );
}

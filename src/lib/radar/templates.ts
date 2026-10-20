import type { Collection } from "./schema";

export function draftRecord(kind: Collection): Record<string, unknown> {
  const now = new Date().toISOString();
  const empty = () => ({ he: "", en: "" });
  const id = crypto.randomUUID();
  if (kind === "categories")
    return { id, kind, title: empty(), scope: "topic" };
  if (kind === "sources")
    return {
      id,
      kind,
      title: empty(),
      url: "",
      allowedHosts: ["openai.com"],
      enabled: false,
      autoPublish: false,
      companyId: "",
      accessNote: "",
    };
  const base = {
    id,
    kind,
    title: empty(),
    summary: empty(),
    sourceUrl: "",
    sourceName: "",
    publishedAt: now,
    discoveredAt: now,
    updatedAt: now,
    verifiedAt: "",
    categories: [],
    tags: [],
    companyIds: [],
    image: "",
    imageAlt: empty(),
    imageCredit: "",
    status: "draft",
    featured: false,
  };
  switch (kind) {
    case "news":
      return {
        ...base,
        why: empty(),
        importance: 30,
        importanceReason: empty(),
        originalTitle: "",
        languageMode: "edited",
      };
    case "models":
      return {
        ...base,
        companyId: "",
        version: "",
        releasedAt: now,
        modalities: [],
        capabilities: empty(),
        useCases: empty(),
        changes: empty(),
        buildIdeas: empty(),
        api: "unknown",
        openWeights: "unknown",
        docsUrl: "",
        pricing: empty(),
        pricingUrl: "",
        benchmarks: [],
      };
    case "companies":
      return {
        ...base,
        country: empty(),
        product: empty(),
        startup: false,
        israeli: false,
        announcements: empty(),
      };
    case "tools":
      return {
        ...base,
        audience: empty(),
        uses: empty(),
        freePlan: "unknown",
        freePlanSource: "",
        openSource: false,
        licenseUrl: "",
        buildersPick: false,
        pickReason: empty(),
      };
    case "events":
      return {
        ...base,
        organizer: "",
        startsAt: now,
        endsAt: new Date(Date.now() + 3600000).toISOString(),
        timezone: "Asia/Jerusalem",
        location: empty(),
        online: false,
        audience: empty(),
        relationship: "external",
        partner: "",
        eventType: "meetup",
        eventStatus: "draft",
        registration: "unknown",
        registrationUrl: "",
        agendaUrl: "",
        cost: empty(),
        benefit: empty(),
        benefitApproved: false,
        discountCode: "",
        benefitUrl: "",
      };
  }
}

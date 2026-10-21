import { z } from "zod";

export const collections = [
  "news",
  "models",
  "companies",
  "tools",
  "events",
  "categories",
  "sources",
] as const;
export type Collection = (typeof collections)[number];
export const localized = z.object({
  he: z.string().trim().min(1).max(4000),
  en: z.string().trim().min(1).max(4000),
});
export type Localized = z.infer<typeof localized>;
export const httpsUrl = z
  .string()
  .max(2048)
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Use an HTTPS URL without credentials");
const optionalUrl = z.union([httpsUrl, z.literal("")]).default("");
const date = z.string().datetime({ offset: true });
const labels = z.array(z.string().trim().min(1).max(100)).max(30);
const base = {
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
  title: localized,
  summary: localized,
  sourceUrl: httpsUrl,
  sourceName: z.string().trim().min(1).max(100),
  publishedAt: date,
  discoveredAt: date,
  updatedAt: date,
  verifiedAt: z.union([date, z.literal("")]).default(""),
  categories: labels,
  tags: labels,
  companyIds: labels.default([]),
  // Local images only. Rights and provenance must be recorded by an editor.
  image: z
    .string()
    .max(300)
    .refine(
      (v) =>
        !v ||
        (/^\/(events|radar)\/[a-zA-Z0-9 _./-]+\.(png|jpe?g|webp|avif)$/.test(
          v,
        ) &&
          !v.includes("..")) ||
        /^\/api\/radar\/media\/[a-f0-9-]{36}\.webp$/.test(v),
      "Upload an image or use a local /events/ or /radar/ image",
    )
    .default(""),
  imageAlt: localized.optional(),
  imageCredit: z.string().max(500).default(""),
  status: z.enum(["draft", "review", "published", "hidden"]).default("draft"),
  featured: z.boolean().default(false),
};

const news = z.object({
  ...base,
  kind: z.literal("news"),
  why: localized,
  importance: z.number().int().min(0).max(100).default(30),
  importanceReason: localized,
  originalTitle: z.string().max(600).default(""),
  languageMode: z.enum(["edited", "source-digest"]).default("edited"),
});
const models = z.object({
  ...base,
  kind: z.literal("models"),
  companyId: z.string().max(100),
  version: z.string().min(1).max(200),
  releasedAt: date,
  modalities: labels,
  capabilities: localized,
  useCases: localized,
  changes: localized,
  buildIdeas: localized,
  api: z.enum(["yes", "no", "unknown"]),
  openWeights: z.enum(["yes", "no", "unknown"]),
  docsUrl: httpsUrl,
  pricing: localized,
  pricingUrl: optionalUrl,
  benchmarks: z
    .array(
      z.object({
        name: z.string().max(100),
        value: z.string().max(100),
        sourceUrl: httpsUrl,
        measuredAt: date,
        attribution: z.enum(["vendor", "independent"]),
      }),
    )
    .max(10)
    .default([]),
});
const companies = z.object({
  ...base,
  kind: z.literal("companies"),
  country: localized,
  product: localized,
  startup: z.boolean().default(false),
  israeli: z.boolean().default(false),
  announcements: localized,
});
const tools = z.object({
  ...base,
  kind: z.literal("tools"),
  audience: localized,
  uses: localized,
  freePlan: z.enum(["yes", "no", "unknown"]),
  freePlanSource: optionalUrl,
  openSource: z.boolean().default(false),
  licenseUrl: optionalUrl,
  buildersPick: z.boolean().default(false),
  pickReason: localized.optional(),
});
const events = z.object({
  ...base,
  kind: z.literal("events"),
  organizer: z.string().trim().min(1).max(150),
  startsAt: date,
  endsAt: date,
  timezone: z.string().refine((v) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: v });
      return true;
    } catch {
      return false;
    }
  }, "Invalid IANA time zone"),
  location: localized,
  online: z.boolean().default(false),
  audience: localized,
  relationship: z.enum(["club", "partner", "recommended", "external"]),
  partner: z.string().max(150).default(""),
  eventType: z.enum([
    "conference",
    "workshop",
    "networking",
    "hackathon",
    "meetup",
    "online",
  ]),
  eventStatus: z.enum(["scheduled", "draft", "cancelled"]).default("draft"),
  registration: z.enum(["open", "closed", "unknown"]),
  registrationUrl: optionalUrl,
  agendaUrl: optionalUrl,
  cost: localized,
  benefit: localized.optional(),
  benefitApproved: z.boolean().default(false),
  discountCode: z.string().max(100).default(""),
  benefitUrl: optionalUrl,
});
const categories = z.object({
  id: base.id,
  kind: z.literal("categories"),
  title: localized,
  scope: z.enum(["topic", "industry", "tool", "tag"]),
});
// Fetching is restricted to explicitly supported RSS hosts, including redirects.
export const feedHosts = [
  "openai.com",
  "huggingface.co",
  "blog.google",
  "deepmind.google",
  "www.anthropic.com",
  "mistral.ai",
  "export.arxiv.org",
  "arxiv.org",
  "github.com",
];
const sources = z.object({
  id: base.id,
  kind: z.literal("sources"),
  title: localized,
  url: httpsUrl.refine((v) => {
    try {
      return feedHosts.includes(new URL(v).hostname);
    } catch {
      return false;
    }
  }, "Unsupported RSS host"),
  allowedHosts: z
    .array(z.enum(feedHosts as [string, ...string[]]))
    .min(1)
    .max(10),
  enabled: z.boolean(),
  autoPublish: z.boolean(),
  companyId: z.string().max(100).default(""),
  accessNote: z.string().min(1).max(1000),
});

export const recordSchema = z
  .discriminatedUnion("kind", [
    news,
    models,
    companies,
    tools,
    events,
    categories,
    sources,
  ])
  .superRefine((v, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    if ("status" in v && v.status === "published" && !v.verifiedAt)
      issue("Published content requires a source verification date");
    if ("image" in v && v.image && (!v.imageCredit || !v.imageAlt))
      issue("Image credit and bilingual alt text are required");
    if (v.kind === "events") {
      if (Date.parse(v.endsAt) <= Date.parse(v.startsAt))
        issue("Event must end after it starts");
      if (
        v.status === "published" &&
        (!v.verifiedAt || v.eventStatus === "draft")
      )
        issue(
          "Verify the event and choose Scheduled or Cancelled before publishing",
        );
      if (v.registration === "open" && !v.registrationUrl)
        issue("Open registration needs a URL");
      if ((v.benefit || v.discountCode || v.benefitUrl) && !v.benefitApproved)
        issue("Benefits require explicit editorial approval");
      if (v.relationship === "partner" && !v.partner)
        issue("Partner events require a partner name");
    }
    if (v.kind === "tools") {
      if (v.freePlan !== "unknown" && (!v.freePlanSource || !v.verifiedAt))
        issue("Free-plan claims require a source and verification date");
      if (v.openSource && !v.licenseUrl)
        issue("Open source requires a license source");
      if (v.buildersPick && !v.pickReason)
        issue("Builders' Pick requires an editorial reason");
    }
  });
export type RadarRecord = z.infer<typeof recordSchema>;
export type Content = Extract<
  RadarRecord,
  { kind: "news" | "models" | "companies" | "tools" | "events" }
>;
export type News = Extract<RadarRecord, { kind: "news" }>;
export type Model = Extract<RadarRecord, { kind: "models" }>;
export type RadarEvent = Extract<RadarRecord, { kind: "events" }>;
export type Source = Extract<RadarRecord, { kind: "sources" }>;
export type Category = Extract<RadarRecord, { kind: "categories" }>;
export type ImportJob = {
  id: string;
  startedAt: string;
  finishedAt: string;
  status: "running" | "success" | "partial" | "failed";
  inserted: number;
  duplicates: number;
  rejected: number;
  sources: {
    id: string;
    status: "success" | "failed";
    inserted: number;
    error?: string;
  }[];
};
export type Review = {
  id: string;
  contentId: string;
  kind: Collection;
  status: "pending" | "approved" | "hidden";
  reason: string;
  updatedAt: string;
};
export type Audit = {
  id: string;
  at: string;
  action: string;
  kind: Collection;
  contentId: string;
  before: RadarRecord | null;
  after: RadarRecord;
  actor: "admin";
};
export type StoreMap = {
  [K in Collection]: Extract<RadarRecord, { kind: K }>;
} & { jobs: ImportJob; reviews: Review; audit: Audit };
export type Table = keyof StoreMap;

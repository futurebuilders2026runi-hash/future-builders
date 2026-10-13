export const degreeValues = [
  "computer-science",
  "computer-science-entrepreneurship",
  "computer-science-cognition",
  "computer-science-pre-med",
] as const;

export const yearValues = ["2", "3"] as const;

export type ApplicationData = {
  firstName: string;
  lastName: string;
  degree: (typeof degreeValues)[number];
  year: (typeof yearValues)[number];
  phone: string;
  email: string;
  why: string;
  background: string;
  aiExperience: string;
  locale: "he" | "en";
};

export type ApplicationRecord = ApplicationData & {
  id: string;
  fullName: string;
  kind: "application";
  submittedAt: string;
};

export type ApplicationError =
  | "missing_fields"
  | "invalid_email"
  | "invalid_phone"
  | "invalid_degree"
  | "invalid_year"
  | "field_too_long";

export const applicationLimits = {
  firstName: 100,
  lastName: 100,
  degree: 100,
  year: 10,
  phone: 30,
  email: 254,
  why: 4000,
  background: 4000,
  aiExperience: 4000,
} as const;

export function validateApplication(body: unknown):
  | { data: ApplicationData; error?: never }
  | { error: ApplicationError; data?: never } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "missing_fields" };
  }

  const source = body as Record<string, unknown>;
  const fields: Record<string, string> = {};
  for (const [key, limit] of Object.entries(applicationLimits)) {
    const raw = source[key];
    if (raw !== undefined && typeof raw !== "string") {
      return { error: "missing_fields" };
    }
    const value = typeof raw === "string" ? raw.trim() : "";
    if (value.length > limit) return { error: "field_too_long" };
    if (!value && key !== "aiExperience") return { error: "missing_fields" };
    fields[key] = value;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return { error: "invalid_email" };
  }
  const digits = fields.phone.replace(/\D/g, "");
  if (!/^\+?[\d\s().-]+$/.test(fields.phone) || digits.length < 9 || digits.length > 15) {
    return { error: "invalid_phone" };
  }
  if (!degreeValues.includes(fields.degree as ApplicationData["degree"])) {
    return { error: "invalid_degree" };
  }
  if (!yearValues.includes(fields.year as ApplicationData["year"])) {
    return { error: "invalid_year" };
  }

  return {
    data: {
      ...fields,
      locale: source.locale === "en" ? "en" : "he",
    } as ApplicationData,
  };
}

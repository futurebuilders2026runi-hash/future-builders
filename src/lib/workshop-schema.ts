/** Registration for the Base44 hands-on workshop (23.12.2026). Shared by the form and the API. */

import { degreeValues } from "./application-schema";

export const WORKSHOP_ID = "base44-2026-12";

/** The club's four Computer Science tracks, plus anyone from elsewhere. */
export const workshopDegreeValues = [...degreeValues, "other"] as const;
export const workshopYearValues = ["1", "2", "3"] as const;

export const participationValues = ["solo", "team"] as const;
export type Participation = (typeof participationValues)[number];

export type WorkshopData = {
  fullName: string;
  phone: string;
  email: string;
  degree: (typeof workshopDegreeValues)[number];
  year: (typeof workshopYearValues)[number];
  participation: Participation;
  /** Teammates' names; empty when coming solo. */
  teamMembers: string;
  idea: string;
  aiDaily: string;
  locale: "he" | "en";
};

export type WorkshopRecord = WorkshopData & {
  id: string;
  workshop: string;
  submittedAt: string;
};

export type WorkshopError =
  | "missing_fields"
  | "missing_team"
  | "invalid_email"
  | "invalid_phone"
  | "invalid_degree"
  | "invalid_year"
  | "field_too_long";

export const workshopLimits = {
  fullName: 120,
  phone: 30,
  email: 254,
  degree: 100,
  year: 10,
  participation: 10,
  teamMembers: 1000,
  idea: 4000,
  aiDaily: 4000,
} as const;

export function validateWorkshop(body: unknown):
  | { data: WorkshopData; error?: never }
  | { error: WorkshopError; data?: never } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "missing_fields" };
  }

  const source = body as Record<string, unknown>;
  const fields: Record<string, string> = {};
  for (const [key, limit] of Object.entries(workshopLimits)) {
    const raw = source[key];
    if (raw !== undefined && typeof raw !== "string") return { error: "missing_fields" };
    const value = typeof raw === "string" ? raw.trim() : "";
    if (value.length > limit) return { error: "field_too_long" };
    if (!value && key !== "teamMembers") return { error: "missing_fields" };
    fields[key] = value;
  }

  if (!participationValues.includes(fields.participation as Participation)) {
    return { error: "missing_fields" };
  }
  if (fields.participation === "team" && !fields.teamMembers) return { error: "missing_team" };
  if (fields.participation === "solo") fields.teamMembers = "";

  if (!workshopDegreeValues.includes(fields.degree as WorkshopData["degree"])) return { error: "invalid_degree" };
  if (!workshopYearValues.includes(fields.year as WorkshopData["year"])) return { error: "invalid_year" };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return { error: "invalid_email" };
  const digits = fields.phone.replace(/\D/g, "");
  if (!/^\+?[\d\s().-]+$/.test(fields.phone) || digits.length < 9 || digits.length > 15) {
    return { error: "invalid_phone" };
  }

  return {
    data: { ...fields, locale: source.locale === "en" ? "en" : "he" } as WorkshopData,
  };
}

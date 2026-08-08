import { en, type Dict } from "./en";
import { he } from "./he";
import type { Locale } from "./config";

const dictionaries: Record<Locale, Dict> = { en, he };

export const getDict = (locale: Locale): Dict => dictionaries[locale];

export type { Dict };
export * from "./config";

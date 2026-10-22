import type { Content } from "./schema";

export type RadarTheme = "models" | "agents" | "research" | "builders" | "business";

const themes = {
  models: {
    image: "/radar/editorial/models.webp",
    label: { he: "הדור הבא של ה־AI", en: "THE NEXT MODEL" },
    alt: { he: "איור של ליבת מחשוב כחולה ושכבות זכוכית", en: "An illustrated blue computing core and layered glass" },
  },
  agents: {
    image: "/radar/editorial/agents.webp",
    label: { he: "AI בפעולה", en: "AI IN ACTION" },
    alt: { he: "איור של יחידות מחוברות במסלול פעולה", en: "An illustration of connected modules and flowing paths" },
  },
  research: {
    image: "/radar/editorial/research.webp",
    label: { he: "מחקר ורעיונות", en: "NEW FRONTIERS" },
    alt: { he: "איור של עלה זכוכית ומבנה מולקולרי", en: "An illustrated glass leaf and molecular structure" },
  },
  builders: {
    image: "/radar/editorial/builders.webp",
    label: { he: "בונים עם AI", en: "MADE FOR BUILDERS" },
    alt: { he: "איור של סימני קוד ואבני בניין כחולות", en: "An illustration of code brackets and blue building blocks" },
  },
  business: {
    image: "/radar/editorial/business.webp",
    label: { he: "התעשייה בתנועה", en: "INDUSTRY MOVES" },
    alt: { he: "איור של מבנים כחולים וקשתות זכוכית זהובות", en: "An illustration of blue structures and golden glass arcs" },
  },
};

export function radarTheme(item: Content): RadarTheme {
  const title = `${item.title.en} ${item.title.he}`.toLowerCase();
  if (item.kind === "models" || /\b(gemini|claude|llama|mistral|reasoning model)\b|introducing gpt|gpt-6/.test(title)) return "models";
  if (/forest|tree|nature|biolog|\bbio\b|health|molecul|peptide|science|מחקר/.test(title)) return "research";
  if (/cod|developer|programming|software|github|cursor|cline|transformers|playground|games|למפתחים/.test(title)) return "builders";
  if (/agent|automation|workflow|robot|franchise|legal|scam|work|סוכנ|אוטומצי/.test(title)) return "agents";
  if (/business|enterprise|economy|acquir|startup|funding|invest|finance|תעשייה|השקעות/.test(title)) return "business";
  if (item.kind === "tools" || item.categories.includes("developers")) return "builders";
  if (item.kind === "companies" || item.categories.includes("startups")) return "business";
  if (item.categories.includes("models")) return "models";
  if (item.categories.includes("agents")) return "agents";
  return "research";
}

export const radarTextDirection = (text: string) => /[\u0590-\u05ff]/.test(text) ? "rtl" : "ltr";

export function radarArtwork(item: Content) {
  const theme = radarTheme(item);
  return {
    theme,
    ...themes[theme],
    image: item.image || themes[theme].image,
    alt: item.image ? item.imageAlt || item.title : themes[theme].alt,
    illustration: !item.image,
  };
}

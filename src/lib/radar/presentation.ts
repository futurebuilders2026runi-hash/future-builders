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

// Club-supplied illustrations. Match the subject, leaving the original editorial
// collection (including the favourite builders cover) available as fallbacks.
const suppliedArtwork = [
  { match: /legacy|cobol|mainframe/i, image: "legacy-modernisation", alt: { he: "איור של מערכות מחשוב ותיקות המתחברות לכלי פיתוח ובינה מלאכותית", en: "An illustration connecting legacy systems with modern AI development tools" } },
  { match: /southeast asia/i, image: "connected-asia", alt: { he: "איור של עיר בדרום־מזרח אסיה ורשת חיבורים דיגיטלית", en: "An illustrated Southeast Asian city linked by a digital network" } },
  { match: /global data|every language|societal|private ai compute|olmoearth/i, image: "global-network", alt: { he: "איור של כדור הארץ בלילה וקשתות המחברות בין אזורים", en: "An illustration of Earth at night with connections between regions" } },
  { match: /in-house legal|franchisee|ai & economy|beam expands/i, image: "industry-office", alt: { he: "איור של בניין משרדים מודרני בשקיעה", en: "An illustrated modern office building at sunset" } },
  { match: /embeddinggemma|apertus|mps in pytorch|torchtpu|torchneuron|granite/i, image: "ai-compute", alt: { he: "איור של ליבת בינה מלאכותית זוהרת מעל מעגל אלקטרוני", en: "An illustrated glowing AI core on an electronic circuit" } },
  { match: /scam|live avatar|robotics|\bagents?\b/i, image: "robotic-interface", alt: { he: "איור של יד רובוטית הנוגעת בממשק דיגיטלי", en: "An illustrated robotic hand touching a digital interface" } },
];

export function radarArtwork(item: Content) {
  const theme = radarTheme(item);
  const supplied = suppliedArtwork.find((art) => art.match.test(item.kind === "news" ? item.originalTitle || item.title.en : item.title.en));
  return {
    theme,
    ...themes[theme],
    image: item.image || (supplied ? `/radar/selected/${supplied.image}.webp` : themes[theme].image),
    alt: item.image ? item.imageAlt || item.title : supplied?.alt || themes[theme].alt,
    illustration: !item.image,
  };
}

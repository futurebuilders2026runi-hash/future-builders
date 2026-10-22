import type { News } from "@/lib/radar/schema";

// Editorial translations of source headlines and RSS descriptions, reviewed
// October 2026. No article body is reproduced. Unknown headlines await review.
const entries = [
  ["Introducing SynthID Bio", "גוגל מציגה את SynthID Bio לסימון חלבונים שנוצרו ב־AI", "Google DeepMind מציגה הוכחת היתכנות לסימון חלבונים שנוצרו בעזרת AI, תוך שמירה על תפקודם הביולוגי."],
  ["Ensemble forecasting with IBM Granite time-series models", "חיזוי משולב בעזרת מודלי סדרות הזמן של IBM Granite", "פוסט ב־Hugging Face עוסק בשילוב תחזיות ממודלי סדרות הזמן של IBM Granite. פרטי השיטה וההערכה זמינים במקור."],
  ["Developing Gemini 4 Argon responsibly and safely", "כיצד גוגל מפתחת את Gemini 4 Argon באחריות ובבטיחות", "גוגל מפרסמת עדכון על גישתה לפיתוח אחראי ובטוח של Gemini 4 Argon. את שיטות הבדיקה והמגבלות יש לקרוא בפרסום המקורי."],
  ["Advancing Private AI Compute with secure, server-side memory", "זיכרון מאובטח בצד השרת מצטרף ל־Private AI Compute", "Google DeepMind מציגה זיכרון פרטי בצד השרת במסגרת Private AI Compute, עבור שימושים של AI אישי."],
  ["Franchisee reconciles cash in 94% less time with ChatGPT Work", "זכיין מדווח על קיצור של 94% בזמן התאמת המזומנים בעזרת ChatGPT Work", "בסיפור לקוח שפרסמה OpenAI, זכיין מדווח על קיצור של 94% בזמן התאמת המזומנים בעזרת ChatGPT Work. זהו נתון המיוחס למקור, ולא מדידה עצמאית של המועדון."],
  ["New experts join Google’s AI & Economy team", "מומחים חדשים מצטרפים לצוות הבינה המלאכותית והכלכלה של גוגל", "גוגל מרחיבה את צוות הבינה המלאכותית והכלכלה שלה ביועצים אקדמיים, עמיתים וחוקרים נוספים."],
  ["Co-creating the future of fashion with Google", "גוגל ומעצבי אופנה בונים יחד כלים ליצירה", "גוגל מספרת על עבודה עם המעצבים Jane Wade ו־Sergio Hudson להתאמת כלי Google Flow לקראת שבוע האופנה בניו יורק."],
  ["Apertus 1.5 Release Notes", "מה חדש בגרסה 1.5 של Apertus?", "צוות Swiss AI מפרסם הערות גרסה עבור Apertus 1.5 ב־Hugging Face. השינויים וההנחיות הטכניות מפורטים במקור."],
  ["How AT&T is rethinking in-house legal work with OpenAI", "כיצד AT&T משנה את העבודה המשפטית בעזרת OpenAI", "OpenAI מתארת כיצד צוות LegalEdge של AT&T פועל להנגשת ידע משפטי ולשינוי אופן הטיפול בפניות פנימיות בעזרת AI."],
  ["Hugging Face ❤️ TorchTPU: TPUs, Natively", "Hugging Face ו־TorchTPU: עבודה ישירה עם מאיצי TPU", "Hugging Face מציגה עדכון על TorchTPU ועל עבודה עם מאיצי TPU. ההתקנה, התאימות וההנחיות הטכניות זמינות בפרסום המקורי."],
  ["Accelerating the search for antimicrobial peptides with Google Antigravity", "מאיצים את החיפוש אחר פפטידים אנטימיקרוביאליים בעזרת Google Antigravity", "Google DeepMind מתארת שימוש ב־Google Antigravity for Science כדי להאיץ את החיפוש אחר פפטידים אנטימיקרוביאליים חדשים."],
  ["How Specializing the Vocabulary of SLMs Can Cut Inference Cost by 77% in Real Applications", "התאמת אוצר המילים של מודלים קטנים: טענה לחיסכון של 77% בעלות ההרצה", "פוסט של Dharma AI ב־Hugging Face מתאר התאמה של אוצר המילים במודלי שפה קטנים, ומדווח על חיסכון של 77% בעלות ההרצה ביישומים שנבדקו. תנאי הניסוי והמגבלות מופיעים במקור."],
  ["Building AI to accelerate science and improve lives", "בונים בינה מלאכותית שמקדמת מדע ומשפרת חיים", "גוגל מציגה יישומים של AI במדע ובחיי היומיום, ומתארת תחומים שבהם היא מבקשת לקדם התקדמות בעזרת הטכנולוגיה."],
  ["AnyLanguageModel 1.0: One Year of Local Models on Apple Platforms", "AnyLanguageModel 1.0: שנה של מודלים מקומיים בפלטפורמות של Apple", "פוסט ב־Hugging Face מסכם שנה של עבודה עם מודלים מקומיים בפלטפורמות של Apple ומציג את AnyLanguageModel 1.0."],
  ["Making global data easier to explore", "גוגל והאו״ם מנגישים נתונים עולמיים לחיפוש ולמחקר", "גוגל ומערכת האו״ם משיקות את UN System Data Commons, פלטפורמה פתוחה שנועדה להקל על גישה לנתונים סטטיסטיים עולמיים ועל החיפוש בהם."],
  ["Profiling TorchNeuron (Part 1): System-level profiling on AWS Trainium.", "ניתוח ביצועי TorchNeuron על AWS Trainium — חלק ראשון", "פוסט של Amazon ב־Hugging Face עוסק בניתוח ביצועים ברמת המערכת של TorchNeuron על מאיצי AWS Trainium."],
  ["TorchNeuron: running HF models on AWS Trainium is easier than ever", "TorchNeuron מקל על הרצת מודלים של Hugging Face על AWS Trainium", "Hugging Face מציגה עדכון על TorchNeuron ועל הרצת מודלים על מאיצי AWS Trainium. פרטי ההגדרה והתאימות מפורטים במקור."],
  ["EmbeddingGemma 2: an open, lightweight multimodal embedding model", "EmbeddingGemma 2: מודל הטמעה פתוח וקל משקל למגוון סוגי מידע", "גוגל מציגה את EmbeddingGemma 2 כמודל הטמעה פתוח, קל משקל ורב־אופני. פרטי הגישה והיכולות מופיעים בהכרזה המקורית."],
  ["OlmoEarth v1.3: State-of-the-art embeddings for the whole planet", "OlmoEarth 1.3: ייצוגים מספריים למידע על כדור הארץ", "Allen AI מציגה ב־Hugging Face את OlmoEarth 1.3 ואת ייצוגי ההטמעה שלו למידע על כדור הארץ. טענות הביצועים ופרטי ההערכה מיוחסים למקור."],
  ["Southeast Asia’s digital economy to hit $368 billion", "הכלכלה הדיגיטלית בדרום־מזרח אסיה צפויה להגיע ל־368 מיליארד דולר", "לפי דוח שפרסמה גוגל, אימוץ נרחב של AI מסייע להניע את הכלכלה הדיגיטלית בדרום־מזרח אסיה, הצפויה להגיע ל־368 מיליארד דולר ב־2026. זהו אומדן של הדוח."],
  ["AI for everyone in every language", "בינה מלאכותית לכולם, בכל שפה", "גוגל מתארת עבודה על מודלים שנועדו להבין שפות כפי שהן מדוברות ומתבטאות, מעבר לתרגום טקסט מסורתי."],
  ["Watch the winning trailer from the Future Vision XPRIZE, The Gifted.", "הכירו את The Gifted, הטריילר הזוכה ב־Future Vision XPRIZE", "גוגל משתפת את The Gifted, הטריילר הזוכה בתחרות Future Vision XPRIZE. אפשר לצפות בו דרך הפרסום המקורי."],
  ["Google Beam expands with new regions, partners, and customers", "Google Beam מתרחב למדינות נוספות ולשותפים חדשים", "גוגל מודיעה על הרחבת Google Beam לחמש מדינות נוספות ועל שיתוף פעולה עם Industrious להרחבת הרשת."],
  ["Gemini 4 Argon: our next era of frontier intelligence", "Gemini 4 Argon: גוגל מציגה דור חדש של יכולות AI", "גוגל מציגה את Gemini 4 Argon ואת חזונה לדור הבא של המודל. היכולות ותנאי הגישה המוצהרים מפורטים במקור."],
  ["Beyond tree cover: mapping the world’s forest types", "מעבר לכיסוי העצים: ממפים את סוגי היערות בעולם", "Google DeepMind מציגה מפה עולמית המסווגת שטחי יבשה ברזולוציה של עשרה מטרים לפי סוגי יערות."],
  ["NVIDIA Kumo Relational Outperforms Supervised Machine Learning on Relational Data, No Training Required", "NVIDIA מציגה את Kumo Relational לניתוח נתונים יחסיים ללא אימון ייעודי", "בפוסט ב־Hugging Face, NVIDIA מדווחת כי Kumo Relational עולה על שיטות למידה מונחית בבדיקות של נתונים יחסיים ללא אימון ייעודי. זו טענת המפרסם; פרטי ההשוואה זמינים במקור."],
  ["The latest AI news we announced in September 2026", "כל עדכוני הבינה המלאכותית של גוגל מספטמבר 2026", "גוגל מרכזת את הכרזות ה־AI שלה מספטמבר 2026. הפירוט והקישורים לעדכונים זמינים בסקירה המקורית."],
  ["Google DeepMind and Singapore Government collaborate to build fine-tuned AI model for scam detection", "Google DeepMind וסינגפור מפתחות מודל לזיהוי הונאות במכשיר", "Google DeepMind ו־GovTech Singapore מתארות שימוש במודלי Gemma קלי משקל לזיהוי הונאות בשיחות פרטיות, בעיבוד מקומי ללא העברת תוכן השיחה לענן."],
  ["MPS in PyTorch 2.15", "מה חדש בתמיכת MPS ב־PyTorch 2.15?", "פוסט ב־Hugging Face סוקר את MPS ב־PyTorch 2.15. פרטי התמיכה והשימוש מפורטים בפרסום המקורי."],
  ["Granite Speech 5.0: Transcribe, Translate, and Attribute more Accurately and Faster", "Granite Speech 5.0: עדכון לתמלול, לתרגום ולזיהוי דוברים", "IBM מציגה ב־Hugging Face את Granite Speech 5.0 ומדווחת על שיפורים בדיוק ובמהירות. פרטי הבדיקות והמגבלות זמינים במקור."],
  ["Gemini 3.8 text-to-speech says hello", "Gemini 3.8 מציג יכולות המרת טקסט לדיבור", "גוגל מפרסמת עדכון על יכולות המרת הטקסט לדיבור של Gemini 3.8. דוגמאות ופרטי השימוש מופיעים בהכרזה המקורית."],
  ["Welcome Beam: a 501B open model you can own, customize, and scale", "הכירו את Beam: מודל פתוח עם 501 מיליארד פרמטרים", "Hugging Face מציגה את Beam כמודל פתוח בעל 501 מיליארד פרמטרים, שניתן להתאים ולהרחיב. לפני שימוש יש לבדוק את תנאי הרישיון והדרישות בפרסום המקורי."],
  ["Introducing Gemini 3.8 Live with Live Avatar", "גוגל מציגה את Gemini 3.8 Live עם אווטאר בזמן אמת", "גוגל מכריזה על Gemini 3.8 Live עם Live Avatar. אופן הפעולה ותנאי הזמינות מפורטים בפרסום המקורי."],
  ["AI for Societal Impact", "בינה מלאכותית למען השפעה חברתית", "גוגל מרכזת דוגמאות לאופן שבו מומחים ומנהיגים מקומיים משתמשים ב־AI כדי להרחיב את הגישה להזדמנויות שהוא מציע."],
  ["Introducing Playground: Create and play custom games", "גוגל מציגה את Playground: יוצרים ומשחקים במשחקים משלכם", "גוגל מציגה את Playground, פלטפורמת משחקים ניסיונית ליצירה, למשחק ולשיתוף של משחקים בהתאמה אישית."],
] as const;

export const reviewedHebrewNews = new Map<string, { title: string; summary: string }>(
  entries.map(([original, title, summary]) => [original, { title, summary }]),
);

export function applyReviewedHebrew(article: News): News {
  // Never overwrite an editor's existing Hebrew copy or an unrelated headline.
  if (article.title.he !== article.title.en) return article;
  const translation = reviewedHebrewNews.get(article.originalTitle || article.title.en);
  if (!translation) return article;
  return {
    ...article,
    title: { ...article.title, he: translation.title },
    summary: { ...article.summary, he: translation.summary },
    languageMode: "edited",
  };
}

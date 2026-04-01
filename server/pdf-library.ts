import fs from "fs";
import path from "path";

const REPORTS_DIR = path.join(process.cwd(), "client/public/assets/reports");
const EXTRA_DIR   = path.join(process.cwd(), "client/public/reports");

export interface PdfEntry {
  id: string;
  title: string;
  series: "IRL" | "Insights" | "Launch" | "Public";
  tags: string[];
  file: string;
  dir: "reports" | "extra";
  url: string;
}

export const PDF_CATALOG: PdfEntry[] = [
  {
    id: "irl-believability",
    title: "Believability Is the New Branding",
    series: "IRL",
    tags: ["authenticity","brand trust","credibility","branding","consumer trust","transparency"],
    file: "innovatr-irl-believability-is-the-new-branding.pdf",
    dir: "reports",
    url: "/assets/reports/innovatr-irl-believability-is-the-new-branding.pdf",
  },
  {
    id: "irl-fairness-flex",
    title: "Fairness Is the New Flex",
    series: "IRL",
    tags: ["fairness","value","equity","pricing","social contract","cost of living"],
    file: "innovatr-irl-fairness-flex.pdf",
    dir: "reports",
    url: "/assets/reports/innovatr-irl-fairness-flex.pdf",
  },
  {
    id: "irl-indulgence",
    title: "Indulgence Without Guilt",
    series: "IRL",
    tags: ["indulgence","treats","wellbeing","snacks","permissible indulgence","pleasure"],
    file: "innovatr-irl-indulgence-without-guilt.pdf",
    dir: "reports",
    url: "/assets/reports/innovatr-irl-indulgence-without-guilt.pdf",
  },
  {
    id: "irl-simplicity",
    title: "Simplicity Has Status",
    series: "IRL",
    tags: ["simplicity","premium","status","minimalism","quality","essential","positioning"],
    file: "innovatr-irl-simplicity-has-status.pdf",
    dir: "reports",
    url: "/assets/reports/innovatr-irl-simplicity-has-status.pdf",
  },
  {
    id: "irl-effortless",
    title: "The Age of Effortless",
    series: "IRL",
    tags: ["convenience","ease","frictionless","digital","consumer experience","service"],
    file: "innovatr-irl-the-age-of-effortless.pdf",
    dir: "reports",
    url: "/assets/reports/innovatr-irl-the-age-of-effortless.pdf",
  },
  {
    id: "irl-human-subscription",
    title: "The Human Subscription",
    series: "IRL",
    tags: ["loyalty","subscription","community","belonging","membership","retention","relationship"],
    file: "innovatr-irl-the-human-subscription.pdf",
    dir: "reports",
    url: "/assets/reports/innovatr-irl-the-human-subscription.pdf",
  },
  {
    id: "irl-local-logic",
    title: "The Return of Local Logic",
    series: "IRL",
    tags: ["local","township","community","south africa","origin","pride","regional"],
    file: "innovatr-irl-the-return-of-local-logic.pdf",
    dir: "reports",
    url: "/assets/reports/innovatr-irl-the-return-of-local-logic.pdf",
  },
  {
    id: "irl-third-place",
    title: "The Return of the Third Place",
    series: "IRL",
    tags: ["out of home","café","community space","social","gathering","retail","experience"],
    file: "innovatr-irl-the-return-of-the-third-place.pdf",
    dir: "reports",
    url: "/assets/reports/innovatr-irl-the-return-of-the-third-place.pdf",
  },
  {
    id: "insights-banking",
    title: "Banking Monogamy Is Dead",
    series: "Insights",
    tags: ["banking","fintech","finance","multi-banking","loyalty","digital","money"],
    file: "Innovatr Insights X Banking Monogamy.pdf",
    dir: "reports",
    url: "/assets/reports/Innovatr Insights X Banking Monogamy.pdf",
  },
  {
    id: "insights-vegan",
    title: "From Vegan to Vital",
    series: "Insights",
    tags: ["plant-based","vegan","health","protein","nutrition","food","wellness","diet"],
    file: "Innovatr Insights X From Vegan to Vital.pdf",
    dir: "reports",
    url: "/assets/reports/Innovatr Insights X From Vegan to Vital.pdf",
  },
  {
    id: "insights-moderation",
    title: "The Moderation Movement",
    series: "Insights",
    tags: ["alcohol","moderation","mindful drinking","low alcohol","health","wellness","beverage"],
    file: "Innovatr Insights X Moderation Movement.pdf",
    dir: "reports",
    url: "/assets/reports/Innovatr Insights X Moderation Movement.pdf",
  },
  {
    id: "insights-treat",
    title: "The New Non-Negotiable Treat",
    series: "Insights",
    tags: ["snacking","confectionery","treat","pleasure","indulgence","fmcg","food","consumer"],
    file: "Innovatr Insights X The New Non Negotiable Treat.pdf",
    dir: "reports",
    url: "/assets/reports/Innovatr Insights X The New Non Negotiable Treat.pdf",
  },
  {
    id: "insights-snacks",
    title: "Cutting Back But Not on Snacks",
    series: "Insights",
    tags: ["snacks","cost of living","value","trading down","fmcg","food","price sensitivity"],
    file: "cutting-back-but-not-on-snacks.pdf",
    dir: "reports",
    url: "/assets/reports/cutting-back-but-not-on-snacks.pdf",
  },
  {
    id: "launch-cadbury",
    title: "Cadbury Pocket-Sized Joy",
    series: "Launch",
    tags: ["cadbury","confectionery","chocolate","launch","fmcg","packaging","innovation"],
    file: "Innovatr Launch X Cadbury Pocket-Sized Joy.pdf",
    dir: "reports",
    url: "/assets/reports/Innovatr Launch X Cadbury Pocket-Sized Joy.pdf",
  },
  {
    id: "launch-snack-box",
    title: "From Meal Kits to Snack Boxes",
    series: "Launch",
    tags: ["meal kit","subscription","food delivery","convenience","snack","fmcg"],
    file: "Innovatr Launch X Snack Box Meal Kits.pdf",
    dir: "reports",
    url: "/assets/reports/Innovatr Launch X Snack Box Meal Kits.pdf",
  },
  {
    id: "launch-oat",
    title: "The Oat-Based Breakfast Revolution",
    series: "Launch",
    tags: ["oat","breakfast","health","cereal","plant-based","innovation","food"],
    file: "Innovatr Launch X The Oat-Based Breakfast Revolution.pdf",
    dir: "reports",
    url: "/assets/reports/Innovatr Launch X The Oat-Based Breakfast Revolution.pdf",
  },
  {
    id: "launch-instant",
    title: "The Race for Instant Gratification",
    series: "Launch",
    tags: ["instant","delivery","convenience","speed","ecommerce","digital","consumer"],
    file: "Innovatr Launch X The Race For Instant Gratification.pdf",
    dir: "reports",
    url: "/assets/reports/Innovatr Launch X The Race For Instant Gratification.pdf",
  },
  {
    id: "public-cash",
    title: "Cash Is King Again",
    series: "Public",
    tags: ["cash","economy","pricing","value","affordability","cost of living","spending"],
    file: "cash-is-king-again.pdf",
    dir: "extra",
    url: "/reports/cash-is-king-again.pdf",
  },
  {
    id: "public-clinic",
    title: "Clinic vs Clicks vs Creator",
    series: "Public",
    tags: ["beauty","skincare","creator","influencer","health","wellness","digital"],
    file: "clinic-vs-clicks-vs-creator.pdf",
    dir: "extra",
    url: "/reports/clinic-vs-clicks-vs-creator.pdf",
  },
  {
    id: "public-home-bar",
    title: "Home Is the New Bar",
    series: "Public",
    tags: ["out of home","alcohol","beverage","home","socialising","premiumisation","drinks"],
    file: "home-is-the-new-bar.pdf",
    dir: "extra",
    url: "/reports/home-is-the-new-bar.pdf",
  },
  {
    id: "public-price-memory",
    title: "Price Memory Is Brutal",
    series: "Public",
    tags: ["pricing","price sensitivity","consumer","inflation","value","positioning"],
    file: "price-memory-is-brutal.pdf",
    dir: "extra",
    url: "/reports/price-memory-is-brutal.pdf",
  },
  {
    id: "public-township-beauty",
    title: "Township Beauty Economy",
    series: "Public",
    tags: ["township","beauty","south africa","economy","consumer","local","market"],
    file: "township-beauty-economy.pdf",
    dir: "extra",
    url: "/reports/township-beauty-economy.pdf",
  },
];

const textCache = new Map<string, string>();

async function extractPdfText(entry: PdfEntry): Promise<string> {
  if (textCache.has(entry.id)) return textCache.get(entry.id)!;

  const dir = entry.dir === "reports" ? REPORTS_DIR : EXTRA_DIR;
  const filePath = path.join(dir, entry.file);

  if (!fs.existsSync(filePath)) return "";

  try {
    // Dynamic import to avoid issues at module load time
    const pdfParse = (await import("pdf-parse")).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const text = data.text || "";
    textCache.set(entry.id, text);
    return text;
  } catch {
    return "";
  }
}

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","up","about","into","through","during","is","are","was",
  "were","be","been","being","have","has","had","do","does","did","will",
  "would","could","should","may","might","shall","can","need","it","its",
  "that","this","these","those","they","their","them","we","our","you",
  "your","he","she","his","her","i","my","me","what","which","who","how",
  "when","where","why","all","both","each","few","more","most","other",
  "some","such","no","not","only","same","so","than","too","very","just",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map(p => p.replace(/\s+/g, " ").trim())
    .filter(p => p.length > 60 && p.length < 800);
}

function scoreParagraph(tokens: string[], queryTokens: string[]): number {
  let hits = 0;
  for (const qt of queryTokens) {
    if (tokens.includes(qt)) hits++;
    else {
      // Partial match bonus
      for (const t of tokens) {
        if (t.startsWith(qt) || qt.startsWith(t)) { hits += 0.4; break; }
      }
    }
  }
  return hits / Math.max(queryTokens.length, 1);
}

export interface SearchResult {
  entry: PdfEntry;
  excerpt: string;
  score: number;
}

export async function searchPDFs(
  query: string,
  filter: "trends" | "research" | "combined",
  maxResults = 6
): Promise<SearchResult[]> {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const candidates = PDF_CATALOG.filter(e => {
    if (filter === "trends") return e.series !== "Public" || true;
    return true;
  });

  const results: SearchResult[] = [];

  await Promise.all(
    candidates.map(async (entry) => {
      const text = await extractPdfText(entry);
      if (!text) return;

      const paragraphs = splitParagraphs(text);

      // Also consider tag overlap for pre-filtering
      const tagScore = entry.tags.some(t =>
        queryTokens.some(qt => t.includes(qt) || qt.includes(t))
      ) ? 0.3 : 0;

      let best = 0;
      let bestPara = "";

      for (const para of paragraphs) {
        const tokens = tokenize(para);
        const s = scoreParagraph(tokens, queryTokens);
        if (s > best) { best = s; bestPara = para; }
      }

      const total = best + tagScore;
      if (total > 0.1 && bestPara) {
        results.push({ entry, excerpt: bestPara, score: total });
      }
    })
  );

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

const SERIES_COLORS: Record<string, string> = {
  IRL: "#3A2FBF",
  Insights: "#2A9E5C",
  Launch: "#E8503A",
  Public: "#1A8FAD",
};

export function getSeriesColor(series: string): string {
  return SERIES_COLORS[series] || "#8A7260";
}

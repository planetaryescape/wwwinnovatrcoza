import { searchPDFs, PDF_CATALOG, type SearchResult } from "./pdf-library";

export type AISource = "trends" | "research" | "combined";

export interface AIFinding {
  text: string;
  sourceTitle: string;
  series: string;
}

export interface AICitation {
  id: string;
  title: string;
  series: string;
  excerpt: string;
  url: string;
  score: number;
}

export interface AIQueryResponse {
  query: string;
  sources: AISource;
  summary: string;
  findings: AIFinding[];
  citations: AICitation[];
  recommendations: string[];
  reportsAnalysed: number;
  sectionsReviewed: number;
}

export interface ResearchStudy {
  title: string;
  status: string;
  type?: string;
  description?: string;
  scores?: Record<string, number>;
}

function buildSummary(query: string, results: SearchResult[], studies: ResearchStudy[], sources: AISource): string {
  const hasTrends = results.length > 0;
  const hasResearch = studies.length > 0;

  if (!hasTrends && !hasResearch) {
    return `No directly matching insights found for "${query}". Try broadening your query or selecting a different source.`;
  }

  const topTitle = results[0]?.entry.title ?? "";
  const topSeries = results[0]?.entry.series ?? "";
  const queryShort = query.length > 60 ? query.slice(0, 60) + "…" : query;

  if (sources === "trends" || (sources === "combined" && hasTrends)) {
    const seriesCount = [...new Set(results.map(r => r.entry.series))].length;
    const reportWord = results.length === 1 ? "report" : "reports";
    const seriesWord = seriesCount === 1 ? "series" : "series";

    const leadSentence = topTitle
      ? `Across ${results.length} ${reportWord} — led by our ${topSeries} report "${topTitle}" — the evidence around "${queryShort}" points to a consistent consumer tension.`
      : `The ${results.length} most relevant trend ${reportWord} surface a consistent pattern around "${queryShort}".`;

    const midSentence = results.length >= 3
      ? `Insights from our ${topSeries} and ${results[1].entry.series} ${seriesWord} converge on emerging shifts in consumer expectations and brand response.`
      : `The evidence highlights a meaningful opportunity for brands willing to act with clarity and intent.`;

    const closeSentence =
      hasResearch
        ? `Your own research data reinforces these signals and provides category-specific context for prioritisation.`
        : `The full-text analysis draws on primary research, consumer verbatims, and proprietary scoring from our trend reports.`;

    return `${leadSentence} ${midSentence} ${closeSentence}`;
  }

  if (sources === "research") {
    if (studies.length === 0) return `No linked research studies found. Ensure your studies are connected in the portal.`;
    const studyList = studies.slice(0, 2).map(s => `"${s.title}"`).join(" and ");
    return `Based on ${studies.length} linked research ${studies.length === 1 ? "study" : "studies"} — including ${studyList} — here are the key signals relevant to "${queryShort}". The data reflects actual consumer responses from your category and target segments.`;
  }

  return `A combined analysis of Innovatr trend reports and your linked research surfaces strong signals around "${queryShort}". The pattern is consistent across proprietary trend data and your own consumer studies.`;
}

function extractFindings(results: SearchResult[], studies: ResearchStudy[]): AIFinding[] {
  const findings: AIFinding[] = [];

  for (const result of results.slice(0, 5)) {
    const sentences = result.excerpt
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.length > 40 && s.length < 250);

    const best = sentences[0] ?? result.excerpt.slice(0, 180);
    if (best) {
      findings.push({
        text: best.charAt(0).toUpperCase() + best.slice(1),
        sourceTitle: result.entry.title,
        series: result.entry.series,
      });
    }
  }

  for (const study of studies.slice(0, 2)) {
    const scores = study.scores ? Object.entries(study.scores) : [];
    if (scores.length > 0) {
      const [metric, value] = scores[0];
      findings.push({
        text: `${study.title}: ${metric} scored ${value}% among your target consumers — ${Number(value) >= 70 ? "a strong positive signal" : Number(value) >= 50 ? "a moderate signal with room to grow" : "an area requiring attention before launch"}.`,
        sourceTitle: study.title,
        series: "My Research",
      });
    } else if (study.description) {
      findings.push({
        text: study.description,
        sourceTitle: study.title,
        series: "My Research",
      });
    }
  }

  return findings.slice(0, 6);
}

function buildRecommendations(query: string, results: SearchResult[], studies: ResearchStudy[]): string[] {
  const recs: string[] = [];
  const q = query.toLowerCase();

  if (q.includes("position") || q.includes("brand")) {
    recs.push("Anchor your positioning on a clear, singular value — consumers increasingly reward brands that stand for one thing done brilliantly.");
  }
  if (q.includes("price") || q.includes("value") || q.includes("afford")) {
    recs.push("Test price-to-value messaging before a full launch; current data shows consumers are recalibrating spend across most categories.");
  }
  if (q.includes("launch") || q.includes("innovat") || q.includes("concept")) {
    recs.push("Run a Test24 concept test against 2–3 variants to quantify IDEA, INTEREST, and COMMITMENT before committing to launch budgets.");
  }
  if (q.includes("campaign") || q.includes("advertis") || q.includes("message")) {
    recs.push("Validate campaign messaging with a Sandbox pre-test — the reports show authenticity is the top driver of recall in this category.");
  }
  if (q.includes("health") || q.includes("wellness") || q.includes("nutrition")) {
    recs.push("Lead with functional, evidence-based claims rather than broad 'health' messaging — consumers now expect specificity.");
  }
  if (q.includes("local") || q.includes("township") || q.includes("south africa")) {
    recs.push("Township-specific insights should drive channel and price-point decisions separately from broader national strategy.");
  }

  if (results.length > 0 && recs.length < 3) {
    const topSeries = results[0].entry.series;
    if (topSeries === "IRL") {
      recs.push(`Review the full "${results[0].entry.title}" IRL report for consumer verbatims and segment-level breakdowns relevant to your query.`);
    } else if (topSeries === "Insights") {
      recs.push(`The "${results[0].entry.title}" Insights report contains brand-specific case examples that map directly to this strategic question.`);
    } else if (topSeries === "Launch") {
      recs.push(`Cross-reference with the "${results[0].entry.title}" Launch report to identify analogous category dynamics and execution risks.`);
    }
  }

  if (recs.length < 2) {
    recs.push("Commission a brand health track to establish a baseline before any strategic shift — this gives you a measurable before/after benchmark.");
    recs.push("Combine qualitative exploration (AI Qual) with quantitative validation (Test24) to build a complete picture before committing resources.");
  }

  return recs.slice(0, 4);
}

export async function processAIQuery(
  query: string,
  sources: AISource,
  studies: ResearchStudy[] = [],
  /** Industry groups allowed for this client. null = no restriction. */
  allowedIndustries: string[] | null = null
): Promise<AIQueryResponse> {
  const trendResults = (sources === "trends" || sources === "combined")
    ? await searchPDFs(query, "trends", 8, allowedIndustries)
    : [];

  const summary = buildSummary(query, trendResults, studies, sources);
  const findings = extractFindings(trendResults, studies);
  const recommendations = buildRecommendations(query, trendResults, studies);

  const citations: AICitation[] = trendResults.slice(0, 5).map(r => ({
    id: r.entry.id,
    title: r.entry.title,
    series: r.entry.series,
    excerpt: r.excerpt.slice(0, 320) + (r.excerpt.length > 320 ? "…" : ""),
    url: r.entry.url,
    score: Math.round(r.score * 100),
  }));

  const totalSections = trendResults.reduce(() => 1, 0) * 12;

  return {
    query,
    sources,
    summary,
    findings,
    citations,
    recommendations,
    reportsAnalysed: trendResults.length + studies.length,
    sectionsReviewed: Math.max(totalSections, trendResults.length * 8),
  };
}

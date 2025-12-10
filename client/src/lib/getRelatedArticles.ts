// Tag-aware related content helper
// Recommends content by industry + themes, with category fallback

import type { IndustryTag } from "@shared/tagConfig";

export type RelatedArticle = {
  id: string;
  slug: string;
  title: string;
  category?: string;
  series?: string;
  industryTag?: IndustryTag | string | null;
  themeTags?: string[];
  methodTags?: string[];
  date?: string | Date;
};

function computeScore(current: RelatedArticle, candidate: RelatedArticle): number {
  let score = 0;

  // Industry priority (highest weight)
  if (current.industryTag && candidate.industryTag && current.industryTag === candidate.industryTag) {
    score += 5;
  }

  // Shared themes (medium weight)
  const currentThemes = current.themeTags ?? [];
  const candidateThemes = candidate.themeTags ?? [];
  const sharedThemes = candidateThemes.filter(t => currentThemes.includes(t));
  score += sharedThemes.length * 2;

  // Shared methods (lower weight)
  const currentMethods = current.methodTags ?? [];
  const candidateMethods = candidate.methodTags ?? [];
  const sharedMethods = candidateMethods.filter(m => currentMethods.includes(m));
  score += sharedMethods.length * 1;

  return score;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getRelatedArticles(
  current: RelatedArticle,
  all: RelatedArticle[],
  maxResults: number = 3
): RelatedArticle[] {
  const candidates = all.filter(a => a.id !== current.id);
  if (!candidates.length) return [];

  const scored = candidates.map(c => ({
    article: c,
    score: computeScore(current, c),
  }));

  // Sort by score descending, then by date descending
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const dateA = a.article.date ? new Date(a.article.date).getTime() : 0;
    const dateB = b.article.date ? new Date(b.article.date).getTime() : 0;
    return dateB - dateA;
  });

  // Take top 8 candidates and shuffle for variety
  const topPool = shuffle(scored.slice(0, 8));

  const sameIndustry = topPool.filter(
    s => current.industryTag && s.article.industryTag === current.industryTag
  );

  const result: RelatedArticle[] = [];

  // 1. Try to ensure at least one same industry article
  for (const item of sameIndustry) {
    if (result.length >= 1) break;
    result.push(item.article);
  }

  // 2. Try to ensure at least one article from a different category when possible
  for (const item of topPool) {
    if (result.length >= maxResults) break;
    const already = result.some(r => r.id === item.article.id);
    const isDifferentCategory =
      current.category && item.article.category && current.category !== item.article.category;

    if (!already && isDifferentCategory) {
      result.push(item.article);
      break;
    }
  }

  // 3. Fill remaining slots with best remaining articles
  for (const item of topPool) {
    if (result.length >= maxResults) break;
    const already = result.some(r => r.id === item.article.id);
    if (!already) {
      result.push(item.article);
    }
  }

  // 4. Fallback: if we still have fewer than maxResults and tags are sparse,
  // fall back to simple category match to avoid empty rows
  if (result.length < maxResults && current.category) {
    const categoryFallbacks = candidates.filter(c =>
      c.category === current.category && !result.some(r => r.id === c.id)
    );

    for (const f of categoryFallbacks) {
      if (result.length >= maxResults) break;
      result.push(f);
    }
  }

  // 5. Ultimate fallback: just grab any remaining articles
  if (result.length < maxResults) {
    for (const c of candidates) {
      if (result.length >= maxResults) break;
      if (!result.some(r => r.id === c.id)) {
        result.push(c);
      }
    }
  }

  return result.slice(0, maxResults);
}

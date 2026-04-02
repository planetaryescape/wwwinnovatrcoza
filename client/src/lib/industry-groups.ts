/**
 * Frontend mirror of server/pdf-library.ts → resolveIndustryGroups()
 * Returns the set of industry group tags this company can access,
 * or null for Market Research companies (see everything).
 */
export function resolveIndustryGroups(companyIndustry: string | null | undefined): string[] | null {
  if (!companyIndustry) return null;

  const key = companyIndustry.toLowerCase().trim();

  const rules: [RegExp | string, string[] | null][] = [
    [/bank|financ|fintech|insur/,                             ["cross-industry", "finance"]],
    // Generic FMCG sees all sub-categories
    [/^fmcg$/,                                               ["cross-industry", "fmcg", "food", "beverage", "qsr", "retail"]],
    // Food manufacturers see food signals only
    [/^food$|food manufactur|food prod/,                     ["cross-industry", "food"]],
    // Beverage / Drinks / Wine & Spirits — precise match, no fmcg bleed
    [/beverag|drink|wine|spirit|brew|alco/,                  ["cross-industry", "beverage"]],
    // QSR cares about food + beverage (they serve both) but not all FMCG
    [/restaurant|qsr|quick service|hospitality|fast food|café|cafe/, ["cross-industry", "qsr", "food", "beverage"]],
    // Beauty & Cosmetics — core beauty signals only
    [/beauty|cosmetic|skincare|hair/,                        ["cross-industry", "beauty"]],
    // Personal Care is beauty + health overlap
    [/personal care/,                                        ["cross-industry", "beauty", "health"]],
    // Health / Wellness / Pharma
    [/health|wellness|pharma|medical|nutrition|fitness/,     ["cross-industry", "health", "beauty"]],
    // Retail / E-commerce
    [/retail|ecommerce|e-commerce|shop|supermarket|grocery/, ["cross-industry", "retail", "food", "beverage"]],
    // Agriculture is food production
    [/agri|farm|crop/,                                       ["cross-industry", "food"]],
    // Market Research (Innovatr) — show everything
    [/market research|research|innovatr/,                    null],
    [/service|consult|agenc|pr |advertis/,                   ["cross-industry", "finance"]],
  ];

  for (const [pattern, groups] of rules) {
    const matches = typeof pattern === "string" ? key.includes(pattern) : pattern.test(key);
    if (matches) return groups;
  }

  return ["cross-industry"];
}

/**
 * Returns true if an item tagged with `itemIndustries` should be shown
 * to a user whose company resolves to `userGroups`.
 * - null userGroups = market research / admin = show everything
 * - empty itemIndustries = cross-industry (show to everyone)
 */
export function matchesIndustry(
  itemIndustries: string[],
  userGroups: string[] | null,
): boolean {
  if (userGroups === null) return true;
  if (itemIndustries.length === 0) return true;
  return itemIndustries.some(g => userGroups.includes(g));
}

export function filterByIndustry<T extends { industries: string[] }>(
  items: T[],
  userGroups: string[] | null,
): T[] {
  return items.filter(item => matchesIndustry(item.industries, userGroups));
}

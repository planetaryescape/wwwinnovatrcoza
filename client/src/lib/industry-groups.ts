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
    [/^fmcg$/,                                               ["cross-industry", "fmcg", "food", "beverage", "qsr", "retail"]],
    [/^food$|food manufactur|food prod/,                     ["cross-industry", "fmcg", "food", "qsr", "health"]],
    [/beverag|drink|wine|spirit|brew|alco/,                  ["cross-industry", "fmcg", "beverage", "qsr"]],
    [/restaurant|qsr|quick service|hospitality|fast food|café|cafe/, ["cross-industry", "fmcg", "food", "beverage", "qsr", "retail"]],
    [/beauty|cosmetic|personal care|skincare|hair/,          ["cross-industry", "beauty", "health", "retail"]],
    [/health|wellness|pharma|medical|nutrition|fitness/,     ["cross-industry", "health", "food", "beauty"]],
    [/retail|ecommerce|e-commerce|shop|supermarket|grocery/, ["cross-industry", "fmcg", "food", "beverage", "retail"]],
    [/agri|farm|crop/,                                       ["cross-industry", "fmcg", "food"]],
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

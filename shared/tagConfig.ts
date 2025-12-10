// Centralized tag configuration for the Innovatr content tagging system
// Used in admin forms and related content logic

export const INDUSTRY_TAGS = [
  "Food",
  "Beverage",
  "Alcohol",
  "Financial",
  "Services",
  "Beauty",
  "FMCG",
  "Agency",
] as const;

export type IndustryTag = typeof INDUSTRY_TAGS[number];

export const THEME_TAGS = [
  "Calm and control",
  "Indulgence and reward",
  "Value and fairness",
  "Simplicity and clarity",
  "Convenience and on demand",
  "Moderation and balance",
  "Trust and believability",
  "Local and cultural",
  "Health and vitality",
  "Status and identity",
  "Connection and community",
  "Innovation and experimentation",
] as const;

export type ThemeTag = typeof THEME_TAGS[number];

export const METHOD_TAGS = [
  "Behavioural testing",
  "Market simulation",
  "Automated reporting",
  "Qual depth",
  "Analysis engine",
  "Platform overview",
  "Research setup",
  "Respondent experience",
] as const;

export type MethodTag = typeof METHOD_TAGS[number];

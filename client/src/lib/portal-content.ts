/**
 * Industry-tagged portal content library.
 * Every item carries an `industries` array matching the group tags
 * used by resolveIndustryGroups(). Filtering is done via filterByIndustry().
 *
 * Industry group tags:
 *   "cross-industry"  — shown to everyone
 *   "beverage"        — drinks, wine, spirits, juices
 *   "fmcg"            — broad fast-moving consumer goods
 *   "food"            — food manufacturing / agriculture
 *   "qsr"             — quick service restaurant / hospitality
 *   "beauty"          — beauty, cosmetics, personal care
 *   "health"          — health, wellness, pharma, fitness
 *   "finance"         — banking, fintech, insurance
 *   "retail"          — retail, e-commerce, grocery
 */

/* ────────────────────────────────────────────────────────── */
/* MARKET SIGNALS                                            */
/* ────────────────────────────────────────────────────────── */

export interface PortalSignal {
  id: number;
  industries: string[];
  tag: string;
  tagBg: string;
  tagColor: string;
  title: string;
  meta: string;
  chip: { label: string; bg: string; color: string };
}

const VIO_LT   = "#EAE8FF";
const VIO      = "#3A2FBF";
const SUC_LT   = "#D1FAE5";
const SUCCESS  = "#2A9E5C";
const AMBER_LT = "#FEF6D6";
const AMBER_DK = "#B8911A";
const CORAL_LT = "#FDECEA";
const CORAL    = "#E8503A";

export const ALL_SIGNALS: PortalSignal[] = [
  /* ── Cross-industry ── */
  {
    id: 1, industries: ["cross-industry"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Consumer trust in brand claims declining — believability gap widens",
    meta: "Cross-category · All demographics · SA Consumer Survey 2025",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 2, industries: ["cross-industry"],
    tag: "Opportunity", tagBg: VIO_LT, tagColor: VIO,
    title: "Price sensitivity up 22% — value-for-money now primary purchase driver",
    meta: "All categories · LSM 5–10 · Q1 2026",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 3, industries: ["cross-industry"],
    tag: "Signal", tagBg: SUC_LT, tagColor: SUCCESS,
    title: "Sustainability claims improve brand trust by +17pp when verifiable",
    meta: "FMCG & Beauty · 25–44 urban · Innovatr Inside Q1 2026",
    chip: { label: "Watch", bg: AMBER_LT, color: AMBER_DK },
  },

  /* ── Beverage ── */
  {
    id: 10, industries: ["beverage", "fmcg"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Nootropic beverages up +41% search intent — no dominant SA player",
    meta: "Urban 25–34 · Food & Bev · Detected overnight",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 11, industries: ["beverage", "fmcg", "qsr"],
    tag: "Opportunity", tagBg: VIO_LT, tagColor: VIO,
    title: "Township segment at 52% intent — entry SKU gap in energy/functional drinks",
    meta: "Energy Drink category · Township consumers · R12–15 price band",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 12, industries: ["beverage", "fmcg"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Functional Beverages 2025 — hydration + cognitive claims outperform",
    meta: "Innovatr Inside · GROWTH+ · Full category audit available",
    chip: { label: "New", bg: VIO_LT, color: VIO },
  },
  {
    id: 13, industries: ["beverage", "food", "fmcg"],
    tag: "Signal", tagBg: SUC_LT, tagColor: SUCCESS,
    title: "Plant-based protein growing in Gauteng convenience +28% YoY",
    meta: "FMCG · Convenience retail · Q1 2026",
    chip: { label: "Watch", bg: AMBER_LT, color: AMBER_DK },
  },
  {
    id: 14, industries: ["beverage", "fmcg"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Low-/no-alcohol premium segment growing at 19% — occasion-driven",
    meta: "Beverages · 28–45 urban professional · SA market 2025",
    chip: { label: "Medium", bg: AMBER_LT, color: AMBER_DK },
  },
  {
    id: 15, industries: ["beverage", "qsr", "fmcg"],
    tag: "Signal", tagBg: SUC_LT, tagColor: SUCCESS,
    title: "Sustainable packaging willingness-to-pay premium +18% WTP",
    meta: "Beverages & Food · 25–44 urban · Packaging study 2025",
    chip: { label: "Watch", bg: AMBER_LT, color: AMBER_DK },
  },

  /* ── Food / Agriculture ── */
  {
    id: 20, industries: ["food", "fmcg"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Origin-provenance storytelling lifts brand trust by 23pp in food",
    meta: "Food manufacturing · 30–50 grocery shoppers · SA 2025",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 21, industries: ["food", "fmcg"],
    tag: "Opportunity", tagBg: VIO_LT, tagColor: VIO,
    title: "Farm-to-shelf freshness narrative underutilised — differentiation gap",
    meta: "Agri & Food · Health-conscious segment · Urban 28–45",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 22, industries: ["food", "fmcg", "health"],
    tag: "Signal", tagBg: SUC_LT, tagColor: SUCCESS,
    title: "Gut-health claims +34% consumer search interest — category white space",
    meta: "Functional Foods · Wellness shoppers · Q1 2026",
    chip: { label: "Medium", bg: AMBER_LT, color: AMBER_DK },
  },
  {
    id: 23, industries: ["food", "fmcg"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Private label gains share in fresh produce — value perception driving switch",
    meta: "Retail · LSM 6–9 grocery segment · 2025",
    chip: { label: "Watch", bg: AMBER_LT, color: AMBER_DK },
  },

  /* ── QSR / Hospitality ── */
  {
    id: 30, industries: ["qsr", "food", "fmcg"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Delivery occasions now 38% of QSR visits — digital-first ordering rising",
    meta: "QSR · Urban 18–35 · SA consumer behaviour 2025",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 31, industries: ["qsr", "fmcg"],
    tag: "Opportunity", tagBg: VIO_LT, tagColor: VIO,
    title: "Value bundle messaging outperforms premium upsell by 2.1× in QSR",
    meta: "Quick Service · LSM 5–8 · Pricing research Q4 2025",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 32, industries: ["qsr", "food", "beverage"],
    tag: "Signal", tagBg: SUC_LT, tagColor: SUCCESS,
    title: "Family meal occasion growing — combo formats up 31% in consideration",
    meta: "QSR · Households with children · 2025",
    chip: { label: "Medium", bg: AMBER_LT, color: AMBER_DK },
  },
  {
    id: 33, industries: ["qsr", "fmcg"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Healthier QSR options — intent exceeds availability; category gap identified",
    meta: "QSR & FMCG · Health-conscious 25–40 · Nationwide",
    chip: { label: "Watch", bg: AMBER_LT, color: AMBER_DK },
  },

  /* ── Beauty / Personal Care ── */
  {
    id: 40, industries: ["beauty", "health", "retail"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Skincare ingredient transparency demand rising — 68% read labels carefully",
    meta: "Beauty · 30–45 urban female · Digital-first shoppers",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 41, industries: ["beauty", "retail"],
    tag: "Opportunity", tagBg: VIO_LT, tagColor: VIO,
    title: "Price-entry skincare — credible efficacy at LSM 5–8 underserved",
    meta: "Beauty · LSM 5–8 · Segment gap 2025",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 42, industries: ["beauty", "health"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Clean beauty: 'no-nasties' claims grow purchase intent by 24pp",
    meta: "Personal Care & Beauty · 25–45 · SA urban female 2025",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 43, industries: ["beauty", "health", "retail"],
    tag: "Signal", tagBg: SUC_LT, tagColor: SUCCESS,
    title: "Male grooming segment growing +22% — perception shift in SA market",
    meta: "Personal Care · Males 25–40 · Urban 2025",
    chip: { label: "Medium", bg: AMBER_LT, color: AMBER_DK },
  },
  {
    id: 44, industries: ["beauty", "retail"],
    tag: "New Report", tagBg: VIO_LT, tagColor: VIO,
    title: "SA Beauty Benchmark 2025 — full category with brand health scores",
    meta: "Innovatr Inside · SCALE+ · Full report available",
    chip: { label: "New", bg: VIO_LT, color: VIO },
  },

  /* ── Finance ── */
  {
    id: 50, industries: ["finance"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Digital-only banking trust at 71% — branch irrelevance accelerating",
    meta: "Finance · 25–44 banked population · SA FinScope 2025",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 51, industries: ["finance"],
    tag: "Opportunity", tagBg: VIO_LT, tagColor: VIO,
    title: "Fee transparency gap — 63% cite hidden fees as primary switch trigger",
    meta: "Banking · LSM 7–10 · Consumer switching behaviour 2025",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 52, industries: ["finance"],
    tag: "Signal", tagBg: SUC_LT, tagColor: SUCCESS,
    title: "Youth segment (18–25) 2.3× more likely to open accounts via app",
    meta: "Fintech · Gen Z · SA digital behaviour 2025",
    chip: { label: "Medium", bg: AMBER_LT, color: AMBER_DK },
  },
  {
    id: 53, industries: ["finance"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Insurance consideration lowest since 2018 — trust deficit driving avoidance",
    meta: "Insurance · 30–50 banked · SA 2025",
    chip: { label: "Watch", bg: AMBER_LT, color: AMBER_DK },
  },

  /* ── Retail ── */
  {
    id: 60, industries: ["retail", "fmcg"],
    tag: "Trend", tagBg: VIO_LT, tagColor: VIO,
    title: "Private label preference up 31% in grocery — value-led segment shift",
    meta: "Retail · LSM 5–9 · Grocery channel 2025",
    chip: { label: "High", bg: CORAL_LT, color: CORAL },
  },
  {
    id: 61, industries: ["retail"],
    tag: "Opportunity", tagBg: VIO_LT, tagColor: VIO,
    title: "Omnichannel loyalty gap — 58% prefer click-and-collect but few retailers offer it",
    meta: "Retail · Urban 25–45 · Q4 2025",
    chip: { label: "Medium", bg: AMBER_LT, color: AMBER_DK },
  },
];

/* ────────────────────────────────────────────────────────── */
/* MARKET GAPS                                               */
/* ────────────────────────────────────────────────────────── */

export interface MarketGap {
  id: string;
  industries: string[];
  useZap: boolean;
  title: string;
  meta: string;
  score: number;
  desc: string;
  priority: string;
  priorityColor: string;
  priorityBg: string;
  potential: string;
  barPct: number;
  concept: string;
}

export const ALL_MARKET_GAPS: MarketGap[] = [
  /* Cross-industry */
  {
    id: "gap-cross-1", industries: ["cross-industry"],
    useZap: true,
    title: "Value Positioning — premium vs accessible messaging",
    meta: "All categories · All segments",
    score: 78, barPct: 78,
    desc: "Across categories, brands that nail the 'worth it' narrative outperform peers by 2.3× in repurchase intent. Most brands under-invest in value communication.",
    priority: "High Priority", priorityColor: SUCCESS, priorityBg: SUC_LT,
    potential: "Category-wide opportunity",
    concept: "A value-positioning test with 3–4 messaging variants. Test 'quality at the right price' vs 'affordable luxury' vs 'most for your money' with your target segment.",
  },

  /* Beverage */
  {
    id: "gap-bev-1", industries: ["beverage", "fmcg"],
    useZap: true,
    title: "Nootropic Beverages — cognitive performance drinks",
    meta: "Food & Bev · Urban 25–34",
    score: 94, barPct: 94,
    desc: "No dominant SA player in cognitive-performance beverages. Search intent up 41% YoY. First-mover window is open now.",
    priority: "High Priority", priorityColor: SUCCESS, priorityBg: SUC_LT,
    potential: "R85m+ potential",
    concept: "A premium nootropic energy drink targeting urban professionals aged 25–34. Cognitive-performance claims with adaptogen ingredients, priced at R22 per 330ml can.",
  },
  {
    id: "gap-bev-2", industries: ["beverage", "fmcg"],
    useZap: false,
    title: "Low-/No-Alcohol Premium — occasion gap in SA on-trade",
    meta: "Beverages · Urban 28–45",
    score: 76, barPct: 76,
    desc: "Premium no-alcohol alternatives growing at 19% but shelf presence remains thin. Occasion-based positioning (social drinking without compromise) is underdeveloped.",
    priority: "Medium Priority", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
    potential: "R42m+ potential",
    concept: "A premium no-alcohol range tested with occasion-based claim sets vs product-led messaging with 28–45 urban segment.",
  },
  {
    id: "gap-bev-3", industries: ["beverage", "fmcg", "qsr"],
    useZap: false,
    title: "Price-Entry SKU — township energy drink gap",
    meta: "Beverages · Township consumers · R12–15",
    score: 81, barPct: 81,
    desc: "Township consumers show 52% purchase intent for energy drinks but current SKUs price them out. A R12–15 entry SKU could unlock substantial volume.",
    priority: "Medium Priority", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
    potential: "R55m+ potential",
    concept: "A price-entry energy drink SKU tested with R12, R14, R16 price points with township segment 18–35.",
  },

  /* Food / Agriculture */
  {
    id: "gap-food-1", industries: ["food", "fmcg"],
    useZap: true,
    title: "Gut-Health Functional Foods — SA white space",
    meta: "Health Foods · 30–50 wellness-oriented",
    score: 88, barPct: 88,
    desc: "Gut-health products growing at 34% globally but SA category is nascent. First-mover advantage available for local brand with credible probiotic/prebiotic claims.",
    priority: "High Priority", priorityColor: SUCCESS, priorityBg: SUC_LT,
    potential: "R65m+ potential",
    concept: "A functional food range with gut-health positioning. Test credibility of claims and willingness to pay a R15–20 premium over standard equivalent.",
  },
  {
    id: "gap-food-2", industries: ["food", "fmcg"],
    useZap: false,
    title: "Origin Storytelling — farm-provenance premium positioning",
    meta: "Agri & Food · Health-conscious grocery shoppers",
    score: 71, barPct: 71,
    desc: "Consumers are willing to pay a premium for food with a verified origin story. SA farmers underutilise provenance as a brand asset.",
    priority: "Medium Priority", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
    potential: "R30m+ premium uplift",
    concept: "Origin-verified messaging for a food range. Test 'farm-to-shelf' narrative vs standard quality claims with grocery segment 30–50.",
  },

  /* QSR */
  {
    id: "gap-qsr-1", industries: ["qsr", "food", "fmcg"],
    useZap: true,
    title: "Healthier QSR — intent exceeds availability",
    meta: "QSR · Health-conscious 25–40",
    score: 85, barPct: 85,
    desc: "67% of QSR visitors say they would choose a healthier option if available at a similar price point. No SA brand has positioned credibly in this space.",
    priority: "High Priority", priorityColor: SUCCESS, priorityBg: SUC_LT,
    potential: "R120m+ category opportunity",
    concept: "A 'guilt-free' QSR range test — healthier ingredients, same format, premium of R5–10. Test with 25–40 urban families.",
  },
  {
    id: "gap-qsr-2", industries: ["qsr", "fmcg"],
    useZap: false,
    title: "Value Bundle Format — price-anchoring in recessionary environment",
    meta: "QSR · LSM 5–8 · Family occasions",
    score: 82, barPct: 82,
    desc: "Value bundle messaging outperforms premium upsell 2.1× in QSR. Most chains have the product; the gap is in how they structure and communicate value.",
    priority: "Medium Priority", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
    potential: "R70m+ attachment rate improvement",
    concept: "Bundle pricing and messaging test — 3 format variants vs individual items. Test with families and 18–30 singles in LSM 5–8.",
  },

  /* Beauty */
  {
    id: "gap-beauty-1", industries: ["beauty", "health", "retail"],
    useZap: false,
    title: "Price-Entry Skincare — credible efficacy at LSM 5–8",
    meta: "Beauty · LSM 5–8",
    score: 81, barPct: 81,
    desc: "Affordable skincare with credible efficacy claims is underserved in LSM 5–8. Current options are either too cheap or too premium.",
    priority: "Medium Priority", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
    potential: "R45m+ potential",
    concept: "An accessible skincare range targeting LSM 5–8, priced R49–R89. Dermatologist-tested efficacy claims with locally-relevant ingredients for SA skin types.",
  },
  {
    id: "gap-beauty-2", industries: ["beauty", "health"],
    useZap: true,
    title: "Clean Beauty — 'no-nasties' positioning white space",
    meta: "Beauty & Personal Care · 25–45 urban female",
    score: 89, barPct: 89,
    desc: "Clean beauty claims drive 24pp purchase intent lift but no SA brand owns this position credibly. International players dominate — local brand gap is significant.",
    priority: "High Priority", priorityColor: SUCCESS, priorityBg: SUC_LT,
    potential: "R95m+ potential",
    concept: "A clean beauty concept tested with 'ingredient-transparency' claim set vs standard product benefits with 25–45 urban female segment.",
  },
  {
    id: "gap-beauty-3", industries: ["beauty", "health", "retail"],
    useZap: false,
    title: "Male Grooming — underserved SA market segment",
    meta: "Personal Care · Males 25–40 · Urban",
    score: 73, barPct: 73,
    desc: "Male grooming growing at 22% in consideration but product range and positioning in SA remains underdeveloped vs international markets.",
    priority: "Medium Priority", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
    potential: "R38m+ potential",
    concept: "A male grooming range concept tested with 25–40 urban males. Test 'performance' vs 'simplicity' positioning with 3–4 product format options.",
  },

  /* Finance */
  {
    id: "gap-finance-1", industries: ["finance"],
    useZap: true,
    title: "Fee-Transparent Banking — trust differentiation",
    meta: "Finance · LSM 7–10 banked population",
    score: 91, barPct: 91,
    desc: "63% of bank switchers cite hidden fees as their primary reason. Radical fee transparency is an unclaimed positioning in SA banking.",
    priority: "High Priority", priorityColor: SUCCESS, priorityBg: SUC_LT,
    potential: "Market share differentiation",
    concept: "A fee-transparent banking communication test — 'no hidden fees' vs 'zero fees guaranteed' vs standard pricing messaging with 25–45 urban banked segment.",
  },
  {
    id: "gap-finance-2", industries: ["finance"],
    useZap: false,
    title: "Youth Banking — app-first onboarding",
    meta: "Finance · Gen Z 18–25 · Digital-native",
    score: 79, barPct: 79,
    desc: "Youth (18–25) are 2.3× more likely to open accounts via app — but existing app onboarding experiences score poorly on simplicity and speed.",
    priority: "Medium Priority", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
    potential: "Customer acquisition at scale",
    concept: "An app-first onboarding concept test with Gen Z (18–25). Test 'open in 3 minutes' vs 'instant approval' vs 'no branch needed' messaging.",
  },
];

/* ────────────────────────────────────────────────────────── */
/* STRATEGIC GAPS (Act page)                                 */
/* ────────────────────────────────────────────────────────── */

export interface StrategicGap {
  id: string;
  industries: string[];
  priority: number;
  title: string;
  chip: { label: string; bg: string; color: string };
  desc: string;
  cta: string | null;
  ctaAction: string | null;
  priorityStyle: { bg: string; color: string };
}

export const ALL_STRATEGIC_GAPS: StrategicGap[] = [
  /* Cross-industry */
  {
    id: "sg-cross-1", industries: ["cross-industry"], priority: 1,
    title: "Brand believability gap — claims not landing with target segment",
    chip: { label: "High Priority", bg: CORAL_LT, color: CORAL },
    desc: "Research shows consumer trust in brand claims is declining. Without a believability study, you risk over-investing in messages that don't convert. This is your top commercial risk.",
    cta: "See Next Steps", ctaAction: "nextsteps",
    priorityStyle: { bg: CORAL_LT, color: CORAL },
  },

  /* Beverage / FMCG */
  {
    id: "sg-bev-1", industries: ["beverage", "fmcg"], priority: 1,
    title: "Concept-to-purchase gap in top segment",
    chip: { label: "High Priority", bg: CORAL_LT, color: CORAL },
    desc: "Your top-scoring concept shows an 18-point drop from Idea score to Commitment — a classic believability gap. The concept is compelling, but the purchase trigger isn't closing. Packaging and price must work harder.",
    cta: "See Next Steps", ctaAction: "nextsteps",
    priorityStyle: { bg: CORAL_LT, color: CORAL },
  },
  {
    id: "sg-bev-2", industries: ["beverage", "fmcg"], priority: 2,
    title: "Value perception lag — 18–24 cohort",
    chip: { label: "Medium Priority", bg: AMBER_LT, color: AMBER_DK },
    desc: "Purchase intent sits high, but value-for-money scores are 13pp below the study average in the 18–24 cohort. Messaging must shift to emphasise accessible value, not aspirational positioning.",
    cta: null, ctaAction: null,
    priorityStyle: { bg: AMBER_LT, color: AMBER_DK },
  },
  {
    id: "sg-bev-3", industries: ["beverage", "fmcg"], priority: 3,
    title: "Nootropic whitespace — unclaimed territory",
    chip: { label: "Opportunity", bg: VIO_LT, color: VIO },
    desc: "Cognitive-performance beverages are up 41% in search intent among urban 25–34 professionals. No local brand has moved to own this space. First-mover window is open — and narrowing.",
    cta: "Explore Trend", ctaAction: "explore",
    priorityStyle: { bg: VIO_LT, color: VIO },
  },

  /* Food / Agriculture */
  {
    id: "sg-food-1", industries: ["food", "fmcg"], priority: 1,
    title: "Origin story not landing — provenance narrative underdeveloped",
    chip: { label: "High Priority", bg: CORAL_LT, color: CORAL },
    desc: "Consumers are seeking proof behind food claims, but your current messaging doesn't close the credibility gap. A believability study with your core grocery segment is the next priority.",
    cta: "See Next Steps", ctaAction: "nextsteps",
    priorityStyle: { bg: CORAL_LT, color: CORAL },
  },
  {
    id: "sg-food-2", industries: ["food", "fmcg"], priority: 2,
    title: "Gut-health positioning window closing",
    chip: { label: "Opportunity", bg: VIO_LT, color: VIO },
    desc: "Functional food with gut-health claims is growing at 34% in search intent. The SA market has no clear owner of this space — a first-mover concept test would de-risk entry now.",
    cta: "Explore Trend", ctaAction: "explore",
    priorityStyle: { bg: VIO_LT, color: VIO },
  },
  {
    id: "sg-food-3", industries: ["food", "fmcg"], priority: 3,
    title: "Private label competition increasing — differentiation urgency",
    chip: { label: "Medium Priority", bg: AMBER_LT, color: AMBER_DK },
    desc: "Private label preference is up 31% in your grocery channel. Your brand needs stronger differentiation anchors tested and validated before the next ranging cycle.",
    cta: null, ctaAction: null,
    priorityStyle: { bg: AMBER_LT, color: AMBER_DK },
  },

  /* QSR */
  {
    id: "sg-qsr-1", industries: ["qsr", "food", "fmcg"], priority: 1,
    title: "Value bundle conversion gap — price perceived but value not communicated",
    chip: { label: "High Priority", bg: CORAL_LT, color: CORAL },
    desc: "Research shows your value bundles are priced correctly but the communication isn't landing the 'worth it' message. You're losing conversion at the point of decision.",
    cta: "See Next Steps", ctaAction: "nextsteps",
    priorityStyle: { bg: CORAL_LT, color: CORAL },
  },
  {
    id: "sg-qsr-2", industries: ["qsr", "fmcg"], priority: 2,
    title: "Digital ordering experience gap — intent vs execution disconnect",
    chip: { label: "Medium Priority", bg: AMBER_LT, color: AMBER_DK },
    desc: "38% of visits are delivery-driven, but intent to re-order via app is only 52%. The ordering experience is creating friction that's suppressing repeat digital transactions.",
    cta: null, ctaAction: null,
    priorityStyle: { bg: AMBER_LT, color: AMBER_DK },
  },
  {
    id: "sg-qsr-3", industries: ["qsr", "food"], priority: 3,
    title: "Health perception gap — healthier options not discoverable",
    chip: { label: "Opportunity", bg: VIO_LT, color: VIO },
    desc: "67% of visitors would choose a healthier option if clearly signposted. Your current menu doesn't make healthier choices visually or linguistically prominent.",
    cta: "Explore Trend", ctaAction: "explore",
    priorityStyle: { bg: VIO_LT, color: VIO },
  },

  /* Beauty / Personal Care */
  {
    id: "sg-beauty-1", industries: ["beauty", "health", "retail"], priority: 1,
    title: "Ingredient credibility gap — claims not landing with informed shoppers",
    chip: { label: "High Priority", bg: CORAL_LT, color: CORAL },
    desc: "68% of beauty shoppers now read ingredient labels. If your formulation claims aren't substantiated clearly in-pack and in-store, intent is dropping at the shelf.",
    cta: "See Next Steps", ctaAction: "nextsteps",
    priorityStyle: { bg: CORAL_LT, color: CORAL },
  },
  {
    id: "sg-beauty-2", industries: ["beauty", "health", "retail"], priority: 2,
    title: "Repositioning not landing in 35–49 segment",
    chip: { label: "Medium Priority", bg: AMBER_LT, color: AMBER_DK },
    desc: "Brand story resonates in 25–34 but fails to convert the 35–49 segment. A dual-message strategy is recommended before full launch. This cohort represents 38% of category spend.",
    cta: null, ctaAction: null,
    priorityStyle: { bg: AMBER_LT, color: AMBER_DK },
  },
  {
    id: "sg-beauty-3", industries: ["beauty", "retail"], priority: 3,
    title: "Clean beauty entry window narrowing",
    chip: { label: "Opportunity", bg: VIO_LT, color: VIO },
    desc: "Clean beauty intent is growing at 24pp above average but local brands haven't claimed the positioning. International entrants are accelerating — act now or defend at premium.",
    cta: "Explore Trend", ctaAction: "explore",
    priorityStyle: { bg: VIO_LT, color: VIO },
  },

  /* Finance */
  {
    id: "sg-finance-1", industries: ["finance"], priority: 1,
    title: "Fee transparency deficit — switching trigger active",
    chip: { label: "High Priority", bg: CORAL_LT, color: CORAL },
    desc: "63% of your competitive switching pressure comes from fee perception. Without a validated 'zero-fee' or 'transparent pricing' message, you're handing acquisition to competitors.",
    cta: "See Next Steps", ctaAction: "nextsteps",
    priorityStyle: { bg: CORAL_LT, color: CORAL },
  },
  {
    id: "sg-finance-2", industries: ["finance"], priority: 2,
    title: "Youth digital acquisition gap — app experience friction",
    chip: { label: "Medium Priority", bg: AMBER_LT, color: AMBER_DK },
    desc: "Youth (18–25) are 2.3× more likely to open accounts digitally, but app onboarding scores poorly on simplicity. You're losing them in the first 3 steps.",
    cta: null, ctaAction: null,
    priorityStyle: { bg: AMBER_LT, color: AMBER_DK },
  },
  {
    id: "sg-finance-3", industries: ["finance"], priority: 3,
    title: "Trust rebuilding — advisory vs transactional positioning",
    chip: { label: "Opportunity", bg: VIO_LT, color: VIO },
    desc: "Insurance and investment consideration are at a 7-year low. Brands that shift from transactional to advisory positioning show 34% stronger trust recovery in research.",
    cta: "Explore Trend", ctaAction: "explore",
    priorityStyle: { bg: VIO_LT, color: VIO },
  },
];

/* ────────────────────────────────────────────────────────── */
/* NEXT STEPS (Act page)                                     */
/* ────────────────────────────────────────────────────────── */

export interface NextStep {
  id: string;
  industries: string[];
  num: number;
  title: string;
  desc: string;
  cta: { label: string; action: string; primary: boolean } | null;
  locked: boolean;
  lockedReason?: string;
}

export const ALL_NEXT_STEPS: NextStep[] = [
  /* Cross-industry */
  {
    id: "ns-cross-1", industries: ["cross-industry"], num: 1,
    title: "Sandbox a concept — validate before committing credits",
    desc: "Before briefing a full study, pressure-test your concept with synthetic respondents in the Sandbox. Refine the idea and messaging until intent exceeds 65%, then brief a Test24 study.",
    cta: { label: "Open Sandbox →", action: "explore", primary: false },
    locked: false,
  },

  /* Beverage / FMCG */
  {
    id: "ns-bev-1", industries: ["beverage", "fmcg"], num: 1,
    title: "Test packaging variants — top-scoring concept",
    desc: "Your concept scored above the 70% intent threshold. The next step is testing 3–4 packaging variants with the 25–34 urban cohort before committing to production. Packaging drives the 'premium but accessible' perception that's your top intent driver.",
    cta: { label: "Launch Packaging Brief →", action: "test", primary: true },
    locked: false,
  },
  {
    id: "ns-bev-2", industries: ["beverage", "fmcg"], num: 2,
    title: "Sandbox — price-entry SKU for Township segment",
    desc: "Before investing a full study, pressure-test a R12–15 entry SKU concept in the Sandbox. The intent gap suggests the volume is there — use synthetic respondents to refine the concept first.",
    cta: { label: "Open Sandbox →", action: "explore", primary: false },
    locked: false,
  },
  {
    id: "ns-bev-3", industries: ["beverage", "fmcg"], num: 3,
    title: "Read the Nootropic Beverage trend report",
    desc: "41% search intent growth with no dominant local player. Before your next product-cycle planning session, review the full trend data — understanding the category before building a brief sharpens your methodology significantly.",
    cta: { label: "Browse Trend Reports →", action: "explore", primary: false },
    locked: false,
  },

  /* Food / Agriculture */
  {
    id: "ns-food-1", industries: ["food", "fmcg"], num: 1,
    title: "Test origin-provenance claim variants",
    desc: "Your farm-to-shelf story needs validation with grocery shoppers. Brief a Test24 Basic with 3–4 origin messaging variants to confirm which narrative earns the most trust and drives premium willingness-to-pay.",
    cta: { label: "Launch Claims Brief →", action: "test", primary: true },
    locked: false,
  },
  {
    id: "ns-food-2", industries: ["food", "fmcg"], num: 2,
    title: "Sandbox — gut-health functional food concept",
    desc: "Run a 30-minute Sandbox simulation on a functional food concept with gut-health claims. Test interest, commitment, and differentiation before committing to a full study.",
    cta: { label: "Open Sandbox →", action: "explore", primary: false },
    locked: false,
  },
  {
    id: "ns-food-3", industries: ["food", "fmcg"], num: 3,
    title: "Differentiation study — defend against private label",
    desc: "Private label preference is up 31%. Brief a positioning study to identify which differentiation anchors (origin, nutrition, taste, sustainability) are most resistant to private label switching.",
    cta: { label: "Launch Brief →", action: "test", primary: false },
    locked: false,
  },

  /* QSR */
  {
    id: "ns-qsr-1", industries: ["qsr", "food", "fmcg"], num: 1,
    title: "Test value bundle messaging variants",
    desc: "Your bundles are priced right but the communication isn't converting. Brief a Test24 Basic with 3–4 bundle messaging variants. Focus on the 'family value' occasion with your core LSM 5–8 segment.",
    cta: { label: "Launch Messaging Brief →", action: "test", primary: true },
    locked: false,
  },
  {
    id: "ns-qsr-2", industries: ["qsr", "fmcg"], num: 2,
    title: "Sandbox — healthier menu concept",
    desc: "Pressure-test a 'healthier choice' menu add-on in the Sandbox before committing to a full range test. 30 minutes, no credits.",
    cta: { label: "Open Sandbox →", action: "explore", primary: false },
    locked: false,
  },
  {
    id: "ns-qsr-3", industries: ["qsr", "food"], num: 3,
    title: "Digital ordering experience study",
    desc: "App re-order intent is suppressed. A UX-focused concept test with 200 digital-first respondents will identify exactly where the friction is in the ordering journey.",
    cta: { label: "Launch Digital Brief →", action: "test", primary: false },
    locked: false,
  },

  /* Beauty / Personal Care */
  {
    id: "ns-beauty-1", industries: ["beauty", "health", "retail"], num: 1,
    title: "Test packaging/claim variants — top-scoring concept",
    desc: "Your concept is above the threshold — now validate the 'clean ingredient' communication with 3–4 variants. The 25–45 urban female segment is primed; close the claim credibility gap before launch.",
    cta: { label: "Launch Packaging Brief →", action: "test", primary: true },
    locked: false,
  },
  {
    id: "ns-beauty-2", industries: ["beauty", "health", "retail"], num: 2,
    title: "Dual-message strategy — 35–49 segment brief",
    desc: "Your 35–49 segment is under-converting. Brief a Test24 Basic with 2–3 message variants specifically for this cohort before the next campaign cycle.",
    cta: { label: "Launch Segment Brief →", action: "test", primary: false },
    locked: false,
  },
  {
    id: "ns-beauty-3", industries: ["beauty", "retail"], num: 3,
    title: "Sandbox — male grooming concept",
    desc: "The male grooming gap is validated in trends data. Run a quick Sandbox to test a grooming concept before committing a study credit to the full brief.",
    cta: { label: "Open Sandbox →", action: "explore", primary: false },
    locked: false,
  },

  /* Finance */
  {
    id: "ns-finance-1", industries: ["finance"], num: 1,
    title: "Test fee-transparency messaging variants",
    desc: "The switching trigger is fee opacity. Brief a Test24 Basic with 3–4 'no hidden fees' message constructs. Validate which framing drives the highest trust lift and re-consideration.",
    cta: { label: "Launch Messaging Brief →", action: "test", primary: true },
    locked: false,
  },
  {
    id: "ns-finance-2", industries: ["finance"], num: 2,
    title: "Youth onboarding concept test",
    desc: "App-first onboarding intent is high but conversion isn't following. Test 3 simplified onboarding journeys with 18–25 segment in a concept study.",
    cta: { label: "Launch Digital Brief →", action: "test", primary: false },
    locked: false,
  },
  {
    id: "ns-finance-3", industries: ["finance"], num: 3,
    title: "Trust restoration — advisory positioning study",
    desc: "Advisory vs transactional positioning is the key battleground in 2026. Brief a concept test with your 30–45 core segment to validate the right tone and service narrative.",
    cta: { label: "Launch Trust Brief →", action: "test", primary: false },
    locked: false,
  },
];

/* ────────────────────────────────────────────────────────── */
/* RESEARCH RECOMMENDATIONS (Act > Planning sidebar)         */
/* ────────────────────────────────────────────────────────── */

export interface ResearchRec {
  id: string;
  industries: string[];
  title: string;
  method: string;
  methodColor: string;
  methodBg: string;
  types: string[];
  desc: string;
  priority: string;
  priorityColor: string;
  priorityBg: string;
}

const CYAN_DK = "#1A8FAD";

export const ALL_RESEARCH_RECS: ResearchRec[] = [
  /* Cross-industry */
  {
    id: "rr-cross-1", industries: ["cross-industry"],
    title: "Brand Believability — Claims Validation",
    method: "Test24 Basic", methodColor: CYAN_DK, methodBg: "#DFF6FC",
    types: ["Claims", "Trust"],
    desc: "Validate your top 3 brand claims with your primary segment before the next campaign. 1 Basic Credit, results in 24 hours.",
    priority: "High", priorityColor: CORAL, priorityBg: CORAL_LT,
  },

  /* Beverage / FMCG */
  {
    id: "rr-bev-1", industries: ["beverage", "fmcg"],
    title: "Packaging Variants — top-scoring concept",
    method: "Test24 Basic", methodColor: CYAN_DK, methodBg: "#DFF6FC",
    types: ["Concept", "Claims"],
    desc: "Test 3–4 pack options with the 25–34 urban cohort before committing to production. 1 Basic Credit.",
    priority: "High", priorityColor: CORAL, priorityBg: CORAL_LT,
  },
  {
    id: "rr-bev-2", industries: ["beverage", "fmcg"],
    title: "Price-Entry SKU — Township segment",
    method: "Sandbox", methodColor: VIO, methodBg: VIO_LT,
    types: ["Pricing Testing"],
    desc: "Model R12, R14, R16 price points with synthetic respondents. No credits required — 30 minutes in the Sandbox.",
    priority: "High", priorityColor: CORAL, priorityBg: CORAL_LT,
  },
  {
    id: "rr-bev-3", industries: ["beverage", "fmcg"],
    title: "Nootropic Beverage — first-mover concept",
    method: "Test24 Basic", methodColor: CYAN_DK, methodBg: "#DFF6FC",
    types: ["Concept", "Category"],
    desc: "Commission a concept test for a nootropic beverage positioning before a competitor claims the space. 1 Basic Credit.",
    priority: "Medium", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
  },

  /* Food / Agriculture */
  {
    id: "rr-food-1", industries: ["food", "fmcg"],
    title: "Origin Claims — provenance messaging test",
    method: "Test24 Basic", methodColor: CYAN_DK, methodBg: "#DFF6FC",
    types: ["Claims", "Positioning"],
    desc: "Test 3–4 origin narrative variants with grocery shoppers 30–50. Confirm which story earns the most trust premium.",
    priority: "High", priorityColor: CORAL, priorityBg: CORAL_LT,
  },
  {
    id: "rr-food-2", industries: ["food", "fmcg"],
    title: "Functional Food — gut-health concept test",
    method: "Test24 Basic", methodColor: CYAN_DK, methodBg: "#DFF6FC",
    types: ["Concept", "Health Claims"],
    desc: "Validate consumer intent and willingness-to-pay for a gut-health functional food concept. 1 Basic Credit.",
    priority: "Medium", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
  },

  /* QSR */
  {
    id: "rr-qsr-1", industries: ["qsr", "food", "fmcg"],
    title: "Value Bundle Messaging — conversion study",
    method: "Test24 Basic", methodColor: CYAN_DK, methodBg: "#DFF6FC",
    types: ["Messaging", "Pricing"],
    desc: "Test 3–4 value bundle communication variants with LSM 5–8 family segment. Close the conversion gap at the point of decision.",
    priority: "High", priorityColor: CORAL, priorityBg: CORAL_LT,
  },
  {
    id: "rr-qsr-2", industries: ["qsr", "food"],
    title: "Healthier Menu — concept validation",
    method: "Test24 Basic", methodColor: CYAN_DK, methodBg: "#DFF6FC",
    types: ["Concept", "Health"],
    desc: "Validate concept for a healthier QSR option with 25–40 health-conscious urban segment. 1 Basic Credit.",
    priority: "Medium", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
  },

  /* Beauty / Personal Care */
  {
    id: "rr-beauty-1", industries: ["beauty", "health", "retail"],
    title: "Packaging Variants — ingredient-led concept",
    method: "Test24 Basic", methodColor: CYAN_DK, methodBg: "#DFF6FC",
    types: ["Concept", "Claims"],
    desc: "Test 3–4 packaging variants that lead with clean ingredient credentials. Target 25–45 urban female. 1 Basic Credit.",
    priority: "High", priorityColor: CORAL, priorityBg: CORAL_LT,
  },
  {
    id: "rr-beauty-2", industries: ["beauty", "health", "retail"],
    title: "35–49 Segment — dual-message repositioning",
    method: "Test24 Pro", methodColor: "#7C3AED", methodBg: "#EDE9FE",
    types: ["Positioning", "Brand Health"],
    desc: "AI-moderated qual with 20 respondents in the 35–49 segment to identify what repositioning narrative converts this cohort.",
    priority: "Medium", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
  },
  {
    id: "rr-beauty-3", industries: ["beauty", "retail"],
    title: "Clean Beauty — first-mover positioning",
    method: "Test24 Basic", methodColor: CYAN_DK, methodBg: "#DFF6FC",
    types: ["Positioning", "Brand"],
    desc: "Validate a 'clean' positioning platform before competitors claim the space. Test ingredient transparency claim sets with 25–45 urban female segment.",
    priority: "High", priorityColor: CORAL, priorityBg: CORAL_LT,
  },

  /* Finance */
  {
    id: "rr-finance-1", industries: ["finance"],
    title: "Fee Transparency — messaging validation",
    method: "Test24 Basic", methodColor: CYAN_DK, methodBg: "#DFF6FC",
    types: ["Messaging", "Trust"],
    desc: "Test 'no hidden fees' vs 'zero fees guaranteed' vs standard messaging with 25–45 banked segment. 1 Basic Credit.",
    priority: "High", priorityColor: CORAL, priorityBg: CORAL_LT,
  },
  {
    id: "rr-finance-2", industries: ["finance"],
    title: "Youth Onboarding — digital UX concept",
    method: "Test24 Basic", methodColor: CYAN_DK, methodBg: "#DFF6FC",
    types: ["Digital", "UX"],
    desc: "Test 3 simplified onboarding journey concepts with 18–25 digital-first segment. 1 Basic Credit.",
    priority: "Medium", priorityColor: AMBER_DK, priorityBg: AMBER_LT,
  },
];

/* ────────────────────────────────────────────────────────── */
/* PLANNING PROMPTS (Act > Planning Assistant)               */
/* ────────────────────────────────────────────────────────── */

export interface PlanningPrompt {
  id: string;
  industries: string[];
  text: string;
}

export const ALL_PLANNING_PROMPTS: PlanningPrompt[] = [
  /* Cross-industry */
  { id: "pp-cross-1", industries: ["cross-industry"], text: "Plan my next 6-month research cycle" },
  { id: "pp-cross-2", industries: ["cross-industry"], text: "What's my biggest commercial risk right now?" },
  { id: "pp-cross-3", industries: ["cross-industry"], text: "How do I frame my research findings for my team?" },
  { id: "pp-cross-4", industries: ["cross-industry"], text: "Which study should I commission next?" },

  /* Beverage */
  { id: "pp-bev-1", industries: ["beverage", "fmcg"], text: "Draft a brief for the Township SKU test" },
  { id: "pp-bev-2", industries: ["beverage", "fmcg"], text: "What's the strongest nootropic beverage concept to test?" },
  { id: "pp-bev-3", industries: ["beverage", "fmcg"], text: "How do I close the commitment gap in my top segment?" },
  { id: "pp-bev-4", industries: ["beverage", "fmcg"], text: "Which packaging variant should we prioritise?" },

  /* Food / Agriculture */
  { id: "pp-food-1", industries: ["food", "fmcg"], text: "How do I build a credible origin story for my category?" },
  { id: "pp-food-2", industries: ["food", "fmcg"], text: "Defend against private label — what research do I need?" },
  { id: "pp-food-3", industries: ["food", "fmcg"], text: "Plan a functional food concept test" },
  { id: "pp-food-4", industries: ["food", "fmcg"], text: "What's the strongest sustainability message for my brand?" },

  /* QSR */
  { id: "pp-qsr-1", industries: ["qsr", "food", "fmcg"], text: "How do I close the value bundle conversion gap?" },
  { id: "pp-qsr-2", industries: ["qsr", "food"], text: "Plan a healthier menu concept study" },
  { id: "pp-qsr-3", industries: ["qsr", "fmcg"], text: "What's driving digital ordering intent decline?" },
  { id: "pp-qsr-4", industries: ["qsr", "food"], text: "Design a family occasion research programme" },

  /* Beauty / Personal Care */
  { id: "pp-beauty-1", industries: ["beauty", "health", "retail"], text: "How do I reposition for the 35–49 segment?" },
  { id: "pp-beauty-2", industries: ["beauty", "retail"], text: "Plan a clean beauty entry strategy study" },
  { id: "pp-beauty-3", industries: ["beauty", "health"], text: "Which ingredient claim drives the most intent?" },
  { id: "pp-beauty-4", industries: ["beauty", "health", "retail"], text: "Draft a brief for male grooming expansion" },

  /* Finance */
  { id: "pp-finance-1", industries: ["finance"], text: "How do I validate fee-transparency messaging?" },
  { id: "pp-finance-2", industries: ["finance"], text: "Plan a youth acquisition research programme" },
  { id: "pp-finance-3", industries: ["finance"], text: "What trust signals matter most to switchers?" },
  { id: "pp-finance-4", industries: ["finance"], text: "Design an advisory positioning study" },
];

/* ────────────────────────────────────────────────────────── */
/* COVERAGE CATEGORIES (Act > Planning sidebar)              */
/* ────────────────────────────────────────────────────────── */

export interface CoverageItem {
  industries: string[];
  category: string;
  chip: { label: string; bg: string; color: string };
}

export const ALL_COVERAGE: CoverageItem[] = [
  { industries: ["beverage", "fmcg"],          category: "Beverages & Functional Drinks", chip: { label: "Active", bg: SUC_LT, color: SUCCESS } },
  { industries: ["food", "fmcg"],              category: "Food & Agriculture",             chip: { label: "Active", bg: SUC_LT, color: SUCCESS } },
  { industries: ["qsr", "food"],               category: "QSR & Hospitality",              chip: { label: "Active", bg: SUC_LT, color: SUCCESS } },
  { industries: ["beauty", "health", "retail"],category: "Beauty & Personal Care",         chip: { label: "Active", bg: SUC_LT, color: SUCCESS } },
  { industries: ["finance"],                   category: "Finance & Banking",              chip: { label: "Active", bg: SUC_LT, color: SUCCESS } },
  { industries: ["retail", "fmcg"],            category: "Retail & E-commerce",           chip: { label: "Active", bg: SUC_LT, color: SUCCESS } },
  { industries: ["cross-industry"],            category: "Cross-Industry Trends",         chip: { label: "Live",   bg: VIO_LT, color: VIO } },
];

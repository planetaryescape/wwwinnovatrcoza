export interface DigStudy {
  id: string;
  company_id: string;
  study_name: string;
  public_client_report_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  concept_count: number;
  respondent_count: number;
}

export interface DigStudyDetail extends DigStudy {
  concepts: { id: string; label: string }[];
}

export interface DigConcept {
  id: string;
  study_id: string;
  label: string;
  idea_score: number | null;
  interest_score: number | null;
  commitment_score: number | null;
  emotions: Record<string, number>;
  agreement: Record<string, Record<string, number>>;
  themes: string[];
  sample_verbatims: string[];
}

export interface DigConceptDetail extends DigConcept {
  heatmap_url: string | null;
}

export interface DigHeatmap {
  concept_id: string;
  image_url: string | null;
  zones: { x: number; y: number; radius: number; intensity: number }[];
}

export interface DigRanking {
  study_id: string;
  concepts: {
    concept_id: string;
    label: string;
    idea_score: number;
    interest_score: number;
    commitment_score: number;
    rank: number;
  }[];
}

export interface DigDemographics {
  study_id: string;
  gender: Record<string, number>;
  age_buckets: Record<string, number>;
  provinces: Record<string, number>;
}

export interface DigTheme {
  theme_category: string;
  positive: number;
  neutral: number;
  negative: number;
  sample_verbatims: string[];
}

export interface DigThemesResponse {
  study_id: string;
  themes: DigTheme[];
}

export interface DigSearchResult {
  respondent_id: string;
  text: string;
  distance: number;
  concept_label: string;
  theme_category: string | null;
}

export interface DigSearchResponse {
  study_id: string;
  query: string;
  results: DigSearchResult[];
}

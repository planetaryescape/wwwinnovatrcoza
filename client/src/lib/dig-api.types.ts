export type IngestStatus = "pending" | "unpacking" | "parsing" | "parsed" | "ready" | "failed";

export interface DigStudy {
  id: string;
  title: string;
  source_study_name: string | null;
  public_client_report_id: string | null;
  ingest_status: IngestStatus;
  file_count: number;
  respondent_count: number;
  concept_count: number;
  created_at: string;
  updated_at: string;
}

export interface DigStudyDetail extends DigStudy {
  error_message: string | null;
  metadata: Record<string, unknown> | null;
}

export interface ConceptAggregate {
  id: string;
  name: string;
  concept_type: "control" | "new" | "existing" | string | null;
  brand: string | null;
  product_name: string | null;
  product_format: string | null;
  segments: string[];
  interest_sample: number;
  interest_rate: number | null;
  commitment_sample: number;
  wins: number;
  losses: number;
  win_rate: number | null;
}

export interface ConceptEmotion {
  emotion: string;
  selected_count: number;
  total: number;
  percentage: number;
}

export interface ConceptAgreement {
  question_group: "self" | "brand";
  statement: string;
  total: number;
  agree_count: number;
  agree_percentage: number;
  avg_response_code: number | null;
}

export interface ConceptTheme {
  theme_category: string;
  mentions: number;
  positive: number;
  negative: number;
  neutral: number;
}

export interface SampleVerbatim {
  respondent_external_id: string | null;
  clarity_label: string | null;
  comment: string;
}

export interface ConceptDetail {
  id: string;
  name: string;
  concept_type: string | null;
  brand: string | null;
  product_name: string | null;
  product_format: string | null;
  segments: string[];
  evaluation_count: number;
  emotions: ConceptEmotion[];
  agreements: ConceptAgreement[];
  themes: ConceptTheme[];
  sample_verbatims: SampleVerbatim[];
}

export interface HeatmapClick {
  evaluation_id: string;
  respondent_external_id: string | null;
  question_type: "like" | "dislike" | string;
  click_order: number;
  x_coord: number | null;
  y_coord: number | null;
  comment: string | null;
  time_between_ms: number | null;
}

export interface RankedConcept {
  rank: number;
  concept_id: string;
  name: string;
  wins: number;
  losses: number;
  win_rate: number | null;
  interest_rate: number | null;
}

export interface DemographicBucket {
  label?: string | null;
  bucket?: string;
  count: number;
  percentage: number;
}

export interface Demographics {
  total_respondents: number;
  gender: DemographicBucket[];
  age_buckets: DemographicBucket[];
  province: DemographicBucket[];
}

export interface CrossConceptTheme {
  concept_id: string | null;
  concept_name: string;
  theme_category: string;
  mentions: number;
  positive: number;
  negative: number;
  neutral: number;
}

export interface SearchRequest {
  query: string;
  study_id?: string;
  concept_id?: string;
  limit?: number;
}

export interface SearchResult {
  content: string;
  distance: number;
  source_table: "evaluations" | "eval_heatmap_clicks";
  source_id: string;
  concept_id: string | null;
}

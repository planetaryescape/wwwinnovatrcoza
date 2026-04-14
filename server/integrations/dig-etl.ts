const DIG_URL =
  process.env.DIG_ETL_API_URL ?? "https://innovatr-dig-etl.vercel.app/api/dig";

export class DigApiError extends Error {
  constructor(
    public status: number,
    public body: { code: string; message: string },
  ) {
    super(body.message);
    this.name = "DigApiError";
  }
}

function buildHeaders(companyId: string, extra?: HeadersInit): HeadersInit {
  const serviceToken = process.env.DIG_ETL_SERVICE_TOKEN;
  if (!serviceToken) {
    throw new Error(
      "DIG_ETL_SERVICE_TOKEN is not set — add it to Replit Secrets",
    );
  }
  return {
    Authorization: `Service ${serviceToken}`,
    "X-Company-Id": companyId,
    "Content-Type": "application/json",
    ...(extra ?? {}),
  };
}

async function digFetch<T>(
  path: string,
  companyId: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${DIG_URL}${path}`, {
    ...init,
    headers: buildHeaders(companyId, init?.headers),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new DigApiError(
      res.status,
      body.error ?? { code: "INTERNAL", message: `HTTP ${res.status}` },
    );
  }
  return res.json() as Promise<T>;
}

export interface DigStudy {
  id: string;
  title: string;
  source_study_name: string | null;
  public_client_report_id: string | null;
  ingest_status: string;
  file_count: number;
  respondent_count: number;
  concept_count: number;
  created_at: string;
  updated_at: string;
}

export interface DigSearchRequest {
  query: string;
  study_id?: string;
  concept_id?: string;
  limit?: number;
}

export const digApi = {
  listStudies: (companyId: string) =>
    digFetch<{ studies: DigStudy[] }>("/studies", companyId),

  getStudy: (companyId: string, id: string) =>
    digFetch<{ study: unknown }>(`/studies/${id}`, companyId),

  listConcepts: (companyId: string, studyId: string) =>
    digFetch<{ concepts: unknown[] }>(`/studies/${studyId}/concepts`, companyId),

  getConcept: (companyId: string, studyId: string, conceptId: string) =>
    digFetch<{ concept: unknown }>(
      `/studies/${studyId}/concepts/${conceptId}`,
      companyId,
    ),

  getHeatmap: (companyId: string, studyId: string, conceptId: string) =>
    digFetch<{ clicks: unknown[] }>(
      `/studies/${studyId}/concepts/${conceptId}/heatmap`,
      companyId,
    ),

  getRanking: (companyId: string, studyId: string) =>
    digFetch<{ ranking: unknown[] }>(`/studies/${studyId}/ranking`, companyId),

  getDemographics: (companyId: string, studyId: string) =>
    digFetch<{ demographics: unknown }>(
      `/studies/${studyId}/demographics`,
      companyId,
    ),

  getThemes: (companyId: string, studyId: string) =>
    digFetch<{ themes: unknown[] }>(`/studies/${studyId}/themes`, companyId),

  search: (companyId: string, body: DigSearchRequest) =>
    digFetch<{ results: unknown[] }>("/search", companyId, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

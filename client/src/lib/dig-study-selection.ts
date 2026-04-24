import type { DigStudy } from "./dig-api.types";

const STATUS_PRIORITY: Record<string, number> = {
  ready: 4,
  parsed: 3,
  parsing: 2,
  unpacking: 1,
  pending: 0,
  failed: -1,
};

function timestamp(value: string | null | undefined) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function compareDigStudyPreference(a: DigStudy, b: DigStudy) {
  const statusDelta =
    (STATUS_PRIORITY[a.ingest_status] ?? -1) -
    (STATUS_PRIORITY[b.ingest_status] ?? -1);

  if (statusDelta !== 0) return statusDelta;

  const updatedDelta = timestamp(a.updated_at) - timestamp(b.updated_at);
  if (updatedDelta !== 0) return updatedDelta;

  return timestamp(a.created_at) - timestamp(b.created_at);
}

export function selectPreferredDigStudy(studies: DigStudy[]) {
  return studies.reduce<DigStudy | null>(
    (best, study) => (!best || compareDigStudyPreference(study, best) > 0 ? study : best),
    null,
  );
}

export function selectDigStudyForReport(studies: DigStudy[], reportId: string | undefined) {
  if (!reportId) return null;
  return selectPreferredDigStudy(studies.filter((study) => study.public_client_report_id === reportId));
}

export function mapPreferredDigStudiesByReportId(studies: DigStudy[]) {
  const grouped = new Map<string, DigStudy[]>();

  for (const study of studies) {
    if (!study.public_client_report_id) continue;
    const existing = grouped.get(study.public_client_report_id) ?? [];
    existing.push(study);
    grouped.set(study.public_client_report_id, existing);
  }

  const preferred = new Map<string, DigStudy>();
  grouped.forEach((reportStudies, reportId) => {
    const study = selectPreferredDigStudy(reportStudies);
    if (study) preferred.set(reportId, study);
  });

  return preferred;
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type {
  DigStudy,
  DigStudyDetail,
  DigConcept,
  DigConceptDetail,
  DigHeatmap,
  DigRanking,
  DigDemographics,
  DigThemesResponse,
  DigSearchResponse,
} from "./dig-api.types";

export function useDigStudies(enabled = true) {
  return useQuery<DigStudy[]>({
    queryKey: ["/api/member/dig/studies"],
    enabled,
    select: (data) => {
      if (Array.isArray(data)) return data;
      const wrapped = data as unknown as { studies: DigStudy[] };
      return wrapped.studies ?? [];
    },
  });
}

export function useDigStudy(studyId: string | undefined) {
  return useQuery<DigStudyDetail>({
    queryKey: ["/api/member/dig/studies", studyId],
    enabled: !!studyId,
  });
}

export function useDigConcepts(studyId: string | undefined) {
  return useQuery<DigConcept[]>({
    queryKey: ["/api/member/dig/studies", studyId, "concepts"],
    enabled: !!studyId,
  });
}

export function useDigConcept(studyId: string | undefined, conceptId: string | undefined) {
  return useQuery<DigConceptDetail>({
    queryKey: ["/api/member/dig/studies", studyId, "concepts", conceptId],
    enabled: !!studyId && !!conceptId,
  });
}

export function useDigHeatmap(studyId: string | undefined, conceptId: string | undefined) {
  return useQuery<DigHeatmap>({
    queryKey: ["/api/member/dig/studies", studyId, "concepts", conceptId, "heatmap"],
    enabled: !!studyId && !!conceptId,
  });
}

export function useDigRanking(studyId: string | undefined) {
  return useQuery<DigRanking>({
    queryKey: ["/api/member/dig/studies", studyId, "ranking"],
    enabled: !!studyId,
  });
}

export function useDigDemographics(studyId: string | undefined) {
  return useQuery<DigDemographics>({
    queryKey: ["/api/member/dig/studies", studyId, "demographics"],
    enabled: !!studyId,
  });
}

export function useDigThemes(studyId: string | undefined) {
  return useQuery<DigThemesResponse>({
    queryKey: ["/api/member/dig/studies", studyId, "themes"],
    enabled: !!studyId,
  });
}

export function useDigSearch(studyId: string | undefined) {
  return useMutation<DigSearchResponse, Error, { query: string; limit?: number }>({
    mutationFn: async ({ query, limit }) => {
      const res = await apiRequest("POST", `/api/member/dig/studies/${studyId}/search`, {
        query,
        limit: limit ?? 20,
      });
      return res.json();
    },
  });
}

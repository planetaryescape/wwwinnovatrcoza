import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type {
  DigStudy,
  DigStudyDetail,
  ConceptAggregate,
  ConceptDetail,
  HeatmapClick,
  RankedConcept,
  Demographics,
  CrossConceptTheme,
  SearchRequest,
  SearchResult,
} from "./dig-api.types";

export function useDigStudies(enabled = true) {
  return useQuery<{ studies: DigStudy[] }>({
    queryKey: ["/api/member/dig/studies"],
    enabled,
  });
}

export function useDigStudy(studyId: string | undefined) {
  return useQuery<{ study: DigStudyDetail }>({
    queryKey: ["/api/member/dig/studies", studyId],
    enabled: !!studyId,
  });
}

export function useDigConcepts(studyId: string | undefined) {
  return useQuery<{ concepts: ConceptAggregate[] }>({
    queryKey: ["/api/member/dig/studies", studyId, "concepts"],
    enabled: !!studyId,
  });
}

export function useDigConcept(studyId: string | undefined, conceptId: string | undefined) {
  return useQuery<{ concept: ConceptDetail }>({
    queryKey: ["/api/member/dig/studies", studyId, "concepts", conceptId],
    enabled: !!studyId && !!conceptId,
  });
}

export function useDigHeatmap(studyId: string | undefined, conceptId: string | undefined) {
  return useQuery<{ clicks: HeatmapClick[] }>({
    queryKey: ["/api/member/dig/studies", studyId, "concepts", conceptId, "heatmap"],
    enabled: !!studyId && !!conceptId,
  });
}

export function useDigRanking(studyId: string | undefined) {
  return useQuery<{ ranking: RankedConcept[] }>({
    queryKey: ["/api/member/dig/studies", studyId, "ranking"],
    enabled: !!studyId,
  });
}

export function useDigDemographics(studyId: string | undefined) {
  return useQuery<{ demographics: Demographics }>({
    queryKey: ["/api/member/dig/studies", studyId, "demographics"],
    enabled: !!studyId,
  });
}

export function useDigThemes(studyId: string | undefined) {
  return useQuery<{ themes: CrossConceptTheme[] }>({
    queryKey: ["/api/member/dig/studies", studyId, "themes"],
    enabled: !!studyId,
  });
}

export function useDigSearch() {
  return useMutation<{ results: SearchResult[] }, Error, SearchRequest>({
    mutationFn: async (body) => {
      const res = await apiRequest("POST", "/api/member/dig/search", body);
      return res.json();
    },
  });
}

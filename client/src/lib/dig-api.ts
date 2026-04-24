import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { useAuth } from "@/contexts/AuthContext";
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
  const { activeCompany } = useAuth();

  return useQuery<{ studies: DigStudy[] }>({
    queryKey: ["/api/member/dig/studies", activeCompany?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/member/dig/studies");
      return res.json();
    },
    enabled: enabled && !!activeCompany,
  });
}

export function useDigStudy(studyId: string | undefined) {
  const { activeCompany } = useAuth();

  return useQuery<{ study: DigStudyDetail }>({
    queryKey: ["/api/member/dig/studies", activeCompany?.id, studyId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/member/dig/studies/${studyId}`);
      return res.json();
    },
    enabled: !!activeCompany && !!studyId,
  });
}

export function useDigConcepts(studyId: string | undefined) {
  const { activeCompany } = useAuth();

  return useQuery<{ concepts: ConceptAggregate[] }>({
    queryKey: ["/api/member/dig/studies", activeCompany?.id, studyId, "concepts"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/member/dig/studies/${studyId}/concepts`);
      return res.json();
    },
    enabled: !!activeCompany && !!studyId,
  });
}

export function useDigConcept(studyId: string | undefined, conceptId: string | undefined) {
  const { activeCompany } = useAuth();

  return useQuery<{ concept: ConceptDetail }>({
    queryKey: ["/api/member/dig/studies", activeCompany?.id, studyId, "concepts", conceptId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/member/dig/studies/${studyId}/concepts/${conceptId}`);
      return res.json();
    },
    enabled: !!activeCompany && !!studyId && !!conceptId,
  });
}

export function useDigHeatmap(studyId: string | undefined, conceptId: string | undefined) {
  const { activeCompany } = useAuth();

  return useQuery<{ clicks: HeatmapClick[] }>({
    queryKey: ["/api/member/dig/studies", activeCompany?.id, studyId, "concepts", conceptId, "heatmap"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/member/dig/studies/${studyId}/concepts/${conceptId}/heatmap`);
      return res.json();
    },
    enabled: !!activeCompany && !!studyId && !!conceptId,
  });
}

export function useDigRanking(studyId: string | undefined) {
  const { activeCompany } = useAuth();

  return useQuery<{ ranking: RankedConcept[] }>({
    queryKey: ["/api/member/dig/studies", activeCompany?.id, studyId, "ranking"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/member/dig/studies/${studyId}/ranking`);
      return res.json();
    },
    enabled: !!activeCompany && !!studyId,
  });
}

export function useDigDemographics(studyId: string | undefined) {
  const { activeCompany } = useAuth();

  return useQuery<{ demographics: Demographics }>({
    queryKey: ["/api/member/dig/studies", activeCompany?.id, studyId, "demographics"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/member/dig/studies/${studyId}/demographics`);
      return res.json();
    },
    enabled: !!activeCompany && !!studyId,
  });
}

export function useDigThemes(studyId: string | undefined) {
  const { activeCompany } = useAuth();

  return useQuery<{ themes: CrossConceptTheme[] }>({
    queryKey: ["/api/member/dig/studies", activeCompany?.id, studyId, "themes"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/member/dig/studies/${studyId}/themes`);
      return res.json();
    },
    enabled: !!activeCompany && !!studyId,
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

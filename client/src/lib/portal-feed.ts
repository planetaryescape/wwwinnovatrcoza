import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

export interface PortalSignalItem {
  id: string;
  reportId: string;
  slug: string | null;
  tag: string;
  tagBg: string;
  tagColor: string;
  title: string;
  meta: string;
  chip: { label: string; bg: string; color: string };
}

export interface PortalRecommendationGap {
  id: string;
  priority: number;
  title: string;
  chip: { label: string; bg: string; color: string };
  desc: string;
  cta: string | null;
  ctaAction: string | null;
  ctaHref?: string | null;
  priorityStyle: { bg: string; color: string };
}

export interface PortalRecommendationStep {
  id: string;
  num: number;
  title: string;
  desc: string;
  cta: { label: string; action: string; primary: boolean; href?: string | null } | null;
  locked: boolean;
  lockedReason?: string;
}

export interface PortalCoverageItem {
  id: string;
  category: string;
  chip: { label: string; bg: string; color: string };
}

export interface PortalConsultOffer {
  id: string;
  serviceType: string;
  title: string;
  desc: string;
  note: string | null;
  badgeLabel: string;
}

export interface PortalFeed {
  signals: PortalSignalItem[];
  gaps: PortalRecommendationGap[];
  nextSteps: PortalRecommendationStep[];
  coverage: PortalCoverageItem[];
  planningPrompts: string[];
  consultOffers: PortalConsultOffer[];
}

export function usePortalFeed(enabled = true) {
  const { activeCompany } = useAuth();

  return useQuery<PortalFeed>({
    queryKey: ["/api/member/portal-feed", activeCompany?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/member/portal-feed");
      return res.json();
    },
    enabled: enabled && !!activeCompany,
  });
}

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { resolveIndustryGroups } from "@/lib/industry-groups";

interface CompanyData {
  id: string;
  name: string;
  industry?: string | null;
}

/**
 * Returns the current authenticated user's industry group tags,
 * or null for Market Research companies (which see everything).
 */
export function useIndustryGroups(): {
  industryGroups: string[] | null;
  industry: string | null;
  companyName: string | null;
  isLoading: boolean;
} {
  const { user } = useAuth();

  const { data: company, isLoading } = useQuery<CompanyData | null>({
    queryKey: ["/api/member/company", user?.companyId],
    queryFn: async () => {
      if (!user?.companyId) return null;
      const r = await fetch("/api/member/company");
      if (!r.ok) return null;
      return r.json();
    },
    enabled: !!user?.companyId,
    staleTime: 5 * 60 * 1000,
  });

  const industryGroups = useMemo(
    () => resolveIndustryGroups(company?.industry),
    [company?.industry],
  );

  return {
    industryGroups,
    industry: company?.industry ?? null,
    companyName: company?.name ?? null,
    isLoading,
  };
}

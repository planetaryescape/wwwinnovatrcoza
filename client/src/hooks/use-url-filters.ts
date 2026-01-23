import { useMemo, useCallback } from "react";
import { useLocation, useSearch } from "wouter";

export interface FilterState {
  search: string;
  category: string;
  industry: string;
  sort: string;
  access: string;
  showAll: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "all",
  industry: "all",
  sort: "newest",
  access: "all",
  showAll: false,
};

function parseBoolean(value: string | null): boolean {
  return value === "true" || value === "1";
}

export function useUrlFilters() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();

  const filters = useMemo<FilterState>(() => {
    const params = new URLSearchParams(searchString);
    return {
      search: params.get("q") || DEFAULT_FILTERS.search,
      category: params.get("category") || DEFAULT_FILTERS.category,
      industry: params.get("industry") || DEFAULT_FILTERS.industry,
      sort: params.get("sort") || DEFAULT_FILTERS.sort,
      access: params.get("access") || DEFAULT_FILTERS.access,
      showAll: parseBoolean(params.get("all")),
    };
  }, [searchString]);

  const setFilters = useCallback(
    (newFilters: Partial<FilterState>) => {
      const params = new URLSearchParams(searchString);

      const updatedFilters = { ...filters, ...newFilters };

      if (updatedFilters.search && updatedFilters.search !== DEFAULT_FILTERS.search) {
        params.set("q", updatedFilters.search);
      } else {
        params.delete("q");
      }

      if (updatedFilters.category && updatedFilters.category !== DEFAULT_FILTERS.category) {
        params.set("category", updatedFilters.category);
      } else {
        params.delete("category");
      }

      if (updatedFilters.industry && updatedFilters.industry !== DEFAULT_FILTERS.industry) {
        params.set("industry", updatedFilters.industry);
      } else {
        params.delete("industry");
      }

      if (updatedFilters.sort && updatedFilters.sort !== DEFAULT_FILTERS.sort) {
        params.set("sort", updatedFilters.sort);
      } else {
        params.delete("sort");
      }

      if (updatedFilters.access && updatedFilters.access !== DEFAULT_FILTERS.access) {
        params.set("access", updatedFilters.access);
      } else {
        params.delete("access");
      }

      if (updatedFilters.showAll) {
        params.set("all", "true");
      } else {
        params.delete("all");
      }

      const newSearch = params.toString();
      const basePath = location.split("?")[0];
      const newUrl = newSearch ? `${basePath}?${newSearch}` : basePath;
      setLocation(newUrl, { replace: true });
    },
    [filters, location, searchString, setLocation]
  );

  const clearFilters = useCallback(() => {
    const basePath = location.split("?")[0];
    setLocation(basePath, { replace: true });
  }, [location, setLocation]);

  return {
    filters,
    setFilters,
    clearFilters,
  };
}

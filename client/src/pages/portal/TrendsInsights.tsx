import { useMemo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowRight, ChevronDown, ChevronUp, Lock, Crown, CreditCard, Building2, Grid3x3, List, RefreshCw } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { Link } from "wouter";
import reportsData from "@/data/reports.json";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useUrlFilters } from "@/hooks/use-url-filters";
import insightsCover from "@assets/insights-cover_1764321138388.png";
import launchCover from "@assets/launch-cover_1764321848244.png";
import insideCover from "@assets/inside-cover_1764321472939.png";
import irlCover from "@assets/irl-cover_1764322310189.png";

const categoryCoverImages: Record<string, string> = {
  insights: insightsCover,
  irl: irlCover,
  inside: insideCover,
  launch: launchCover,
};

function normalizeCategoryKey(category: string): string {
  const normalized = category.toLowerCase().trim().replace("innovatr ", "");
  return normalized;
}

function getCoverImage(category: string): string {
  const key = normalizeCategoryKey(category);
  return categoryCoverImages[key] || categoryCoverImages.insights;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  insights: { bg: "bg-blue-50", text: "text-[#5B6EF7]" },
  launch: { bg: "bg-orange-50", text: "text-orange-700" },
  inside: { bg: "bg-violet-50", text: "text-violet-700" },
  irl: { bg: "bg-rose-50", text: "text-rose-700" },
};

function getCategoryStyle(category: string) {
  const key = normalizeCategoryKey(category);
  return categoryColors[key] || categoryColors.insights;
}

type AccessLevel = "public" | "member" | "tier" | "paid";

interface Report {
  id: number | string;
  category: string;
  series?: string;
  displayCategories?: string[];
  industry: string;
  date: string;
  publishDate?: string;
  status?: "live" | "scheduled" | "draft" | "published";
  title: string;
  teaser: string;
  slug: string;
  coverImage: string;
  pdfPath: string | null;
  hasDownload?: boolean;
  videoPaths?: string[];
  tags: string[];
  isNew: boolean;
  access?: "free" | "members";
  accessLevel?: string;
  allowedTiers?: string[];
  creditType?: string;
  creditCost?: number;
  clientCompanyIds?: string[];
  isClientReport?: boolean;
  content?: {
    intro: string;
    sections: { heading: string; body: string }[];
  };
}

function getAccessIndicator(report: Report, userTier?: string, isLoggedIn?: boolean, userCompanyId?: string) {
  const accessLevel = report.accessLevel || "PUBLIC";
  
  // Company-only reports show a building icon
  if (accessLevel === "companyOnly" || report.isClientReport) {
    return (
      <div className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 shadow-sm" title="Your organization">
        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
      </div>
    );
  }
  
  if (accessLevel === "PUBLIC" || accessLevel === "public") {
    return null;
  }
  
  if (accessLevel === "STARTER" || accessLevel === "member") {
    if (!isLoggedIn) {
      return (
        <div className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 shadow-sm" title="Members only">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      );
    }
    return null;
  }
  
  if (accessLevel === "GROWTH") {
    const tierHierarchy = ["STARTER", "GROWTH", "SCALE"];
    const userTierIndex = userTier ? tierHierarchy.indexOf(userTier) : -1;
    const requiredTierIndex = tierHierarchy.indexOf("GROWTH");
    
    if (!isLoggedIn || userTierIndex < requiredTierIndex) {
      return (
        <div className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 shadow-sm" title="Growth+ tier required">
          <Crown className="w-3.5 h-3.5 text-[#5B6EF7]" />
        </div>
      );
    }
    return null;
  }
  
  if (accessLevel === "SCALE") {
    const tierHierarchy = ["STARTER", "GROWTH", "SCALE"];
    const userTierIndex = userTier ? tierHierarchy.indexOf(userTier) : -1;
    const requiredTierIndex = tierHierarchy.indexOf("SCALE");
    
    if (!isLoggedIn || userTierIndex < requiredTierIndex) {
      return (
        <div className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 shadow-sm" title="Scale tier required">
          <Crown className="w-3.5 h-3.5 text-[#5B6EF7]" />
        </div>
      );
    }
    return null;
  }
  
  if (accessLevel === "tier") {
    const allowedTiers = report.allowedTiers || [];
    const tierHierarchy = ["STARTER", "GROWTH", "SCALE"];
    const userTierIndex = userTier ? tierHierarchy.indexOf(userTier) : -1;
    
    const hasAccess = allowedTiers.some(tier => {
      const requiredTierIndex = tierHierarchy.indexOf(tier);
      return userTierIndex >= requiredTierIndex;
    });
    
    if (!hasAccess) {
      return (
        <div className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 shadow-sm" title={`${allowedTiers[0]}+ tier required`}>
          <Crown className="w-3.5 h-3.5 text-[#5B6EF7]" />
        </div>
      );
    }
  }
  
  if (accessLevel === "paid") {
    return (
      <div className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 shadow-sm" title="Credits required">
        <CreditCard className="w-3.5 h-3.5 text-[#5B6EF7]" />
      </div>
    );
  }
  
  return null;
}

function ReportCard({ report, userTier, isLoggedIn, userCompanyId }: { report: Report; userTier?: string; isLoggedIn?: boolean; userCompanyId?: string }) {
  const formattedDate = new Date(report.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const categoryStyle = getCategoryStyle(report.category);
  const coverImage = getCoverImage(report.category);
  const accessIndicator = getAccessIndicator(report, userTier, isLoggedIn, userCompanyId);
  
  const accessLevel = report.accessLevel || "PUBLIC";
  const isPublicWithPdf = (accessLevel === "PUBLIC" || accessLevel === "public") && report.pdfPath;
  const ctaText = isPublicWithPdf ? "Download full report" : "Read full issue";

  return (
    <Link href={`/portal/insights/${report.slug}`}>
      <article 
        className="group bg-card rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-border hover:-translate-y-1 flex flex-col h-full"
        data-testid={`report-card-${report.id}`}
      >
        <div className="p-4 pb-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge 
              className={`${categoryStyle.bg} ${categoryStyle.text} text-xs font-medium px-2.5 py-1 border-0`}
            >
              {report.category}
            </Badge>
            <Badge 
              variant="secondary"
              className="text-xs px-2.5 py-1 bg-muted text-muted-foreground"
            >
              {report.industry}
            </Badge>
            {report.isNew && (
              <Badge 
                className="text-white text-xs font-medium px-2 py-1"
                style={{ backgroundColor: '#5B6EF7' }}
                data-testid={`badge-new-${report.id}`}
              >
                NEW
              </Badge>
            )}
          </div>
        </div>

        <div className="relative h-44 mx-4 rounded-lg overflow-hidden">
          <img
            src={coverImage}
            alt={report.category}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {accessIndicator}
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <h3 
            className="font-serif text-xl leading-tight mb-2 text-foreground group-hover:text-[#5B6EF7] transition-colors line-clamp-2"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            {report.title}
          </h3>
          
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1">
            {report.teaser}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mb-4">
            {report.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-muted text-muted-foreground hover:bg-muted/80"
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">{formattedDate}</span>
            <div 
              className="flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: '#5B6EF7' }}
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function TrendsInsights() {
  const { filters, setFilters, clearFilters } = useUrlFilters();
  const [clientReports, setClientReports] = useState<Report[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const userTier = user?.membershipTier;
  const userCompanyId = user?.companyId;
  
  useScrollRestoration("trends-insights");
  
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh by clearing and refetching
    setClientReports([]);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  // Fetch all reports for authenticated user (includes client-specific reports based on their companyId)
  useEffect(() => {
    const fetchMemberReports = async () => {
      if (!user?.email) {
        setClientReports([]);
        return;
      }
      
      try {
        const res = await fetch(`/api/member/reports?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          // Format client-specific reports (those with clientCompanyIds)
          const formattedReports = data
            .filter((r: any) => r.clientCompanyIds && r.clientCompanyIds.length > 0)
            .map((r: any) => ({
              ...r,
              isClientReport: true,
              tags: r.tags || [],
              isNew: r.isNew ?? false,
              status: "live" as const, // API returns published, but frontend uses "live"
            }));
          setClientReports(formattedReports);
        }
      } catch (error) {
        console.error("Failed to fetch member reports:", error);
      }
    };
    
    fetchMemberReports();
  }, [user?.email]);

  const filteredAndSortedReports = useMemo(() => {
    // Combine static reports with client-specific reports
    const allReports = [...(reportsData as Report[]), ...clientReports];
    
    let filtered = allReports.filter((report) => {
      // Only show live reports to public users (status must be "live" or undefined for backwards compatibility)
      const isLive = !report.status || report.status === "live" || report.status === "published";
      if (!isLive) return false;
      
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        report.title.toLowerCase().includes(searchLower) ||
        report.teaser.toLowerCase().includes(searchLower) ||
        (report.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
      const matchesCategory = filters.category === "all" || 
        report.category.toLowerCase() === filters.category.toLowerCase();
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      switch (filters.sort) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "atoz":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [filters.search, filters.category, filters.sort, clientReports]);

  const displayedReports = filters.showAll ? filteredAndSortedReports : filteredAndSortedReports.slice(0, 6);
  const hasMoreReports = filteredAndSortedReports.length > 6;

  return (
    <PortalLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 
                className="text-4xl md:text-5xl font-bold mb-3 text-foreground"
                style={{ fontFamily: 'DM Serif Display, serif' }}
              >
                Trends & Insights Library
              </h1>
              <p className="text-lg text-muted-foreground" style={{ fontFamily: 'Roboto, sans-serif' }}>Not trend fluff. Your inside track on South Africa’s shifting market.</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
                data-testid="button-refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                data-testid="button-view-list"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by title, topic, or tag..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10 h-10 rounded-full border-border focus:border-[#5B6EF7] focus:ring-[#5B6EF7]"
                data-testid="input-search-reports"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filters.category} onValueChange={(value) => setFilters({ category: value })}>
                <SelectTrigger 
                  className="w-32 h-10 rounded-full border-border"
                  data-testid="select-category"
                >
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Insights">Insights</SelectItem>
                  <SelectItem value="Launch">Launch</SelectItem>
                  <SelectItem value="Inside">Inside</SelectItem>
                  <SelectItem value="IRL">IRL</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sort} onValueChange={(value) => setFilters({ sort: value })}>
                <SelectTrigger 
                  className="w-36 h-10 rounded-full border-border"
                  data-testid="select-sort"
                >
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="atoz">A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Showing {displayedReports.length} of {filteredAndSortedReports.length} reports
          </p>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {displayedReports.map((report) => (
                <ReportCard key={report.id} report={report} userTier={userTier} isLoggedIn={!!user} userCompanyId={userCompanyId ?? undefined} />
              ))}
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {displayedReports.map((report) => (
                <Link key={report.id} href={`/portal/trends/${report.slug}`}>
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover-elevate bg-card" data-testid={`list-report-${report.id}`}>
                    <div 
                      className="w-20 h-14 rounded-md bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${getCoverImage(report.category)})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getCategoryStyle(report.category).bg} ${getCategoryStyle(report.category).text} text-xs`}>
                          {report.category}
                        </Badge>
                        {report.isNew && (
                          <Badge className="bg-[#00D084] text-white text-xs">NEW</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{report.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{report.teaser}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {filteredAndSortedReports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No reports match your search criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                Clear filters
              </Button>
            </div>
          )}

          {hasMoreReports && !filters.showAll && filteredAndSortedReports.length > 0 && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setFilters({ showAll: true })}
                className="rounded-full px-8 border-[#5B6EF7] text-[#5B6EF7] hover:bg-[#5B6EF7] hover:text-white"
                data-testid="button-show-all"
              >
                Show all reports
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {filters.showAll && hasMoreReports && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setFilters({ showAll: false })}
                className="rounded-full px-8 border-[#5B6EF7] text-[#5B6EF7] hover:bg-[#5B6EF7] hover:text-white"
                data-testid="button-show-less"
              >
                Show less
                <ChevronUp className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

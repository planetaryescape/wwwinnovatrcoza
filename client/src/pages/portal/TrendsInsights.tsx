import { useMemo, useEffect, useState, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, ArrowRight, ChevronDown, ChevronUp, Lock, Building2, Grid3x3, List, RefreshCw, Loader2, Crown } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { 
  isFreeContent, 
  getEffectiveAccessLevel,
  isPaidMember as checkIsPaidMember
} from "@shared/access";
import insightsCover from "@assets/Innovatr_Insights_1765389850447.png";
import launchCover from "@assets/Innovatr_Launch_1765389741317.png";
import insideCover from "@assets/Innovatr_Inside_1765389935893.png";
import irlCover from "@assets/Innovatr_IRL_1765389884914.png";
import foodCover from "@assets/industry-food.png";
import beveragesCover from "@assets/industry-beverages.png";
import alcoholCover from "@assets/industry-alcohol.png";
import financialCover from "@assets/industry-financial.png";
import fmcgCover from "@assets/industry-fmcg.png";
import beautyCover from "@assets/industry-beauty.png";

const categoryCoverImages: Record<string, string> = {
  insights: insightsCover,
  irl: irlCover,
  inside: insideCover,
  launch: launchCover,
};

const industryCoverImages: Record<string, string> = {
  food: foodCover,
  beverages: beveragesCover,
  alcohol: alcoholCover,
  financial: financialCover,
  fmcgs: fmcgCover,
  beauty: beautyCover,
};

function normalizeCategoryKey(category: string): string {
  const normalized = category.toLowerCase().trim().replace("innovatr ", "");
  return normalized;
}

function getCoverImage(category: string, industry?: string): string {
  if (industry) {
    const industryKey = industry.toLowerCase().trim();
    if (industryCoverImages[industryKey]) {
      return industryCoverImages[industryKey];
    }
  }
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
  // Company-only reports show a building icon
  if (report.isClientReport) {
    return (
      <div className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 shadow-sm" title="Your organization">
        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
      </div>
    );
  }
  
  // Paid members (STARTER, GROWTH, SCALE) have full access - no lock indicators
  const normalizedTier = (userTier || "").toUpperCase();
  const paidTiers = ["STARTER", "GROWTH", "SCALE"];
  const isPaidMember = isLoggedIn && paidTiers.includes(normalizedTier);
  
  if (isPaidMember) {
    return null; // No locks for paid members
  }
  
  // Use shared access helpers for consistent tier gating
  const effectiveAccess = getEffectiveAccessLevel({
    slug: report.slug,
    title: report.title,
    category: report.category,
    accessLevel: report.accessLevel
  });
  
  // Free/public content - no indicator
  if (effectiveAccess === "PUBLIC") {
    return null;
  }
  
  // Show lock for non-public content when user is not a paid member
  return (
    <div className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 shadow-sm" title="Members only">
      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
    </div>
  );
}

interface TeaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
  isLoggedIn: boolean;
}

function TeaseModal({ open, onOpenChange, report, isLoggedIn }: TeaseModalProps) {
  const [, setLocation] = useLocation();
  
  if (!report) return null;
  
  const categoryStyle = getCategoryStyle(report.category);
  const coverImage = getCoverImage(report.category, report.industry);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="relative h-32 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
            <img
              src={coverImage}
              alt={report.category}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <Badge 
              className={`absolute bottom-3 left-4 ${categoryStyle.bg} ${categoryStyle.text} text-xs font-medium px-2.5 py-1 border-0`}
            >
              {report.category}
            </Badge>
          </div>
          <DialogTitle 
            className="text-xl font-bold"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            {report.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {report.teaser}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Members Only Content</p>
              <p className="text-xs text-muted-foreground">Upgrade to unlock full access</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This report is available for Innovatr members. Upgrade to Starter or above to unlock it and get access to our full library of insights.
          </p>
          <div className="flex gap-2">
            {!isLoggedIn && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  onOpenChange(false);
                  setLocation("/login");
                }}
                data-testid="button-tease-login"
              >
                Sign In
              </Button>
            )}
            <Button 
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                setLocation("/portal/credits");
              }}
              data-testid="button-tease-upgrade"
            >
              {isLoggedIn ? "View Membership Options" : "Become a Member"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReportCard({ report, userTier, isLoggedIn, userCompanyId, onLockedClick }: { report: Report; userTier?: string; isLoggedIn?: boolean; userCompanyId?: string; onLockedClick?: (report: Report) => void }) {
  const [, setLocation] = useLocation();
  const formattedDate = new Date(report.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const categoryStyle = getCategoryStyle(report.category);
  const coverImage = getCoverImage(report.category, report.industry);
  const accessIndicator = getAccessIndicator(report, userTier, isLoggedIn, userCompanyId);
  
  const isPublicContent = isFreeContent({
    slug: report.slug,
    title: report.title,
    category: report.category,
    accessLevel: report.accessLevel
  });
  
  const normalizedTier = (userTier || "").toUpperCase();
  const paidTiers = ["STARTER", "GROWTH", "SCALE"];
  const userIsPaidMember = isLoggedIn && paidTiers.includes(normalizedTier);
  const isLocked = !isPublicContent && !userIsPaidMember;
  
  const isPublicWithPdf = isPublicContent && report.pdfPath;
  const ctaText = isLocked ? "Members only" : (isPublicWithPdf ? "Download full report" : "Read full issue");

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked && onLockedClick) {
      e.preventDefault();
      onLockedClick(report);
    } else {
      setLocation(`/portal/insights/${report.slug}`);
    }
  };

  return (
    <article 
      onClick={handleClick}
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
            {report.category.toLowerCase() === "inside" ? "Products" : report.industry}
          </Badge>
          {isLocked && (
            <Badge 
              variant="outline"
              className="text-xs px-2 py-1 border-muted-foreground/50 text-muted-foreground"
            >
              <Lock className="w-3 h-3 mr-1" />
              Members
            </Badge>
          )}
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
            style={{ color: isLocked ? 'var(--muted-foreground)' : '#5B6EF7' }}
          >
            <span>{ctaText}</span>
            {isLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TrendsInsights() {
  const { filters, setFilters, clearFilters } = useUrlFilters();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [refreshing, setRefreshing] = useState(false);
  const [teaseModalOpen, setTeaseModalOpen] = useState(false);
  const [teaseReport, setTeaseReport] = useState<Report | null>(null);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const userTier = user?.membershipTier;
  const userCompanyId = user?.companyId;
  
  const handleLockedClick = (report: Report) => {
    setTeaseReport(report);
    setTeaseModalOpen(true);
  };
  
  const handleUnlockedClick = (report: Report) => {
    navigate(`/portal/insights/${report.slug}`);
  };
  
  useScrollRestoration("trends-insights");
  
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        const formattedReports = data.map((r: any) => ({
          ...r,
          coverImage: r.thumbnailUrl || getCoverImage(r.category, r.industry),
          pdfPath: r.pdfUrl,
          tags: r.topics || [],
          isNew: false,
        }));
        setReports(formattedReports);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports().finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredAndSortedReports = useMemo(() => {
    let filtered = reports.filter((report) => {
      if (report.isClientReport) return false;
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
      
      const matchesIndustry = filters.industry === "all" || 
        (report.industry && report.industry.toLowerCase() === filters.industry.toLowerCase());
      
      const isReportFree = isFreeContent({
        slug: report.slug,
        title: report.title,
        category: report.category,
        accessLevel: report.accessLevel
      });
      
      let matchesAccess = true;
      if (filters.access === "free") {
        matchesAccess = isReportFree;
      } else if (filters.access === "members") {
        matchesAccess = !isReportFree;
      }
      
      return matchesSearch && matchesCategory && matchesIndustry && matchesAccess;
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
  }, [filters.search, filters.category, filters.industry, filters.sort, filters.access, reports]);

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

              <Select value={filters.industry} onValueChange={(value) => setFilters({ industry: value })}>
                <SelectTrigger 
                  className="w-32 h-10 rounded-full border-border"
                  data-testid="select-industry"
                >
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Beverages">Beverages</SelectItem>
                  <SelectItem value="Alcohol">Alcohol</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="FMCGs">FMCGs</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
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

              <Select value={filters.access} onValueChange={(value) => setFilters({ access: value })}>
                <SelectTrigger 
                  className="w-32 h-10 rounded-full border-border"
                  data-testid="select-access"
                >
                  <SelectValue placeholder="Access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="members">Members</SelectItem>
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
                <ReportCard 
                  key={report.id} 
                  report={report} 
                  userTier={userTier} 
                  isLoggedIn={!!user} 
                  userCompanyId={userCompanyId ?? undefined}
                  onLockedClick={handleLockedClick}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {displayedReports.map((report) => {
                const isPublicContent = isFreeContent({
                  slug: report.slug,
                  title: report.title,
                  category: report.category,
                  accessLevel: report.accessLevel
                });
                const normalizedTier = (userTier || "").toUpperCase();
                const paidTiers = ["STARTER", "GROWTH", "SCALE"];
                const userIsPaidMember = !!user && paidTiers.includes(normalizedTier);
                const isLocked = !isPublicContent && !userIsPaidMember;
                
                return (
                  <div 
                    key={report.id} 
                    onClick={() => isLocked ? handleLockedClick(report) : handleUnlockedClick(report)}
                    className="flex items-center gap-4 p-4 border rounded-lg hover-elevate bg-card cursor-pointer" 
                    data-testid={`list-report-${report.id}`}
                  >
                    <div 
                      className="w-20 h-14 rounded-md bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${getCoverImage(report.category, report.industry)})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${getCategoryStyle(report.category).bg} ${getCategoryStyle(report.category).text} text-xs`}>
                          {report.category}
                        </Badge>
                        {isLocked && (
                          <Badge variant="outline" className="text-xs border-muted-foreground/50 text-muted-foreground">
                            <Lock className="w-3 h-3 mr-1" />
                            Members
                          </Badge>
                        )}
                        {report.isNew && (
                          <Badge className="bg-[#00D084] text-white text-xs">NEW</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground truncate">{report.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{report.teaser}</p>
                    </div>
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                );
              })}
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
      
      <TeaseModal
        open={teaseModalOpen}
        onOpenChange={setTeaseModalOpen}
        report={teaseReport}
        isLoggedIn={!!user}
      />
    </PortalLayout>
  );
}

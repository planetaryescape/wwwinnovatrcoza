import { useState, useMemo } from "react";
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
import { Search, ArrowRight, ChevronDown, ChevronUp, Lock, Crown, CreditCard } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { Link } from "wouter";
import reportsData from "@/data/reports.json";
import { useAuth } from "@/contexts/AuthContext";
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
  id: number;
  category: string;
  industry: string;
  date: string;
  title: string;
  teaser: string;
  slug: string;
  coverImage: string;
  pdfPath: string;
  tags: string[];
  isNew: boolean;
  accessLevel?: AccessLevel;
  allowedTiers?: string[];
  creditType?: string;
  creditCost?: number;
  content?: {
    intro: string;
    sections: { heading: string; body: string }[];
  };
}

function getAccessIndicator(report: Report, userTier?: string) {
  const accessLevel = report.accessLevel || "public";
  
  if (accessLevel === "public") {
    return null;
  }
  
  if (accessLevel === "member") {
    return (
      <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm" title="Members only">
        <Lock className="w-3.5 h-3.5 text-gray-600" />
      </div>
    );
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
        <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm" title={`${allowedTiers[0]}+ tier required`}>
          <Crown className="w-3.5 h-3.5 text-[#5B6EF7]" />
        </div>
      );
    }
  }
  
  if (accessLevel === "paid") {
    return (
      <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow-sm" title="Credits required">
        <CreditCard className="w-3.5 h-3.5 text-[#5B6EF7]" />
      </div>
    );
  }
  
  return null;
}

function ReportCard({ report, userTier }: { report: Report; userTier?: string }) {
  const formattedDate = new Date(report.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const categoryStyle = getCategoryStyle(report.category);
  const coverImage = getCoverImage(report.category);
  const accessIndicator = getAccessIndicator(report, userTier);

  return (
    <Link href={`/portal/insights/${report.slug}`}>
      <article 
        className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:-translate-y-1 flex flex-col h-full"
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
              className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600"
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
            className="font-serif text-xl leading-tight mb-2 text-gray-900 group-hover:text-[#5B6EF7] transition-colors line-clamp-2"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            {report.title}
          </h3>
          
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1">
            {report.teaser}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mb-4">
            {report.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">{formattedDate}</span>
            <div 
              className="flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: '#5B6EF7' }}
            >
              <span>Read full issue</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function TrendsInsights() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();
  const userTier = user?.membershipTier;

  const filteredAndSortedReports = useMemo(() => {
    let filtered = (reportsData as Report[]).filter((report) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        report.title.toLowerCase().includes(searchLower) ||
        report.teaser.toLowerCase().includes(searchLower) ||
        report.tags.some(tag => tag.toLowerCase().includes(searchLower));
      const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
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
  }, [searchQuery, selectedCategory, sortBy]);

  const displayedReports = showAll ? filteredAndSortedReports : filteredAndSortedReports.slice(0, 6);
  const hasMoreReports = filteredAndSortedReports.length > 6;

  return (
    <PortalLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-3 text-gray-900"
              style={{ fontFamily: 'DM Serif Display, serif' }}
            >
              Trends & Insights Library
            </h1>
            <p className="text-lg text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Fresh perspectives on South African consumer behaviour, market shifts, and innovation opportunities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by title, topic, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-full border-gray-200 focus:border-[#5B6EF7] focus:ring-[#5B6EF7]"
                data-testid="input-search-reports"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger 
                  className="w-32 h-10 rounded-full border-gray-200"
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

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger 
                  className="w-36 h-10 rounded-full border-gray-200"
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

          <p className="text-sm text-gray-500 mb-6">
            Showing {displayedReports.length} of {filteredAndSortedReports.length} reports
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {displayedReports.map((report) => (
              <ReportCard key={report.id} report={report} userTier={userTier} />
            ))}
          </div>

          {filteredAndSortedReports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No reports match your search criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                data-testid="button-clear-filters"
              >
                Clear filters
              </Button>
            </div>
          )}

          {hasMoreReports && !showAll && filteredAndSortedReports.length > 0 && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAll(true)}
                className="rounded-full px-8 border-[#5B6EF7] text-[#5B6EF7] hover:bg-[#5B6EF7] hover:text-white"
                data-testid="button-show-all"
              >
                Show all reports
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {showAll && hasMoreReports && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAll(false)}
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

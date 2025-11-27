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
import { Search, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { Link } from "wouter";
import reportsData from "@/data/reports.json";

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
}

function ReportCard({ report }: { report: Report }) {
  const formattedDate = new Date(report.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Link href={`/portal/insights/${report.slug}`}>
      <article 
        className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:-translate-y-1"
        data-testid={`report-card-${report.id}`}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={report.coverImage}
            alt={report.category}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {report.isNew && (
            <Badge 
              className="absolute top-3 right-3 text-white text-xs font-medium px-2 py-1"
              style={{ backgroundColor: '#0033A0' }}
              data-testid={`badge-new-${report.id}`}
            >
              NEW
            </Badge>
          )}
        </div>
        
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span 
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: '#0033A0' }}
            >
              {report.category}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500">{report.industry}</span>
          </div>
          
          <h3 
            className="font-serif text-xl leading-tight mb-2 text-gray-900 group-hover:text-[#0033A0] transition-colors line-clamp-2"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            {report.title}
          </h3>
          
          <p className="text-sm text-gray-500 mb-3">{formattedDate}</p>
          
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
            {report.teaser}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mb-4">
            {report.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-gray-100 text-[#0033A0] hover:bg-gray-200"
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          <div 
            className="flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: '#0033A0' }}
          >
            <span>Read full issue</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
              Trends & Insights
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
                className="pl-10 h-10 rounded-full border-gray-200 focus:border-[#0033A0] focus:ring-[#0033A0]"
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
              <ReportCard key={report.id} report={report as Report} />
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
                className="rounded-full px-8 border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
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
                className="rounded-full px-8 border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
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

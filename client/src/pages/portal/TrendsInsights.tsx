import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Download, Bookmark, BookmarkCheck, Filter } from "lucide-react";
import PortalLayout from "./PortalLayout";

const mockReports = [
  {
    id: 1,
    title: "SA Beverage Innovation Trends Q4 2024",
    summary: "Comprehensive analysis of beverage innovation trends in the South African market",
    category: "Beverage",
    date: "2024-11-15",
    downloads: 1240,
    isNew: true,
    isBookmarked: false,
    tags: ["Innovation", "Trends", "FMCG"],
  },
  {
    id: 2,
    title: "Youth Consumer Behaviour Report",
    summary: "Deep dive into Gen-Z and Millennial purchasing patterns and brand preferences",
    category: "Consumer Insights",
    date: "2024-11-10",
    downloads: 2100,
    isNew: true,
    isBookmarked: true,
    tags: ["Youth", "Consumer Behaviour"],
  },
  {
    id: 3,
    title: "Retail Design & Experience Trends",
    summary: "Latest trends in retail space design and customer experience optimization",
    category: "Retail",
    date: "2024-10-28",
    downloads: 856,
    isNew: false,
    isBookmarked: false,
    tags: ["Retail", "Design", "CX"],
  },
  {
    id: 4,
    title: "Sustainability in FMCG Packaging",
    summary: "Market research on consumer attitudes toward sustainable packaging solutions",
    category: "Sustainability",
    date: "2024-10-15",
    downloads: 1450,
    isNew: false,
    isBookmarked: true,
    tags: ["Sustainability", "Packaging"],
  },
  {
    id: 5,
    title: "Digital Transformation in Financial Services",
    summary: "Analysis of fintech adoption and digital banking trends in South Africa",
    category: "Financial Services",
    date: "2024-09-20",
    downloads: 932,
    isNew: false,
    isBookmarked: false,
    tags: ["Fintech", "Banking", "Digital"],
  },
];

export default function TrendsInsights() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [bookmarkedReports, setBookmarkedReports] = useState<number[]>([2, 4]);

  const toggleBookmark = (id: number) => {
    if (bookmarkedReports.includes(id)) {
      setBookmarkedReports(bookmarkedReports.filter((reportId) => reportId !== id));
    } else {
      setBookmarkedReports([...bookmarkedReports, id]);
    }
  };

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === "downloads") return b.downloads - a.downloads;
    return 0;
  });

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">Trends & Insights Library</h1>
          <p className="text-lg text-muted-foreground">
            Access industry intelligence and market reports
          </p>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filter Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search reports by title, topic, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-reports"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Beverage">Beverage</SelectItem>
                    <SelectItem value="Consumer Insights">Consumer Insights</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Sustainability">Sustainability</SelectItem>
                    <SelectItem value="Financial Services">Financial Services</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="downloads">Most Downloaded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {sortedReports.length} of {mockReports.length} reports
            </div>
          </CardContent>
        </Card>

        {/* Personalized Recommendations Row */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p className="text-sm font-medium text-accent">
            Based on your industry, we recommend: Beverage & Consumer Insights reports
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedReports.map((report) => (
            <Card
              key={report.id}
              className="hover-elevate flex flex-col"
              data-testid={`report-card-${report.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary">{report.category}</Badge>
                  <button
                    onClick={() => toggleBookmark(report.id)}
                    className="text-muted-foreground hover:text-accent transition-colors"
                    data-testid={`button-bookmark-${report.id}`}
                  >
                    {bookmarkedReports.includes(report.id) ? (
                      <BookmarkCheck className="w-4 h-4 fill-current" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {report.title}
                  {report.isNew && (
                    <Badge variant="default" className="text-xs">
                      NEW
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{report.summary}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex flex-wrap gap-1 mb-3">
                  {report.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{new Date(report.date).toLocaleDateString()}</span>
                  <span>{report.downloads.toLocaleString()} downloads</span>
                </div>
                <Button className="w-full" data-testid={`button-download-${report.id}`}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}

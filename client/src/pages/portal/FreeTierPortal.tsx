import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Download, 
  Bookmark, 
  TrendingUp, 
  Zap, 
  Crown,
  CheckCircle2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FreeTierPortal() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [bookmarkedReports, setBookmarkedReports] = useState<Set<number>>(new Set());

  const reports = [
    {
      id: 1,
      title: "AI-Driven Consumer Behavior Insights 2024",
      category: "Technology",
      summary: "How artificial intelligence is reshaping purchasing decisions and brand loyalty patterns.",
      publishedDate: "2024-11-15",
      isNew: true,
    },
    {
      id: 2,
      title: "Sustainability in FMCG: The New Standard",
      category: "FMCG",
      summary: "Consumer expectations around eco-friendly packaging and ethical sourcing practices.",
      publishedDate: "2024-11-10",
      isNew: true,
    },
    {
      id: 3,
      title: "Financial Services Digital Transformation",
      category: "Finance",
      summary: "Mobile-first banking trends and the evolution of customer experience in fintech.",
      publishedDate: "2024-10-28",
      isNew: false,
    },
    {
      id: 4,
      title: "Healthcare Innovation: Patient-Centric Care",
      category: "Healthcare",
      summary: "Telemedicine adoption rates and patient expectations in post-pandemic healthcare.",
      publishedDate: "2024-10-20",
      isNew: false,
    },
    {
      id: 5,
      title: "E-Commerce Personalization Strategies",
      category: "Retail",
      summary: "Data-driven personalization techniques driving conversion rates in online retail.",
      publishedDate: "2024-10-12",
      isNew: false,
    },
  ];

  const toggleBookmark = (reportId: number) => {
    const newBookmarks = new Set(bookmarkedReports);
    if (newBookmarks.has(reportId)) {
      newBookmarks.delete(reportId);
    } else {
      newBookmarks.add(reportId);
    }
    setBookmarkedReports(newBookmarks);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const memberBenefits = [
    "Launch unlimited Test24 Basic & Pro studies",
    "Access detailed past research results",
    "Purchase credit packs with up to 55% discount",
    "Priority support and consultation hours",
    "Exclusive member-only deals and offers",
    "Team collaboration features",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground" data-testid="text-page-title">
                Welcome, {user?.name}
              </h1>
              <p className="text-muted-foreground mt-1" data-testid="text-page-subtitle">
                Free tier access to premium trend reports
              </p>
            </div>
            <Badge variant="outline" className="text-sm" data-testid="badge-tier-free">
              FREE TIER
            </Badge>
          </div>
        </div>

        <Card className="mb-8 border-primary/20" data-testid="card-upgrade-banner">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl" data-testid="text-upgrade-title">
                  Unlock Full Member Benefits
                </CardTitle>
                <CardDescription data-testid="text-upgrade-description">
                  Upgrade to Entry, Gold, or Platinum membership for complete access to our research platform
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 mb-6">
              {memberBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm" data-testid={`benefit-item-${index}`}>
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setLocation("/checkout/membership-entry")}
                data-testid="button-upgrade-entry"
              >
                <Zap className="mr-2 h-4 w-4" />
                Upgrade to Entry
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const element = document.getElementById('membership');
                  if (element) {
                    setLocation("/");
                    setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
                  }
                }}
                data-testid="button-view-plans"
              >
                View All Plans
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-trends-library">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-trends-title">
              <TrendingUp className="h-5 w-5 text-primary" />
              Premium Trend Reports
            </CardTitle>
            <CardDescription data-testid="text-trends-description">
              Access our library of industry insights and market research reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-reports"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="FMCG">FMCG</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover-elevate" data-testid={`card-report-${report.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg" data-testid={`text-report-title-${report.id}`}>
                            {report.title}
                          </CardTitle>
                          {report.isNew && (
                            <Badge variant="secondary" className="text-xs" data-testid={`badge-new-${report.id}`}>
                              NEW
                            </Badge>
                          )}
                        </div>
                        <CardDescription data-testid={`text-report-summary-${report.id}`}>
                          {report.summary}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <Badge variant="outline" data-testid={`badge-category-${report.id}`}>
                            {report.category}
                          </Badge>
                          <span data-testid={`text-date-${report.id}`}>
                            {new Date(report.publishedDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleBookmark(report.id)}
                          data-testid={`button-bookmark-${report.id}`}
                        >
                          <Bookmark 
                            className={`h-4 w-4 ${bookmarkedReports.has(report.id) ? 'fill-primary text-primary' : ''}`}
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-download-${report.id}`}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-12" data-testid="text-no-results">
                <p className="text-muted-foreground">No reports found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

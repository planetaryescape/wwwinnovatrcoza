import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FileText, Download, Eye, Grid3x3, List, Lock, RefreshCw, Building2, Calendar, Tag } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

interface ClientReport {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  pdfUrl: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function PastResearch() {
  const { isMember, user, company, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      // Two Rugani projects added and linked by companyId.
      // Access is restricted to Rugani users (by company) and admins.
      const res = await fetch(`/api/member/client-reports?email=${encodeURIComponent(user?.email || '')}`);
      if (!res.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await res.json();
      setReports(data);
    } catch (err) {
      setError("Failed to load your research reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Admin users can see all reports, company users see their company's reports
    // Members without a companyId should see empty state (not stuck loading)
    if (user?.email && (user?.companyId || isAdmin)) {
      fetchReports();
    } else if (user?.email) {
      // User is logged in but doesn't have access (no companyId and not admin)
      setLoading(false);
    }
  }, [user?.companyId, user?.email, isAdmin]);

  const allTags = Array.from(new Set(reports.flatMap(r => r.tags))).sort();

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = filterTag === "all" || report.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDownload = (report: ClientReport) => {
    if (report.pdfUrl) {
      window.open(report.pdfUrl, '_blank');
    }
  };

  const showLockedBanner = !isMember;
  const showNoCompanyBanner = !user?.companyId && isMember && !isAdmin;

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: 'DM Serif Display, serif' }}
            >
              Past Research
            </h1>
            <p className="text-lg text-muted-foreground">
              {company ? (
                <>Access all completed research for <span className="font-medium">{company.name}</span></>
              ) : (
                "Access all your completed studies and insights"
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchReports}
              disabled={loading}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

        {showLockedBanner && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Private Research Dashboard - Members Only</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Securely store and access all your completed Test24 studies with full insights, recommendations, and downloadable reports. This feature is exclusive to Innovatr Members.
                  </p>
                  <Button onClick={() => setLocation("/#membership")} data-testid="button-upgrade-membership">
                    Join as a Member
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showNoCompanyBanner && (
          <Card className="border-accent bg-accent/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Company Not Assigned</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your account is not yet linked to a company. Once assigned, you'll have access to all research reports delivered to your organization.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please contact your administrator or Innovatr support for assistance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isMember && (user?.companyId || isAdmin) && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by title, description, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-reports"
                      />
                    </div>
                  </div>
                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger data-testid="select-tag">
                      <SelectValue placeholder="Filter by tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {allTags.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredReports.length} of {reports.length} reports
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={fetchReports} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Research Reports Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {reports.length === 0 
                      ? "Your company hasn't received any research reports yet. Check back after your next completed study."
                      : "No reports match your current filters."}
                  </p>
                  {reports.length === 0 && (
                    <Button onClick={() => setLocation("/portal/launch-brief")} data-testid="button-launch-brief">
                      Launch New Research
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <Card
                    key={report.id}
                    className="hover-elevate flex flex-col"
                    data-testid={`report-card-${report.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {report.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {report.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{report.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      {report.description && (
                        <CardDescription className="line-clamp-2">
                          {report.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Delivered {formatDate(report.uploadedAt)}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownload(report)}
                          disabled={!report.pdfUrl}
                          data-testid={`button-view-${report.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(report)}
                          disabled={!report.pdfUrl}
                          data-testid={`button-download-${report.id}`}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 hover-elevate flex items-center gap-4"
                        data-testid={`report-row-${report.id}`}
                      >
                        <div className="flex-shrink-0">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold truncate">{report.title}</h3>
                            {report.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {report.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{report.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(report.uploadedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(report)}
                            disabled={!report.pdfUrl}
                            data-testid={`button-view-${report.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(report)}
                            disabled={!report.pdfUrl}
                            data-testid={`button-download-${report.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </PortalLayout>
  );
}

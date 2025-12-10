import { useState, useEffect, useMemo } from "react";
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
import { 
  Search, FileText, Download, Eye, Grid3x3, List, Lock, RefreshCw, 
  Building2, Calendar, Tag, Clock, Play, BarChart3, CheckCircle2,
  Loader2, Timer, ArrowLeft
} from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useSearch } from "wouter";

const formatStudyType = (studyType: string | null): string => {
  if (!studyType) return "";
  const typeMap: Record<string, string> = {
    "test24_basic": "Test24 Basic",
    "test24_pro": "Test24 Pro",
    "basic": "Test24 Basic",
    "pro": "Test24 Pro",
  };
  return typeMap[studyType.toLowerCase()] || studyType;
};

interface ClientReport {
  id: string;
  companyId: string;
  companyName?: string;
  title: string;
  description: string | null;
  studyType: string | null;
  industry: string | null;
  pdfUrl: string | null;
  dashboardUrl: string | null;
  upsiideUrl: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  status: string | null;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Study {
  id: string;
  briefId: string | null;
  companyId: string | null;
  companyName: string;
  title: string;
  description: string | null;
  studyType: "basic" | "pro";
  status: "NEW" | "AUDIENCE_LIVE" | "ANALYSING_DATA" | "COMPLETED";
  statusUpdatedAt: string | null;
  isTest24: boolean;
  tags: string[];
  reportUrl: string | null;
  deliveryDate: string | null;
  submittedByEmail: string;
  submittedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PastResearch() {
  const { user, company, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setTimeNow] = useState(Date.now());
  const [viewingCompany, setViewingCompany] = useState<{ id: string; name: string } | null>(null);

  const viewCompanyId = useMemo(() => {
    if (!searchString || !isAdmin) return null;
    const params = new URLSearchParams(searchString);
    return params.get("companyId");
  }, [searchString, isAdmin]);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (viewCompanyId && isAdmin) {
        try {
          const res = await fetch(`/api/admin/companies/${viewCompanyId}`);
          if (res.ok) {
            const data = await res.json();
            setViewingCompany({ id: viewCompanyId, name: data.name });
          }
        } catch (err) {
          console.error("Failed to fetch company:", err);
        }
      } else {
        setViewingCompany(null);
      }
    };
    fetchCompanyName();
  }, [viewCompanyId, isAdmin]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For admins: use viewCompanyId if provided, otherwise fetch ALL data (no companyId param)
      // For regular users: use their companyId
      let queryParams = `email=${encodeURIComponent(user?.email || '')}`;
      
      if (isAdmin) {
        // Admin viewing specific company OR all companies
        if (viewCompanyId) {
          queryParams += `&companyId=${viewCompanyId}`;
        }
        // If no viewCompanyId, don't add companyId - backend will return ALL data for admin
      } else {
        // Regular users always filter by their company
        if (user?.companyId) {
          queryParams += `&companyId=${user.companyId}`;
        }
      }
      
      const [reportsRes, studiesRes] = await Promise.all([
        fetch(`/api/member/client-reports?${queryParams}`),
        fetch(`/api/member/studies?${queryParams}`)
      ]);
      
      if (!reportsRes.ok) {
        console.error("Failed to fetch reports");
      }
      if (!studiesRes.ok) {
        console.error("Failed to fetch studies");
      }
      
      const [reportsData, studiesData] = await Promise.all([
        reportsRes.ok ? reportsRes.json() : [],
        studiesRes.ok ? studiesRes.json() : []
      ]);
      
      setReports(reportsData);
      setStudies(studiesData);
    } catch (err) {
      setError("Failed to load your research");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email && (user?.companyId || isAdmin || viewCompanyId)) {
      fetchData();
    } else if (user?.email) {
      setLoading(false);
    }
  }, [user?.companyId, user?.email, isAdmin, viewCompanyId]);

  const allTags = Array.from(new Set([
    ...reports.flatMap(r => r.tags),
    ...studies.flatMap(s => s.tags)
  ])).sort();

  const inProgressStudies = studies.filter(s => 
    s.status !== "COMPLETED" &&
    (filterStatus === "all" || s.status === filterStatus) &&
    (searchQuery === "" || 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = filterTag === "all" || report.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // Filter completed studies, excluding those that have a matching client report
  // to avoid showing duplicates (when a study is completed AND a client report is uploaded with the same title)
  const completedStudies = studies.filter(s => {
    if (s.status !== "COMPLETED") return false;
    
    // Check if there's a client report with the same title - if so, skip this study
    const hasMatchingReport = reports.some(r => 
      r.title.toLowerCase() === s.title.toLowerCase()
    );
    if (hasMatchingReport) return false;
    
    // Apply search filter
    return (searchQuery === "" || 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDownload = async (report: ClientReport) => {
    if (!report.pdfUrl) return;
    
    try {
      // Fetch the file from the API
      const response = await fetch(`/api/files/${encodeURIComponent(report.pdfUrl)}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      // Extract filename from path or use report title
      const fileName = report.pdfUrl.split('/').pop() || `${report.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleViewDashboard = (report: ClientReport) => {
    if (report.dashboardUrl) {
      window.open(report.dashboardUrl, '_blank');
    }
  };

  const getStatusBadge = (status: Study["status"]) => {
    switch (status) {
      case "NEW":
        return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30">Submitted</Badge>;
      case "AUDIENCE_LIVE":
        return <Badge className="bg-green-500/15 text-green-600 border-green-500/30">Fieldwork Live</Badge>;
      case "ANALYSING_DATA":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">Analysing</Badge>;
      case "COMPLETED":
        return <Badge className="bg-primary/15 text-primary border-primary/30">Complete</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: Study["status"]) => {
    switch (status) {
      case "NEW":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "AUDIENCE_LIVE":
        return <Play className="w-5 h-5 text-green-500" />;
      case "ANALYSING_DATA":
        return <BarChart3 className="w-5 h-5 text-amber-500" />;
      case "COMPLETED":
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const calculateCountdown = (statusUpdatedAt: string | null) => {
    if (!statusUpdatedAt) return null;
    
    const startTime = new Date(statusUpdatedAt).getTime();
    const now = Date.now();
    const elapsed = now - startTime;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const remaining = twentyFourHours - elapsed;
    
    if (remaining <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    return { hours, minutes, seconds, expired: false };
  };

  const CountdownTimer = ({ statusUpdatedAt }: { statusUpdatedAt: string | null }) => {
    const countdown = calculateCountdown(statusUpdatedAt);
    if (!countdown) return null;
    
    if (countdown.expired) {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <Timer className="w-4 h-4" />
          <span className="text-sm font-medium">Results arriving soon</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-primary">
        <Timer className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-mono font-semibold">
          {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
        </span>
        <span className="text-xs text-muted-foreground">until delivery</span>
      </div>
    );
  };

  // Paid members (STARTER, GROWTH, SCALE) have full access
  const userTier = (user?.membershipTier || "").toUpperCase();
  const paidTiers = ["STARTER", "GROWTH", "SCALE"];
  const isPaidMember = paidTiers.includes(userTier);
  
  const showLockedBanner = !isPaidMember;
  const showNoCompanyBanner = !user?.companyId && isPaidMember && !isAdmin;
  const totalItems = studies.length + reports.length;
  const activeCount = inProgressStudies.length;
  const completedCount = completedStudies.length + filteredReports.length;

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: 'DM Serif Display, serif' }}
            >
              My Research
            </h1>
            <p className="text-lg text-muted-foreground">
              {isAdmin && !viewCompanyId ? (
                "Track all research across all clients - from active studies to completed reports"
              ) : viewingCompany ? (
                <>Track all research for <span className="font-medium">{viewingCompany.name}</span> - from active studies to completed reports</>
              ) : company ? (
                <>Track all research for <span className="font-medium">{company.name}</span> - from active studies to completed reports</>
              ) : (
                "Track your active studies and access completed research reports"
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchData}
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

        {viewingCompany && isAdmin && (
          <Card className="border-violet-500 bg-violet-50 dark:bg-violet-950/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-violet-900 dark:text-violet-100">
                      Viewing: {viewingCompany.name}
                    </p>
                    <p className="text-sm text-violet-600 dark:text-violet-300">
                      You're viewing this company's research as an admin
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/portal/admin?tab=companies")}
                  className="border-violet-500 text-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900"
                  data-testid="button-back-to-admin"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Companies
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showLockedBanner && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">My Research Dashboard - Members Only</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track your active studies in real-time and access completed research with full insights, recommendations, and downloadable reports. This feature is exclusive to Innovatr Members.
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
                    Your account is not yet linked to a company. Once assigned, you'll have access to all research for your organization.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please contact your administrator or Innovatr support for assistance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isPaidMember && (user?.companyId || isAdmin) && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{activeCount}</p>
                      <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Active Studies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{completedCount}</p>
                      <p className="text-sm text-green-600/80 dark:text-green-400/80">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalItems}</p>
                      <p className="text-sm text-purple-600/80 dark:text-purple-400/80">Total Research</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Research</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by title, company, or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-reports"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="NEW">Submitted</SelectItem>
                      <SelectItem value="AUDIENCE_LIVE">Fieldwork Live</SelectItem>
                      <SelectItem value="ANALYSING_DATA">Analysing</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Button onClick={fetchData} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {inProgressStudies.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      Active Studies
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inProgressStudies.map((study) => (
                        <Card 
                          key={study.id}
                          className="border-l-4 border-l-primary hover-elevate"
                          data-testid={`study-card-${study.id}`}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {getStatusIcon(study.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold truncate">{study.title}</h3>
                                  {getStatusBadge(study.status)}
                                  <Badge variant="outline" className="text-xs">
                                    {study.studyType === "pro" ? "Test24 Pro" : "Test24 Basic"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{study.companyName}</p>
                                
                                {study.status === "AUDIENCE_LIVE" && study.isTest24 && (
                                  <CountdownTimer statusUpdatedAt={study.statusUpdatedAt} />
                                )}
                                
                                {study.status === "NEW" && (
                                  <p className="text-sm text-muted-foreground">
                                    Submitted {formatDate(study.createdAt)} - awaiting launch
                                  </p>
                                )}
                                
                                {study.status === "ANALYSING_DATA" && (
                                  <p className="text-sm text-amber-600">
                                    Data analysis in progress - report coming soon
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                  {study.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Completed Research
                    <Badge variant="secondary" className="ml-2">{completedCount}</Badge>
                  </h2>
                  
                  {completedCount === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Completed Research Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          {activeCount > 0 
                            ? "Your active studies will appear here once completed."
                            : "Launch a new research brief to get started."}
                        </p>
                        {activeCount === 0 && (
                          <Button onClick={() => setLocation("/portal/launch")} data-testid="button-launch-brief">
                            Launch New Research
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedStudies.map((study) => (
                        <Card
                          key={`study-${study.id}`}
                          className="hover-elevate flex flex-col"
                          data-testid={`completed-study-card-${study.id}`}
                        >
                          <CardHeader>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {study.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-xs">
                                Complete
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{study.title}</CardTitle>
                            {study.description && (
                              <CardDescription className="line-clamp-2">
                                {study.description}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>Completed {study.deliveryDate ? formatDate(study.deliveryDate) : formatDate(study.updatedAt)}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open('https://app.upsiide.com/', '_blank')}
                                data-testid={`button-view-study-${study.id}`}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => study.reportUrl && window.open(study.reportUrl, '_blank')}
                                disabled={!study.reportUrl}
                                data-testid={`button-download-study-${study.id}`}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filteredReports.map((report) => (
                        <Card
                          key={`report-${report.id}`}
                          className="hover-elevate flex flex-col"
                          data-testid={`report-card-${report.id}`}
                        >
                          <CardHeader>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {report.studyType && (
                                <Badge variant="secondary" className="text-xs">
                                  {formatStudyType(report.studyType)}
                                </Badge>
                              )}
                              {report.industry && (
                                <Badge variant="outline" className="text-xs">
                                  {report.industry}
                                </Badge>
                              )}
                              {report.status?.toLowerCase() === "completed" ? (
                                <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-xs">
                                  Complete
                                </Badge>
                              ) : report.status === "Brief Submitted" ? (
                                <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-xs">
                                  Brief Submitted
                                </Badge>
                              ) : report.status === "Audience Live" ? (
                                <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs">
                                  Audience Live
                                </Badge>
                              ) : report.status === "Building Report" ? (
                                <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 text-xs">
                                  Building Report
                                </Badge>
                              ) : null}
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
                              {isAdmin && report.companyName && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Building2 className="w-3 h-3" />
                                  <span>{report.companyName}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>Delivered {formatDate(report.uploadedAt)}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open(report.upsiideUrl || 'https://app.upsiide.com/', '_blank')}
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
                          {completedStudies.map((study) => (
                            <div
                              key={`study-${study.id}`}
                              className="p-4 hover-elevate flex items-center gap-4"
                              data-testid={`completed-study-row-${study.id}`}
                            >
                              <div className="flex-shrink-0">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold truncate">{study.title}</h3>
                                  {study.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                {study.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">{study.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {study.deliveryDate ? formatDate(study.deliveryDate) : formatDate(study.updatedAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open('https://app.upsiide.com/', '_blank')}
                                  data-testid={`button-view-study-${study.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => study.reportUrl && window.open(study.reportUrl, '_blank')}
                                  disabled={!study.reportUrl}
                                  data-testid={`button-download-study-${study.id}`}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {filteredReports.map((report) => (
                            <div
                              key={`report-${report.id}`}
                              className="p-4 hover-elevate flex items-center gap-4"
                              data-testid={`report-row-${report.id}`}
                            >
                              <div className="flex-shrink-0">
                                {report.status?.toLowerCase() === "completed" ? (
                                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                                ) : (
                                  <FileText className="w-8 h-8 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold truncate">{report.title}</h3>
                                  {report.studyType && (
                                    <Badge variant="secondary" className="text-xs">
                                      {report.studyType}
                                    </Badge>
                                  )}
                                  {report.industry && (
                                    <Badge variant="outline" className="text-xs">
                                      {report.industry}
                                    </Badge>
                                  )}
                                </div>
                                {report.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">{report.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  {isAdmin && report.companyName && (
                                    <span className="flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      {report.companyName}
                                    </span>
                                  )}
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
                                  onClick={() => window.open(report.upsiideUrl || 'https://app.upsiide.com/', '_blank')}
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
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PortalLayout>
  );
}

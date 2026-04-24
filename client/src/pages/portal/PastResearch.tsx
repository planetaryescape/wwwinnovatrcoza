import { useState, useEffect, useMemo, useRef } from "react";
import { logActivity } from "@/lib/activityLogger";
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
  Loader2, Timer, ArrowLeft, Edit, Save, Trash2, Upload
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import PortalLayout from "./PortalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useSearch } from "wouter";

import test24BasicImage from "@assets/Test24_Basic_1765398265879.png";
import test24ProImage from "@assets/Test24_Pro_1765398265879.png";
import consultImage from "@assets/Consult_1765398265878.png";

const getStudyTypeImage = (studyType: string | null): string | null => {
  if (!studyType) return null;
  const type = studyType.toLowerCase();
  if (type.includes("basic") || type === "test24_basic") return test24BasicImage;
  if (type.includes("pro") || type === "test24_pro") return test24ProImage;
  if (type.includes("consult")) return consultImage;
  return null;
};

const formatStudyType = (studyType: string | null): string => {
  if (!studyType) return "";
  const lower = studyType.toLowerCase();
  if (lower.includes("pro")) return "Test24 Pro";
  if (lower.includes("basic")) return "Test24 Basic";
  return studyType;
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
  // Structured data fields
  topIdeaLabel: string | null;
  topIdeaIdeaScore: number | null;
  topIdeaInterest: number | null;
  topIdeaCommitment: number | null;
  lowestIdeaLabel: string | null;
  lowestIdeaIdeaScore: number | null;
  lowestIdeaInterest: number | null;
  lowestIdeaCommitment: number | null;
  verbatim1: string | null;
  verbatim2: string | null;
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
  clientReportId: string | null;
  submittedByEmail: string;
  submittedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PastResearch() {
  const { user, company, isAdmin, hasPaidSeatAccess } = useAuth();
  const { toast } = useToast();
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
  
  // Edit study state (for live/in-progress Test24 studies)
  const [editStudyOpen, setEditStudyOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState<Study | null>(null);
  const [savingStudy, setSavingStudy] = useState(false);
  const [studyStatusForm, setStudyStatusForm] = useState({
    status: "" as Study["status"] | "",
    reportUrl: "",
    sendNotification: true,
  });

  // Edit report state
  const [editReportOpen, setEditReportOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ClientReport | null>(null);
  const [savingReport, setSavingReport] = useState(false);
  const [deleteReportOpen, setDeleteReportOpen] = useState(false);
  const [deletingReport, setDeletingReport] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    studyType: "",
    industry: "",
    status: "",
    upsiideUrl: "",
    topIdeaLabel: "",
    topIdeaIdeaScore: "",
    topIdeaInterest: "",
    topIdeaCommitment: "",
    lowestIdeaLabel: "",
    lowestIdeaIdeaScore: "",
    lowestIdeaInterest: "",
    lowestIdeaCommitment: "",
    verbatim1: "",
    verbatim2: "",
  });

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
      
      const [reportsRes, studiesRes] = await Promise.all([
        fetch("/api/member/client-reports"),
        fetch("/api/member/studies")
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

  // Separate reports into active (in-progress) and completed
  const activeReportStatuses = ["Brief Submitted", "Audience Live", "Building Report"];
  const activeReports = filteredReports.filter(r => 
    activeReportStatuses.includes(r.status || "")
  );
  const completedReports = filteredReports.filter(r => 
    r.status?.toLowerCase() === "completed" || !activeReportStatuses.includes(r.status || "")
  );

  // Filter completed studies, excluding those that have a matching client report
  // to avoid showing duplicates (when a study is completed AND a client report is uploaded with the same title)
  const completedStudies = studies.filter(s => {
    if (s.status !== "COMPLETED") return false;
    
    // If the study is directly linked to a client report, hide it (report card will show)
    if (s.clientReportId) return false;
    
    // Also check if there's a client report with the same title (trim to avoid trailing-space mismatches)
    const hasMatchingReport = reports.some(r => 
      r.title.trim().toLowerCase() === s.title.trim().toLowerCase()
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
    logActivity("download_client_report", { entityType: "client_report", entityId: report.id, entityName: report.title });
    
    try {
      // Normalize the pdfUrl - strip /api/files/ prefix if present to avoid double-prefixing
      let storagePath = report.pdfUrl;
      if (storagePath.startsWith('/api/files/')) {
        storagePath = storagePath.replace('/api/files/', '');
      }
      
      // Encode each path segment individually to preserve slashes
      const encodedPath = storagePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
      
      // Generate filename from report title with proper extension
      const ext = storagePath.split('.').pop() || 'pdf';
      const fileName = `${report.title.replace(/[^a-zA-Z0-9\s.-]/g, '').trim()}.${ext}`;
      const downloadParam = encodeURIComponent(fileName);
      
      // Fetch the file from the API with download parameter for proper filename
      const response = await fetch(`/api/files/${encodedPath}?download=${downloadParam}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download with report title as filename
      const a = document.createElement('a');
      a.href = url;
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

  const handleEditReport = (report: ClientReport) => {
    setEditingReport(report);
    setPdfFile(null); // Clear any previously selected file
    setEditForm({
      title: report.title || "",
      description: report.description || "",
      studyType: report.studyType || "",
      industry: report.industry || "",
      status: report.status || "",
      upsiideUrl: report.upsiideUrl || "",
      topIdeaLabel: report.topIdeaLabel || "",
      topIdeaIdeaScore: report.topIdeaIdeaScore?.toString() || "",
      topIdeaInterest: report.topIdeaInterest?.toString() || "",
      topIdeaCommitment: report.topIdeaCommitment?.toString() || "",
      lowestIdeaLabel: report.lowestIdeaLabel || "",
      lowestIdeaIdeaScore: report.lowestIdeaIdeaScore?.toString() || "",
      lowestIdeaInterest: report.lowestIdeaInterest?.toString() || "",
      lowestIdeaCommitment: report.lowestIdeaCommitment?.toString() || "",
      verbatim1: report.verbatim1 || "",
      verbatim2: report.verbatim2 || "",
    });
    setEditReportOpen(true);
  };

  const handleSaveReport = async () => {
    if (!editingReport) return;
    setSavingReport(true);
    try {
      // First, upload PDF if a new file was selected
      if (pdfFile) {
        setUploadingPdf(true);
        const formData = new FormData();
        formData.append("pdf", pdfFile);
        
        const uploadRes = await fetch(`/api/admin/client-reports/${editingReport.id}/pdf`, {
          method: "POST",
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error("Failed to upload PDF file");
        }
        setUploadingPdf(false);
      }
      
      // Then update the report metadata
      const response = await fetch(`/api/admin/client-reports/${editingReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description || null,
          studyType: editForm.studyType || null,
          industry: editForm.industry || null,
          status: editForm.status || null,
          upsiideUrl: editForm.upsiideUrl || null,
          topIdeaLabel: editForm.topIdeaLabel || null,
          topIdeaIdeaScore: editForm.topIdeaIdeaScore ? parseInt(editForm.topIdeaIdeaScore) : null,
          topIdeaInterest: editForm.topIdeaInterest ? parseInt(editForm.topIdeaInterest) : null,
          topIdeaCommitment: editForm.topIdeaCommitment ? parseInt(editForm.topIdeaCommitment) : null,
          lowestIdeaLabel: editForm.lowestIdeaLabel || null,
          lowestIdeaIdeaScore: editForm.lowestIdeaIdeaScore ? parseInt(editForm.lowestIdeaIdeaScore) : null,
          lowestIdeaInterest: editForm.lowestIdeaInterest ? parseInt(editForm.lowestIdeaInterest) : null,
          lowestIdeaCommitment: editForm.lowestIdeaCommitment ? parseInt(editForm.lowestIdeaCommitment) : null,
          verbatim1: editForm.verbatim1 || null,
          verbatim2: editForm.verbatim2 || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to update report");
      toast({ title: "Report updated", description: pdfFile ? "Report and PDF saved successfully" : "Changes saved successfully" });
      setPdfFile(null);
      setEditReportOpen(false);
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
    } finally {
      setSavingReport(false);
      setUploadingPdf(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!editingReport) return;
    setDeletingReport(true);
    try {
      const response = await fetch(`/api/admin/client-reports/${editingReport.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete report");
      toast({ title: "Report deleted", description: "The report has been permanently removed" });
      setDeleteReportOpen(false);
      setEditReportOpen(false);
      setEditingReport(null);
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete report", variant: "destructive" });
    } finally {
      setDeletingReport(false);
    }
  };

  const handleEditStudy = (study: Study) => {
    setEditingStudy(study);
    setStudyStatusForm({
      status: study.status,
      reportUrl: study.reportUrl || "",
      sendNotification: true,
    });
    setEditStudyOpen(true);
  };

  const handleSaveStudy = async () => {
    if (!editingStudy || !studyStatusForm.status) return;
    setSavingStudy(true);
    try {
      const body: Record<string, unknown> = {
        status: studyStatusForm.status,
        sendNotification: studyStatusForm.sendNotification,
      };
      if (studyStatusForm.status === "COMPLETED" && studyStatusForm.reportUrl) {
        body.reportUrl = studyStatusForm.reportUrl;
      }
      const response = await fetch(`/api/admin/studies/${editingStudy.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Failed to update study status");
      toast({ title: "Study updated", description: `Status changed to ${studyStatusForm.status === "COMPLETED" ? "Completed" : studyStatusForm.status === "ANALYSING_DATA" ? "Analysing Data" : studyStatusForm.status === "AUDIENCE_LIVE" ? "Audience Live" : "New"}` });
      setEditStudyOpen(false);
      setEditingStudy(null);
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to update study status", variant: "destructive" });
    } finally {
      setSavingStudy(false);
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

  // Use centralized paid seat access check for premium content
  const isPaidMember = hasPaidSeatAccess;
  
  // Active = in-progress studies + reports with active statuses (Brief Submitted, Audience Live, Building Report)
  const activeCount = inProgressStudies.length + activeReports.length;
  // Completed = completed studies + completed reports
  const completedCount = completedStudies.length + completedReports.length;
  // Total = all active + all completed
  const totalItems = activeCount + completedCount;
  
  // Free users can also view their own research (one-time purchases)
  const showNoCompanyBanner = !user?.companyId && isPaidMember && !isAdmin;
  
  // Check if user has any research at all
  const hasAnyResearch = totalItems > 0 || reports.length > 0 || studies.length > 0;

  useEffect(() => {
    logActivity("view_past_research");
  }, []);

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

        {/* Empty state for free users with no research */}
        {!isPaidMember && !isAdmin && !loading && !hasAnyResearch && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">You currently have no research with us</h3>
              <p className="text-muted-foreground mb-6">
                Launch your first research brief to get started with consumer testing.
              </p>
              <Button onClick={() => setLocation("/portal/launch")} data-testid="button-launch-first-brief">
                Launch First Brief
              </Button>
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

        {/* Show research content for paid members OR free users with research */}
        {((isPaidMember && (user?.companyId || isAdmin)) || (!isPaidMember && hasAnyResearch)) && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/30 dark:to-slate-900/20 border-slate-200 dark:border-slate-800">
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Study Benchmarks</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Idea</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">75%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Interest</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">81%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Commitment</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">53%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3 h-full flex items-center justify-center">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                      <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{activeCount}</p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80">Active Studies</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-3 h-full flex items-center justify-center">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{completedCount}</p>
                    <p className="text-xs text-green-600/80 dark:text-green-400/80">Completed</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-3 h-full flex items-center justify-center">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalItems}</p>
                    <p className="text-xs text-purple-600/80 dark:text-purple-400/80">Total Research</p>
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
                {activeCount > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      Active Studies
                      <Badge variant="secondary" className="ml-2">{activeCount}</Badge>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inProgressStudies.map((study) => (
                        <Card 
                          key={study.id}
                          className="border-primary/20 bg-primary/5 hover-elevate"
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
                              {isAdmin && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditStudy(study);
                                  }}
                                  data-testid={`button-edit-study-${study.id}`}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {activeReports.map((report) => (
                        <Card 
                          key={`active-report-${report.id}`}
                          className="border-primary/20 bg-primary/5 hover-elevate"
                          data-testid={`active-report-card-${report.id}`}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {report.status === "Brief Submitted" ? (
                                  <FileText className="w-5 h-5 text-blue-600" />
                                ) : report.status === "Audience Live" ? (
                                  <Play className="w-5 h-5 text-amber-600" />
                                ) : (
                                  <Loader2 className="w-5 h-5 text-purple-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold truncate">{report.title}</h3>
                                  {report.status === "Brief Submitted" && (
                                    <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-xs">
                                      Brief Submitted
                                    </Badge>
                                  )}
                                  {report.status === "Audience Live" && (
                                    <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs">
                                      Audience Live
                                    </Badge>
                                  )}
                                  {report.status === "Building Report" && (
                                    <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 text-xs">
                                      Building Report
                                    </Badge>
                                  )}
                                  {report.studyType && (
                                    <Badge variant="outline" className="text-xs">
                                      {formatStudyType(report.studyType)}
                                    </Badge>
                                  )}
                                </div>
                                {isAdmin && report.companyName && (
                                  <p className="text-sm text-muted-foreground mb-2">{report.companyName}</p>
                                )}
                                
                                {report.status === "Brief Submitted" && (
                                  <p className="text-sm text-muted-foreground">
                                    Submitted {formatDate(report.uploadedAt)} - awaiting launch
                                  </p>
                                )}
                                
                                {report.status === "Audience Live" && (
                                  <p className="text-sm text-amber-600">
                                    Fieldwork in progress
                                  </p>
                                )}
                                
                                {report.status === "Building Report" && (
                                  <p className="text-sm text-purple-600">
                                    Data analysis in progress - report coming soon
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                  {report.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              {isAdmin && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditReport(report);
                                  }}
                                  data-testid={`button-edit-active-report-${report.id}`}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              )}
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
                              {hasPaidSeatAccess ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    logActivity("view_client_report", { entityType: "client_report", entityId: study.id, entityName: study.title });
                                    window.open('https://app.upsiide.com/', '_blank');
                                  }}
                                  data-testid={`button-view-study-${study.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Dashboard
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  disabled
                                  className="opacity-50"
                                  data-testid={`button-view-study-${study.id}`}
                                >
                                  <Lock className="w-4 h-4 mr-1" />
                                  Paid Seats Only
                                </Button>
                              )}
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
                      {completedReports.map((report) => {
                        const headerImage = getStudyTypeImage(report.studyType);
                        return (
                        <Card
                          key={`report-${report.id}`}
                          className="hover-elevate flex flex-col overflow-hidden"
                          data-testid={`report-card-${report.id}`}
                        >
                          {headerImage && (
                            <div className="relative h-24 w-full overflow-hidden">
                              <img 
                                src={headerImage} 
                                alt={formatStudyType(report.studyType)} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                          )}
                          <CardHeader className={headerImage ? "pt-3" : ""}>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
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
                              {isAdmin && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditReport(report);
                                  }}
                                  data-testid={`button-edit-report-${report.id}`}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            {/* Show description only if no structured summary data */}
                            {!report.topIdeaLabel && !report.lowestIdeaLabel && !report.verbatim1 && !report.verbatim2 && report.description && (
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

                              {/* Key Insights Section - Structured Summary */}
                              {report.topIdeaLabel && (
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="text-xs font-medium text-green-700 dark:text-green-400">Top Performer</div>
                                    {report.topIdeaIdeaScore !== null && (
                                      <div className="text-lg font-bold text-green-700 dark:text-green-400">
                                        {report.topIdeaIdeaScore}%
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm font-medium">{report.topIdeaLabel}</div>
                                  {(report.topIdeaInterest !== null || report.topIdeaCommitment !== null) && (
                                    <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                                      {report.topIdeaInterest !== null && <span>Interest: {report.topIdeaInterest}%</span>}
                                      {report.topIdeaCommitment !== null && <span>Commitment: {report.topIdeaCommitment}%</span>}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {report.lowestIdeaLabel && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-md p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="text-xs font-medium text-amber-700 dark:text-amber-400">Lowest Performer</div>
                                    {report.lowestIdeaIdeaScore !== null && (
                                      <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                                        {report.lowestIdeaIdeaScore}%
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm font-medium">{report.lowestIdeaLabel}</div>
                                  {(report.lowestIdeaInterest !== null || report.lowestIdeaCommitment !== null) && (
                                    <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                                      {report.lowestIdeaInterest !== null && <span>Interest: {report.lowestIdeaInterest}%</span>}
                                      {report.lowestIdeaCommitment !== null && <span>Commitment: {report.lowestIdeaCommitment}%</span>}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Consumer Verbatims */}
                              {(report.verbatim1 || report.verbatim2) && (
                                <div className="space-y-2">
                                  <div className="text-xs font-medium text-muted-foreground">Consumer Voice</div>
                                  {report.verbatim1 && (
                                    <div className="text-xs italic text-muted-foreground bg-muted/50 rounded p-2 line-clamp-3">
                                      "{report.verbatim1}"
                                    </div>
                                  )}
                                  {report.verbatim2 && (
                                    <div className="text-xs italic text-muted-foreground bg-muted/50 rounded p-2 line-clamp-3">
                                      "{report.verbatim2}"
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                              {hasPaidSeatAccess ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    logActivity("view_client_report", { entityType: "client_report", entityId: report.id, entityName: report.title });
                                    window.open(report.upsiideUrl || 'https://app.upsiide.com/', '_blank');
                                  }}
                                  data-testid={`button-view-${report.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Dashboard
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  disabled
                                  className="opacity-50"
                                  data-testid={`button-view-${report.id}`}
                                >
                                  <Lock className="w-4 h-4 mr-1" />
                                  Paid Seats Only
                                </Button>
                              )}
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
                      );
                      })}
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
                                {hasPaidSeatAccess ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      logActivity("view_client_report", { entityType: "client_report", entityId: study.id, entityName: study.title });
                                      window.open('https://app.upsiide.com/', '_blank');
                                    }}
                                    data-testid={`button-view-study-${study.id}`}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled
                                    className="opacity-50"
                                    data-testid={`button-view-study-${study.id}`}
                                  >
                                    <Lock className="w-4 h-4 mr-1" />
                                    Paid Only
                                  </Button>
                                )}
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
                          {completedReports.map((report) => (
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
                                      {formatStudyType(report.studyType)}
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
                                {isAdmin && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEditReport(report)}
                                    data-testid={`button-edit-report-list-${report.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                )}
                                {hasPaidSeatAccess ? (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      logActivity("view_client_report", { entityType: "client_report", entityId: report.id, entityName: report.title });
                                      window.open(report.upsiideUrl || 'https://app.upsiide.com/', '_blank');
                                    }}
                                    data-testid={`button-view-${report.id}`}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled
                                    className="opacity-50"
                                    data-testid={`button-view-${report.id}`}
                                  >
                                    <Lock className="w-4 h-4 mr-1" />
                                    Paid Only
                                  </Button>
                                )}
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

      {/* Edit Report Dialog */}
      <Dialog open={editReportOpen} onOpenChange={setEditReportOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <DialogTitle>Edit Report</DialogTitle>
              <DialogDescription>Update the report information visible to clients</DialogDescription>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteReportOpen(true)}
              data-testid="button-delete-report-dialog"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                data-testid="input-edit-title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={2}
                data-testid="input-edit-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-studyType">Study Type</Label>
                <Select
                  value={editForm.studyType}
                  onValueChange={(val) => setEditForm({ ...editForm, studyType: val })}
                >
                  <SelectTrigger data-testid="select-edit-studyType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test24_basic">Test24 Basic</SelectItem>
                    <SelectItem value="test24_pro">Test24 Pro</SelectItem>
                    <SelectItem value="consult">Consult</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                >
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Brief Submitted">Brief Submitted</SelectItem>
                    <SelectItem value="Audience Live">Audience Live</SelectItem>
                    <SelectItem value="Building Report">Building Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-industry">Industry</Label>
              <Input
                id="edit-industry"
                value={editForm.industry}
                onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                data-testid="input-edit-industry"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-upsiideUrl">Upsiide URL</Label>
              <Input
                id="edit-upsiideUrl"
                value={editForm.upsiideUrl}
                onChange={(e) => setEditForm({ ...editForm, upsiideUrl: e.target.value })}
                placeholder="https://app.upsiide.com/..."
                data-testid="input-edit-upsiideUrl"
              />
            </div>

            <div className="border-t pt-4 mt-2">
              <Label className="mb-2 block">Report PDF</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  data-testid="input-edit-pdf"
                />
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-medium text-sm">{pdfFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ) : editingReport?.pdfUrl ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm">Current PDF attached. Click to replace.</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <Upload className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-sm">Click to upload PDF</p>
                    <p className="text-xs">Maximum file size: 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3">Top Performer</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="edit-topIdeaLabel">Idea Label</Label>
                  <Input
                    id="edit-topIdeaLabel"
                    value={editForm.topIdeaLabel}
                    onChange={(e) => setEditForm({ ...editForm, topIdeaLabel: e.target.value })}
                    data-testid="input-edit-topIdeaLabel"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-topIdeaIdeaScore">Idea Score (%)</Label>
                  <Input
                    id="edit-topIdeaIdeaScore"
                    type="number"
                    value={editForm.topIdeaIdeaScore}
                    onChange={(e) => setEditForm({ ...editForm, topIdeaIdeaScore: e.target.value })}
                    data-testid="input-edit-topIdeaIdeaScore"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-topIdeaInterest">Interest (%)</Label>
                  <Input
                    id="edit-topIdeaInterest"
                    type="number"
                    value={editForm.topIdeaInterest}
                    onChange={(e) => setEditForm({ ...editForm, topIdeaInterest: e.target.value })}
                    data-testid="input-edit-topIdeaInterest"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-topIdeaCommitment">Commitment (%)</Label>
                  <Input
                    id="edit-topIdeaCommitment"
                    type="number"
                    value={editForm.topIdeaCommitment}
                    onChange={(e) => setEditForm({ ...editForm, topIdeaCommitment: e.target.value })}
                    data-testid="input-edit-topIdeaCommitment"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3">Lowest Performer</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2 col-span-2">
                  <Label htmlFor="edit-lowestIdeaLabel">Idea Label</Label>
                  <Input
                    id="edit-lowestIdeaLabel"
                    value={editForm.lowestIdeaLabel}
                    onChange={(e) => setEditForm({ ...editForm, lowestIdeaLabel: e.target.value })}
                    data-testid="input-edit-lowestIdeaLabel"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lowestIdeaIdeaScore">Idea Score (%)</Label>
                  <Input
                    id="edit-lowestIdeaIdeaScore"
                    type="number"
                    value={editForm.lowestIdeaIdeaScore}
                    onChange={(e) => setEditForm({ ...editForm, lowestIdeaIdeaScore: e.target.value })}
                    data-testid="input-edit-lowestIdeaIdeaScore"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lowestIdeaInterest">Interest (%)</Label>
                  <Input
                    id="edit-lowestIdeaInterest"
                    type="number"
                    value={editForm.lowestIdeaInterest}
                    onChange={(e) => setEditForm({ ...editForm, lowestIdeaInterest: e.target.value })}
                    data-testid="input-edit-lowestIdeaInterest"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-lowestIdeaCommitment">Commitment (%)</Label>
                  <Input
                    id="edit-lowestIdeaCommitment"
                    type="number"
                    value={editForm.lowestIdeaCommitment}
                    onChange={(e) => setEditForm({ ...editForm, lowestIdeaCommitment: e.target.value })}
                    data-testid="input-edit-lowestIdeaCommitment"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3">Consumer Verbatims</h4>
              <p className="text-xs text-muted-foreground mb-3">Card view shows approximately 120-150 characters (3 lines)</p>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-verbatim1">Verbatim 1</Label>
                    <span className={`text-xs ${editForm.verbatim1.length > 150 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {editForm.verbatim1.length} characters
                    </span>
                  </div>
                  <Textarea
                    id="edit-verbatim1"
                    value={editForm.verbatim1}
                    onChange={(e) => setEditForm({ ...editForm, verbatim1: e.target.value })}
                    rows={2}
                    data-testid="input-edit-verbatim1"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-verbatim2">Verbatim 2</Label>
                    <span className={`text-xs ${editForm.verbatim2.length > 150 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      {editForm.verbatim2.length} characters
                    </span>
                  </div>
                  <Textarea
                    id="edit-verbatim2"
                    value={editForm.verbatim2}
                    onChange={(e) => setEditForm({ ...editForm, verbatim2: e.target.value })}
                    rows={2}
                    data-testid="input-edit-verbatim2"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditReportOpen(false)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button onClick={handleSaveReport} disabled={savingReport || uploadingPdf} data-testid="button-save-edit">
              {(savingReport || uploadingPdf) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {uploadingPdf ? "Uploading PDF..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Report Confirmation */}
      <AlertDialog open={deleteReportOpen} onOpenChange={setDeleteReportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{editingReport?.title}"? This will permanently remove the report and any associated files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingReport}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingReport}
            >
              {deletingReport ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Report"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Study Status Dialog (admin only) */}
      <Dialog open={editStudyOpen} onOpenChange={setEditStudyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Study Status</DialogTitle>
            <DialogDescription>
              {editingStudy?.title} &mdash; {editingStudy?.companyName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="study-status">Status</Label>
              <Select
                value={studyStatusForm.status}
                onValueChange={(val) =>
                  setStudyStatusForm({ ...studyStatusForm, status: val as Study["status"] })
                }
              >
                <SelectTrigger id="study-status" data-testid="select-study-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Submitted — awaiting launch</SelectItem>
                  <SelectItem value="AUDIENCE_LIVE">Fieldwork Live — audience active</SelectItem>
                  <SelectItem value="ANALYSING_DATA">Analysing Data — fieldwork closed</SelectItem>
                  <SelectItem value="COMPLETED">Completed — results ready</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {studyStatusForm.status === "COMPLETED" && (
              <div className="grid gap-2">
                <Label htmlFor="study-reportUrl">Report URL (optional)</Label>
                <Input
                  id="study-reportUrl"
                  placeholder="https://..."
                  value={studyStatusForm.reportUrl}
                  onChange={(e) =>
                    setStudyStatusForm({ ...studyStatusForm, reportUrl: e.target.value })
                  }
                  data-testid="input-study-reportUrl"
                />
                <p className="text-xs text-muted-foreground">
                  Link to the delivered report or Upsiide dashboard for this study.
                </p>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                id="study-notify"
                checked={studyStatusForm.sendNotification}
                onCheckedChange={(checked) =>
                  setStudyStatusForm({ ...studyStatusForm, sendNotification: !!checked })
                }
                data-testid="checkbox-study-notify"
              />
              <div className="grid gap-0.5">
                <Label htmlFor="study-notify" className="cursor-pointer">
                  Send email notification to client
                </Label>
                <p className="text-xs text-muted-foreground">
                  {studyStatusForm.status === "AUDIENCE_LIVE"
                    ? 'Sends a "Your fieldwork is live" notification to the client.'
                    : studyStatusForm.status === "COMPLETED"
                    ? 'Sends a "Your results are ready" notification to the client.'
                    : "An email will be sent to the client about this status change."}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStudyOpen(false)} data-testid="button-cancel-study-edit">
              Cancel
            </Button>
            <Button
              onClick={handleSaveStudy}
              disabled={savingStudy || !studyStatusForm.status}
              data-testid="button-save-study-status"
            >
              {savingStudy ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {studyStatusForm.status === "COMPLETED" ? "Mark as Complete" : "Save Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}

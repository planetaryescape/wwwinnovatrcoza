import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { 
  Search, 
  Plus, 
  RefreshCw, 
  FileText, 
  Building2,
  Calendar,
  Download,
  Upload,
  Trash2,
  ExternalLink,
  Tag,
  Pencil,
  Archive,
  ArchiveRestore
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDigStudies } from "@/lib/dig-api";
import type { DigStudy } from "@/lib/dig-api.types";

interface ClientReport {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  studyType: string | null;
  industry: string | null;
  status: string | null;
  pdfUrl: string | null;
  dashboardUrl: string | null;
  upsiideUrl: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  // Top idea metadata
  topIdeaLabel: string | null;
  topIdeaIdeaScore: number | null;
  topIdeaInterest: number | null;
  topIdeaCommitment: number | null;
  // Lowest idea metadata
  lowestIdeaLabel: string | null;
  lowestIdeaIdeaScore: number | null;
  lowestIdeaInterest: number | null;
  lowestIdeaCommitment: number | null;
  // Consumer verbatims
  verbatim1: string | null;
  verbatim2: string | null;
  isArchived: boolean;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  name: string;
}

const DIG_ETL_INGEST_URL = import.meta.env.VITE_DIG_ETL_INGEST_URL || "https://innovatr-dig-etl.vercel.app";

export default function AdminClientReports() {
  const { toast } = useToast();
  const { data: digStudiesData } = useDigStudies(true);
  const digStudies = digStudiesData?.studies ?? [];
  const digStudyByReportId = new Map<string, DigStudy>();
  for (const s of digStudies) {
    if (s.public_client_report_id) {
      digStudyByReportId.set(s.public_client_report_id, s);
    }
  }
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredReports, setFilteredReports] = useState<ClientReport[]>([]);
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ClientReport | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ClientReport | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    companyId: "",
    studyType: "Test24 Basic",
    industry: "",
    status: "Completed",
    tags: "",
    dashboardUrl: "",
    upsiideUrl: "",
    // Top idea fields
    topIdeaLabel: "",
    topIdeaIdeaScore: "",
    topIdeaInterest: "",
    topIdeaCommitment: "",
    // Lowest idea fields
    lowestIdeaLabel: "",
    lowestIdeaIdeaScore: "",
    lowestIdeaInterest: "",
    lowestIdeaCommitment: "",
    // Verbatims
    verbatim1: "",
    verbatim2: "",
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, companiesRes] = await Promise.all([
        fetch("/api/admin/client-reports"),
        fetch("/api/admin/companies"),
      ]);

      if (!reportsRes.ok || !companiesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const reportsData = await reportsRes.json();
      const companiesData = await companiesRes.json();
      
      setReports(reportsData);
      setCompanies(companiesData);
      setError(null);
    } catch (err) {
      setError("Failed to load data");
      toast({
        title: "Error",
        description: "Failed to load client reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...reports];
    
    // By default hide archived unless showArchived is true
    filtered = filtered.filter(r => showArchived ? r.isArchived : !r.isArchived);

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchLower) ||
          r.description?.toLowerCase().includes(searchLower) ||
          r.tags.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    if (companyFilter !== "all") {
      filtered = filtered.filter((r) => r.companyId === companyFilter);
    }
    
    filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    
    setFilteredReports(filtered);
  }, [reports, search, companyFilter, showArchived]);

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || "Unknown Company";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const openNewReportDialog = () => {
    setEditingReport(null);
    setFormData({
      title: "",
      description: "",
      companyId: "",
      studyType: "Test24 Basic",
      industry: "",
      status: "Completed",
      tags: "",
      dashboardUrl: "",
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
    setPdfFile(null);
    setDialogOpen(true);
  };

  const openEditReportDialog = (report: ClientReport) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      description: report.description || "",
      companyId: report.companyId,
      studyType: report.studyType || "Test24 Basic",
      industry: report.industry || "",
      status: report.status || "Completed",
      tags: report.tags.join(", "),
      dashboardUrl: report.dashboardUrl || "",
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
    setPdfFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.companyId) {
      toast({
        title: "Validation Error",
        description: "Title and company are required",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let pdfUrl = editingReport?.pdfUrl || null;
      
      if (pdfFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", pdfFile);
        uploadFormData.append("companyId", formData.companyId);
        
        const uploadRes = await fetch("/api/upload/client-report", {
          method: "POST",
          body: uploadFormData,
        });
        
        if (!uploadRes.ok) throw new Error("Failed to upload PDF");
        const uploadData = await uploadRes.json();
        pdfUrl = uploadData.url;
      }

      const tags = formData.tags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const reportData = {
        title: formData.title,
        description: formData.description || null,
        companyId: formData.companyId,
        studyType: formData.studyType || "Test24 Basic",
        industry: formData.industry || null,
        status: formData.status || "Completed",
        pdfUrl,
        dashboardUrl: formData.dashboardUrl || null,
        upsiideUrl: formData.upsiideUrl || null,
        tags,
        // Top idea data
        topIdeaLabel: formData.topIdeaLabel || null,
        topIdeaIdeaScore: formData.topIdeaIdeaScore ? parseInt(formData.topIdeaIdeaScore) : null,
        topIdeaInterest: formData.topIdeaInterest ? parseInt(formData.topIdeaInterest) : null,
        topIdeaCommitment: formData.topIdeaCommitment ? parseInt(formData.topIdeaCommitment) : null,
        // Lowest idea data
        lowestIdeaLabel: formData.lowestIdeaLabel || null,
        lowestIdeaIdeaScore: formData.lowestIdeaIdeaScore ? parseInt(formData.lowestIdeaIdeaScore) : null,
        lowestIdeaInterest: formData.lowestIdeaInterest ? parseInt(formData.lowestIdeaInterest) : null,
        lowestIdeaCommitment: formData.lowestIdeaCommitment ? parseInt(formData.lowestIdeaCommitment) : null,
        // Verbatims
        verbatim1: formData.verbatim1 || null,
        verbatim2: formData.verbatim2 || null,
      };

      let res;
      if (editingReport) {
        res = await fetch(`/api/admin/client-reports/${editingReport.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportData),
        });
      } else {
        res = await fetch("/api/admin/client-reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportData),
        });
      }

      if (!res.ok) throw new Error("Failed to save report");

      toast({
        title: "Success",
        description: editingReport ? "Report updated" : "Report created",
      });
      
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      const res = await fetch(`/api/admin/client-reports/${reportToDelete.id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error("Failed to delete report");
      
      setReports(reports.filter(r => r.id !== reportToDelete.id));
      setDeleteDialogOpen(false);
      setReportToDelete(null);
      
      toast({
        title: "Report Deleted",
        description: "The report has been removed",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (report: ClientReport) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleArchive = async (report: ClientReport) => {
    try {
      const res = await fetch(`/api/admin/client-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: !report.isArchived }),
      });
      if (!res.ok) throw new Error("Failed to update report");
      const updated = await res.json();
      setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
      toast({
        title: report.isArchived ? "Report Restored" : "Report Archived",
        description: report.isArchived
          ? `"${report.title}" has been restored.`
          : `"${report.title}" has been archived.`,
      });
    } catch {
      toast({ title: "Error", description: "Failed to archive report", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-client-reports">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 
            className="text-2xl font-semibold"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            Client Research Reports
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage research reports delivered to client companies
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            data-testid="button-refresh-reports"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            onClick={openNewReportDialog}
            style={{ backgroundColor: '#0033A0' }}
            className="rounded-full"
            data-testid="button-new-report"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Report
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-reports"
              />
            </div>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-company-filter">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {[...companies].sort((a, b) => a.name.localeCompare(b.name)).map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(v => !v)}
              data-testid="button-toggle-archived"
            >
              <Archive className="w-4 h-4 mr-2" />
              {showArchived ? "Archived" : "Show Archived"}
            </Button>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Dig Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id} data-testid={`row-report-${report.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="font-medium">{report.title}</span>
                            {report.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {report.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{getCompanyName(report.companyId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const dig = digStudyByReportId.get(report.id);
                          if (!dig) return <span className="text-xs text-muted-foreground" data-testid={`text-dig-status-${report.id}`}>—</span>;
                          const st = dig.ingest_status?.toLowerCase();
                          const color = st === "ready" || st === "parsed"
                            ? "text-green-600"
                            : st === "failed" || st === "error"
                            ? "text-red-500"
                            : "text-yellow-600";
                          return (
                            <Badge variant="outline" className={`text-xs ${color}`} data-testid={`badge-dig-status-${report.id}`}>
                              {dig.ingest_status}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {report.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {report.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{report.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(report.uploadedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {report.pdfUrl && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => window.open(report.pdfUrl!, '_blank')}
                              data-testid={`button-download-${report.id}`}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              window.open(`${DIG_ETL_INGEST_URL}/admin/ingest?clientReportId=${report.id}`, "_blank");
                            }}
                            title="Upload CSVs to ETL"
                            data-testid={`button-upload-etl-${report.id}`}
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditReportDialog(report)}
                            data-testid={`button-edit-${report.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArchive(report)}
                            title={report.isArchived ? "Restore report" : "Archive report"}
                            data-testid={`button-archive-${report.id}`}
                          >
                            {report.isArchived
                              ? <ArchiveRestore className="w-4 h-4" />
                              : <Archive className="w-4 h-4" />
                            }
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => confirmDelete(report)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-${report.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReport ? "Edit Report" : "Add New Report"}
            </DialogTitle>
            <DialogDescription>
              {editingReport 
                ? "Update the report details below" 
                : "Upload a new research report for a client company"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Q4 2024 Market Analysis"
                data-testid="input-report-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select 
                value={formData.companyId} 
                onValueChange={(value) => setFormData({ ...formData, companyId: value })}
              >
                <SelectTrigger data-testid="select-report-company">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {[...companies].sort((a, b) => a.name.localeCompare(b.name)).map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the report contents..."
                className="h-20"
                data-testid="textarea-report-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studyType">Study Type</Label>
                <Select 
                  value={formData.studyType} 
                  onValueChange={(value) => setFormData({ ...formData, studyType: value })}
                >
                  <SelectTrigger data-testid="select-study-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Test24 Basic">Test24 Basic</SelectItem>
                    <SelectItem value="Test24 Pro">Test24 Pro</SelectItem>
                    <SelectItem value="Consult">Consult</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brief Submitted">Brief Submitted</SelectItem>
                    <SelectItem value="Audience Live">Audience Live</SelectItem>
                    <SelectItem value="Building Report">Building Report</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry (Optional)</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Beverage, Alcohol, Financial, Snacks..."
                data-testid="input-report-industry"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="market research, consumer insights, Q4 2024"
                data-testid="input-report-tags"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upsiideUrl">Upsiide Link (Optional)</Label>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  id="upsiideUrl"
                  type="url"
                  value={formData.upsiideUrl}
                  onChange={(e) => setFormData({ ...formData, upsiideUrl: e.target.value })}
                  placeholder="https://app.upsiide.com/..."
                  data-testid="input-report-upsiide-url"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Link to view the research on Upsiide
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dashboardUrl">Dashboard Link (Optional)</Label>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  id="dashboardUrl"
                  type="url"
                  value={formData.dashboardUrl}
                  onChange={(e) => setFormData({ ...formData, dashboardUrl: e.target.value })}
                  placeholder="https://example.com/dashboard/..."
                  data-testid="input-report-dashboard-url"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Additional dashboard or report link
              </p>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-sm mb-3">Top Performing Idea</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="topIdeaLabel">Idea Name</Label>
                  <Input
                    id="topIdeaLabel"
                    value={formData.topIdeaLabel}
                    onChange={(e) => setFormData({ ...formData, topIdeaLabel: e.target.value })}
                    placeholder="e.g. Caesar Parmesan Wrap"
                    data-testid="input-top-idea-label"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="topIdeaIdeaScore">Idea Score (%)</Label>
                    <Input
                      id="topIdeaIdeaScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.topIdeaIdeaScore}
                      onChange={(e) => setFormData({ ...formData, topIdeaIdeaScore: e.target.value })}
                      placeholder="0-100"
                      data-testid="input-top-idea-score"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topIdeaInterest">Interest (%)</Label>
                    <Input
                      id="topIdeaInterest"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.topIdeaInterest}
                      onChange={(e) => setFormData({ ...formData, topIdeaInterest: e.target.value })}
                      placeholder="0-100"
                      data-testid="input-top-idea-interest"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topIdeaCommitment">Commitment (%)</Label>
                    <Input
                      id="topIdeaCommitment"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.topIdeaCommitment}
                      onChange={(e) => setFormData({ ...formData, topIdeaCommitment: e.target.value })}
                      placeholder="0-100"
                      data-testid="input-top-idea-commitment"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">Lowest Performing Idea</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="lowestIdeaLabel">Idea Name</Label>
                  <Input
                    id="lowestIdeaLabel"
                    value={formData.lowestIdeaLabel}
                    onChange={(e) => setFormData({ ...formData, lowestIdeaLabel: e.target.value })}
                    placeholder="e.g. Hot Honey Pineapple"
                    data-testid="input-lowest-idea-label"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="lowestIdeaIdeaScore">Idea Score (%)</Label>
                    <Input
                      id="lowestIdeaIdeaScore"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.lowestIdeaIdeaScore}
                      onChange={(e) => setFormData({ ...formData, lowestIdeaIdeaScore: e.target.value })}
                      placeholder="0-100"
                      data-testid="input-lowest-idea-score"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowestIdeaInterest">Interest (%)</Label>
                    <Input
                      id="lowestIdeaInterest"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.lowestIdeaInterest}
                      onChange={(e) => setFormData({ ...formData, lowestIdeaInterest: e.target.value })}
                      placeholder="0-100"
                      data-testid="input-lowest-idea-interest"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowestIdeaCommitment">Commitment (%)</Label>
                    <Input
                      id="lowestIdeaCommitment"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.lowestIdeaCommitment}
                      onChange={(e) => setFormData({ ...formData, lowestIdeaCommitment: e.target.value })}
                      placeholder="0-100"
                      data-testid="input-lowest-idea-commitment"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-3">Consumer Voice</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="verbatim1">Verbatim 1</Label>
                  <Textarea
                    id="verbatim1"
                    value={formData.verbatim1}
                    onChange={(e) => setFormData({ ...formData, verbatim1: e.target.value })}
                    placeholder="Short consumer quote..."
                    className="h-16"
                    data-testid="textarea-verbatim1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verbatim2">Verbatim 2</Label>
                  <Textarea
                    id="verbatim2"
                    value={formData.verbatim2}
                    onChange={(e) => setFormData({ ...formData, verbatim2: e.target.value })}
                    placeholder="Another consumer quote..."
                    className="h-16"
                    data-testid="textarea-verbatim2"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <Label>PDF File</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  data-testid="input-report-pdf"
                />
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-medium">{pdfFile.name}</span>
                  </div>
                ) : editingReport?.pdfUrl ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <FileText className="w-5 h-5" />
                    <span>Current PDF attached. Click to replace.</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p>Click to upload PDF</p>
                    <p className="text-xs">Maximum file size: 50MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploading}
              style={{ backgroundColor: '#0033A0' }}
              data-testid="button-save-report"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingReport ? (
                "Update Report"
              ) : (
                "Add Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{reportToDelete?.title}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-report"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

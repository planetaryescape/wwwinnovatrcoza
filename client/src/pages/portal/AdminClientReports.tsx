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
  Tag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClientReport {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  pdfUrl: string | null;
  dashboardUrl: string | null;
  thumbnailUrl: string | null;
  tags: string[];
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  name: string;
}

export default function AdminClientReports() {
  const { toast } = useToast();
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
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    companyId: "",
    tags: "",
    dashboardUrl: "",
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
  }, [reports, search, companyFilter]);

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
      tags: "",
      dashboardUrl: "",
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
      tags: report.tags.join(", "),
      dashboardUrl: report.dashboardUrl || "",
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
        pdfUrl,
        dashboardUrl: formData.dashboardUrl || null,
        tags,
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
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                            onClick={() => openEditReportDialog(report)}
                            data-testid={`button-edit-${report.id}`}
                          >
                            <FileText className="w-4 h-4" />
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
        <DialogContent className="sm:max-w-lg">
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
                  {companies.map((company) => (
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
              <Label htmlFor="dashboardUrl">Dashboard Link (Optional)</Label>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  id="dashboardUrl"
                  type="url"
                  value={formData.dashboardUrl}
                  onChange={(e) => setFormData({ ...formData, dashboardUrl: e.target.value })}
                  placeholder="https://upsiide.com/dashboard/..."
                  data-testid="input-report-dashboard-url"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Link to the client's research dashboard on your platform
              </p>
            </div>
            
            <div className="space-y-2">
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

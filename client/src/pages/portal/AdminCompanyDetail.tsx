import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Wallet,
  Users,
  Crown,
  TrendingUp,
  User as UserIcon,
  Clock,
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  Minus,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Edit,
  Save,
  RefreshCw,
  Mail,
  Phone,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PortalLayout from "./PortalLayout";
import { safeParseDate } from "@shared/access";

interface Company {
  id: string;
  name: string;
  domain: string | null;
  tier: string;
  contractStart: string | null;
  contractEnd: string | null;
  monthlyFee: string | null;
  basicCreditsTotal: number;
  basicCreditsUsed: number;
  proCreditsTotal: number;
  proCreditsUsed: number;
  notes: string | null;
  logoUrl: string | null;
  dealDetails: string | null;
  studyCount: number;
  createdAt: string;
  updatedAt: string;
}

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
  deliveredAt: string | null;
  primaryContactEmail: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface CompanyUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  membershipTier: string;
  memberType: string | null;
  status: string;
  lastLoginAt: string | null;
}

const tierConfig: Record<string, { label: string; color: string; icon: any }> = {
  FREE: { label: "Free", color: "bg-gray-100 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400", icon: UserIcon },
  STARTER: { label: "Starter", color: "bg-muted text-muted-foreground", icon: UserIcon },
  GROWTH: { label: "Growth", color: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300", icon: TrendingUp },
  SCALE: { label: "Scale", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", icon: Crown },
};

export default function AdminCompanyDetail() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/portal/admin/companies/:companyId");
  
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit states
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  
  // Logo upload
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Add user dialog
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
  });
  
  // Add report dialog
  const [addReportOpen, setAddReportOpen] = useState(false);
  const [addingReport, setAddingReport] = useState(false);
  const [reportPdfFile, setReportPdfFile] = useState<File | null>(null);
  const reportPdfInputRef = useRef<HTMLInputElement>(null);
  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    studyType: "Test24 Basic",
    industry: "",
    status: "Completed",
    deliveredAt: new Date().toISOString().split('T')[0],
    primaryContactEmail: "",
    dashboardUrl: "",
    upsiideUrl: "",
  });
  
  // Delete report dialog
  const [deleteReportOpen, setDeleteReportOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ClientReport | null>(null);
  const [deletingReport, setDeletingReport] = useState(false);
  
  // Delete user dialog
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<CompanyUser | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  
  // Delete company dialog
  const [deleteCompanyOpen, setDeleteCompanyOpen] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(false);

  const companyId = params?.companyId;

  const fetchCompany = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch company");
      const data = await res.json();
      setCompany(data);
      setNotesValue(data.notes || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load company");
    }
  };

  const fetchUsers = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchReports = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/client-reports`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchCompany(), fetchUsers(), fetchReports()]);
    setLoading(false);
  };

  useEffect(() => {
    if (companyId) {
      fetchAllData();
    }
  }, [companyId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const res = await fetch(`/api/admin/companies/${company.id}/logo`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload logo");

      const updated = await res.json();
      setCompany({ ...company, logoUrl: updated.logoUrl });
      
      toast({
        title: "Logo Uploaded",
        description: "Company logo has been updated",
      });
    } catch (err) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload company logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!company) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue }),
      });
      if (!res.ok) throw new Error("Failed to save notes");
      const updated = await res.json();
      setCompany(updated);
      setEditingNotes(false);
      toast({ title: "Notes Saved", description: "Company notes updated successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save notes", variant: "destructive" });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleUpdateCredits = async (type: "basic" | "pro", delta: number) => {
    if (!company) return;
    const field = type === "basic" ? "basicCreditsTotal" : "proCreditsTotal";
    const currentValue = type === "basic" ? company.basicCreditsTotal : company.proCreditsTotal;
    const newValue = Math.max(0, currentValue + delta);
    
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (!res.ok) throw new Error("Failed to update credits");
      const updated = await res.json();
      setCompany(updated);
      toast({ title: "Credits Updated" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update credits", variant: "destructive" });
    }
  };

  const handleAddUser = async () => {
    if (!company || !newUser.email.trim()) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return;
    }
    setAddingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name || null,
          email: newUser.email,
          phone: newUser.phone || null,
          companyId: company.id,
          membershipTier: company.tier,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add user");
      }
      await fetchUsers();
      setAddUserOpen(false);
      setNewUser({ name: "", email: "", phone: "" });
      toast({ title: "User Added", description: "New user has been added to the company" });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to add user", variant: "destructive" });
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      await fetchUsers();
      setDeleteUserOpen(false);
      setUserToDelete(null);
      toast({ title: "User Deleted" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    } finally {
      setDeletingUser(false);
    }
  };

  const handleAddReport = async () => {
    if (!company || !newReport.title.trim()) {
      toast({ title: "Error", description: "Report title is required", variant: "destructive" });
      return;
    }
    setAddingReport(true);
    try {
      const res = await fetch("/api/admin/client-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company.id,
          title: newReport.title,
          description: newReport.description || null,
          studyType: newReport.studyType,
          industry: newReport.industry || null,
          status: newReport.status,
          deliveredAt: newReport.deliveredAt || null,
          primaryContactEmail: newReport.primaryContactEmail || null,
          dashboardUrl: newReport.dashboardUrl || null,
          upsiideUrl: newReport.upsiideUrl || null,
          tags: [],
        }),
      });
      if (!res.ok) throw new Error("Failed to add report");
      
      const createdReport = await res.json();
      
      // Upload PDF if selected
      if (reportPdfFile) {
        const formData = new FormData();
        formData.append("pdf", reportPdfFile);
        await fetch(`/api/admin/client-reports/${createdReport.id}/pdf`, {
          method: "POST",
          body: formData,
        });
      }
      
      await fetchReports();
      setAddReportOpen(false);
      setNewReport({
        title: "",
        description: "",
        studyType: "Test24 Basic",
        industry: "",
        status: "Completed",
        deliveredAt: new Date().toISOString().split('T')[0],
        primaryContactEmail: "",
        dashboardUrl: "",
        upsiideUrl: "",
      });
      setReportPdfFile(null);
      toast({ title: "Report Added", description: "Client report has been added" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to add report", variant: "destructive" });
    } finally {
      setAddingReport(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    setDeletingReport(true);
    try {
      const res = await fetch(`/api/admin/client-reports/${reportToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete report");
      await fetchReports();
      setDeleteReportOpen(false);
      setReportToDelete(null);
      toast({ title: "Report Deleted" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete report", variant: "destructive" });
    } finally {
      setDeletingReport(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!company) return;
    setDeletingCompany(true);
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete company");
      }
      toast({ title: "Company Deleted", description: `${company.name} has been removed` });
      setLocation("/portal/admin?tab=companies");
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to delete company", variant: "destructive" });
    } finally {
      setDeletingCompany(false);
      setDeleteCompanyOpen(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getContractDaysRemaining = () => {
    if (!company?.contractEnd) return null;
    const endDate = new Date(company.contractEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!match) {
    return null;
  }

  if (loading) {
    return (
      <PortalLayout>
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (error || !company) {
    return (
      <PortalLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => setLocation("/portal/admin?tab=companies")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Companies
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{error || "Company not found"}</p>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  const tierInfo = tierConfig[company.tier] || tierConfig.FREE;
  const TierIcon = tierInfo.icon;
  const daysRemaining = getContractDaysRemaining();
  const basicRemaining = company.basicCreditsTotal - company.basicCreditsUsed;
  const proRemaining = company.proCreditsTotal - company.proCreditsUsed;

  return (
    <PortalLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/portal/admin?tab=companies")}
            data-testid="button-back-to-companies"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Companies
          </Button>
        </div>

        {/* Company Header */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-start gap-6">
              {/* Logo Section */}
              <div className="relative">
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <div
                  className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">Click to upload</p>
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold" data-testid="text-company-name">{company.name}</h1>
                  <Badge className={tierInfo.color}>
                    <TierIcon className="w-3 h-3 mr-1" />
                    {tierInfo.label}
                  </Badge>
                </div>
                {company.domain && (
                  <p className="text-muted-foreground mb-2">{company.domain}</p>
                )}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Contract: {formatDate(company.contractStart)} - {formatDate(company.contractEnd)}</span>
                  </div>
                  {daysRemaining !== null && (
                    <Badge variant={daysRemaining < 30 ? "destructive" : "secondary"}>
                      {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Contract expired"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Delete Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteCompanyOpen(true)}
                data-testid="button-delete-company"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Company
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credits Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Credits */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Test24 Basic</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateCredits("basic", -1)}
                        disabled={company.basicCreditsTotal <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-20 text-center font-medium">
                        {basicRemaining} remaining
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateCredits("basic", 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress 
                    value={company.basicCreditsTotal > 0 ? (basicRemaining / company.basicCreditsTotal) * 100 : 0} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {company.basicCreditsUsed} used of {company.basicCreditsTotal} total
                  </p>
                </div>

                {/* Pro Credits */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Test24 Pro</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateCredits("pro", -1)}
                        disabled={company.proCreditsTotal <= 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-20 text-center font-medium">
                        {proRemaining} remaining
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateCredits("pro", 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress 
                    value={company.proCreditsTotal > 0 ? (proRemaining / company.proCreditsTotal) * 100 : 0} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {company.proCreditsUsed} used of {company.proCreditsTotal} total
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Users Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members
                  </CardTitle>
                  <CardDescription>{users.length} user(s)</CardDescription>
                </div>
                <Button onClick={() => setAddUserOpen(true)} data-testid="button-add-user">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name || "—"}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {user.memberType || "Member"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.status === "active" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setUserToDelete(user);
                                setDeleteUserOpen(true);
                              }}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Client Reports Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Client Reports
                  </CardTitle>
                  <CardDescription>{reports.length} report(s)</CardDescription>
                </div>
                <Button onClick={() => setAddReportOpen(true)} data-testid="button-add-report">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Report
                </Button>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No reports yet</p>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div 
                        key={report.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{report.title}</h4>
                            {report.studyType && (
                              <Badge variant="secondary" className="text-xs">
                                {report.studyType}
                              </Badge>
                            )}
                            {report.status && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  report.status === "Completed" 
                                    ? "bg-green-50 text-green-700 border-green-200" 
                                    : ""
                                }`}
                              >
                                {report.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {report.description || "No description"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {report.upsiideUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(report.upsiideUrl!, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          {report.pdfUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(report.pdfUrl!, "_blank")}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLocation(`/portal/admin?tab=reports&editReport=${report.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setReportToDelete(report);
                              setDeleteReportOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Notes */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Notes</CardTitle>
                {!editingNotes ? (
                  <Button variant="ghost" size="sm" onClick={() => setEditingNotes(true)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
                    {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {editingNotes ? (
                  <Textarea
                    value={notesValue}
                    onChange={(e) => setNotesValue(e.target.value)}
                    placeholder="Add notes about this company..."
                    className="min-h-[200px]"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {company.notes || "No notes yet. Click edit to add notes."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Studies</span>
                  <span className="font-medium">{company.studyCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Team Size</span>
                  <span className="font-medium">{users.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reports</span>
                  <span className="font-medium">{reports.length}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(company.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Add a new user to {company.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="email@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="+27..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={addingUser}>
              {addingUser ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Report Dialog */}
      <Dialog open={addReportOpen} onOpenChange={setAddReportOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Client Report</DialogTitle>
            <DialogDescription>Add a new research report for {company.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={newReport.title}
                onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                placeholder="Report title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                placeholder="Brief description..."
                className="h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Study Type</Label>
                <Select
                  value={newReport.studyType}
                  onValueChange={(value) => setNewReport({ ...newReport, studyType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Test24 Basic">Test24 Basic</SelectItem>
                    <SelectItem value="Test24 Pro">Test24 Pro</SelectItem>
                    <SelectItem value="Consult">Consult</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newReport.status}
                  onValueChange={(value) => setNewReport({ ...newReport, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <Label>Industry</Label>
              <Select
                value={newReport.industry}
                onValueChange={(value) => setNewReport({ ...newReport, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Beverage">Beverage</SelectItem>
                  <SelectItem value="Alcohol">Alcohol</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Agency">Agency</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                  <SelectItem value="FMCG">FMCG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Upsiide Link</Label>
              <Input
                value={newReport.upsiideUrl}
                onChange={(e) => setNewReport({ ...newReport, upsiideUrl: e.target.value })}
                placeholder="https://app.upsiide.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>PDF File</Label>
              <input
                type="file"
                ref={reportPdfInputRef}
                accept=".pdf"
                className="hidden"
                onChange={(e) => setReportPdfFile(e.target.files?.[0] || null)}
              />
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => reportPdfInputRef.current?.click()}
              >
                {reportPdfFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm">{reportPdfFile.name}</span>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <Upload className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm">Click to upload PDF</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddReportOpen(false)}>Cancel</Button>
            <Button onClick={handleAddReport} disabled={addingReport}>
              {addingReport ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name || userToDelete?.email}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingUser}
            >
              {deletingUser ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Report Confirmation */}
      <AlertDialog open={deleteReportOpen} onOpenChange={setDeleteReportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{reportToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingReport}
            >
              {deletingReport ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Company Confirmation */}
      <AlertDialog open={deleteCompanyOpen} onOpenChange={setDeleteCompanyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{company.name}</strong>? This will permanently remove the company and all associated data including users and reports. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingCompany}
            >
              {deletingCompany ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete Company
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalLayout>
  );
}

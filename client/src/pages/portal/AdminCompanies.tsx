import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  RefreshCw, 
  Building2,
  Calendar,
  CreditCard,
  Wallet,
  Users,
  Crown,
  Zap,
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
  Check,
  X,
  Pencil
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { safeParseDate } from "@shared/access";

interface Company {
  id: string;
  name: string;
  domain: string | null;
  tier: string;
  industry: string | null;
  companySize: string | null;
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
  status: string | null;
  pdfUrl: string | null;
  dashboardUrl: string | null;
  deliveredAt: string | null;
  primaryContactEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CompanyUser {
  id: string;
  name: string | null;
  email: string;
  membershipTier: string;
  status: string;
  lastLoginAt: string | null;
  isPaidSeat: boolean;
}

const tierConfig: Record<string, { label: string; color: string; icon: any }> = {
  FREE: { label: "Free", color: "bg-gray-100 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400", icon: UserIcon },
  STARTER: { label: "Starter", color: "bg-muted text-muted-foreground", icon: UserIcon },
  GROWTH: { label: "Growth", color: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300", icon: TrendingUp },
  SCALE: { label: "Scale", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", icon: Crown },
  ADMIN: { label: "Admin", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300", icon: Crown },
};

export default function AdminCompanies() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  // Get impersonateCompany to enable "view as company" mode
  const { impersonateCompany } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [companyReports, setCompanyReports] = useState<ClientReport[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [editingDomain, setEditingDomain] = useState(false);
  const [editDomain, setEditDomain] = useState("");
  const [availableUsers, setAvailableUsers] = useState<{id: string; name: string | null; email: string}[]>([]);
  const [assignUserOpen, setAssignUserOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [addReportOpen, setAddReportOpen] = useState(false);
  const [addingReport, setAddingReport] = useState(false);
  const [deleteReportOpen, setDeleteReportOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ClientReport | null>(null);
  const [deletingReport, setDeletingReport] = useState(false);
  const [reportPdfFile, setReportPdfFile] = useState<File | null>(null);
  const reportPdfInputRef = useRef<HTMLInputElement>(null);
  
  // Create new company state
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    domain: "",
    tier: "STARTER" as string,
    industry: "" as string,
    companySize: "" as string,
    contractStart: "",
    contractEnd: "",
    basicCreditsTotal: 0,
    proCreditsTotal: 0,
    notes: "",
    userName: "",
    userEmail: "",
    userPhone: "",
  });

  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    studyType: "Test24 Basic",
    status: "Completed",
    deliveredAt: new Date().toISOString().split('T')[0],
    primaryContactEmail: "",
    dashboardUrl: "",
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/companies");
      if (!res.ok) throw new Error("Failed to fetch companies");
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyUsers = async (companyId: string) => {
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/users`);
      if (!res.ok) throw new Error("Failed to fetch company users");
      const data = await res.json();
      setCompanyUsers(data);
    } catch (err) {
      console.error("Failed to fetch company users:", err);
      setCompanyUsers([]);
    }
  };

  const fetchCompanyReports = async (companyId: string) => {
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/client-reports`);
      if (!res.ok) throw new Error("Failed to fetch company reports");
      const data = await res.json();
      setCompanyReports(data);
    } catch (err) {
      console.error("Failed to fetch company reports:", err);
      setCompanyReports([]);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCompany) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const res = await fetch(`/api/admin/companies/${selectedCompany.id}/logo`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload logo");

      const updated = await res.json();
      setSelectedCompany({ ...selectedCompany, logoUrl: updated.logoUrl });
      setCompanies(companies.map(c => c.id === selectedCompany.id ? { ...c, logoUrl: updated.logoUrl } : c));
      
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

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies;
    
    if (search) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.domain?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (tierFilter !== "all") {
      filtered = filtered.filter(c => c.tier === tierFilter);
    }
    
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredCompanies(filtered);
  }, [companies, search, tierFilter]);

  const stats = {
    total: companies.length,
    totalStudies: companies.reduce((sum, c) => sum + (c.studyCount || 0), 0),
    free: companies.filter(c => c.tier === "FREE").length,
    starter: companies.filter(c => c.tier === "STARTER").length,
    growth: companies.filter(c => c.tier === "GROWTH").length,
    scale: companies.filter(c => c.tier === "SCALE").length,
    totalBasicCredits: companies.reduce((sum, c) => sum + c.basicCreditsTotal, 0),
    usedBasicCredits: companies.reduce((sum, c) => sum + c.basicCreditsUsed, 0),
    totalProCredits: companies.reduce((sum, c) => sum + c.proCreditsTotal, 0),
    usedProCredits: companies.reduce((sum, c) => sum + c.proCreditsUsed, 0),
  };

  const handleOpenProfile = async (company: Company) => {
    setSelectedCompany(company);
    setEditNotes(company.notes || "");
    setEditingName(false);
    setEditingDomain(false);
    setAssignUserOpen(false);
    setRemovingUserId(null);
    setDrawerOpen(true);
    await Promise.all([
      fetchCompanyUsers(company.id),
      fetchCompanyReports(company.id),
    ]);
  };

  const handleUpdateCompany = async (companyId: string, updates: Partial<Company>) => {
    try {
      const normalizedUpdates = { ...updates };
      
      if ('contractStart' in normalizedUpdates) {
        normalizedUpdates.contractStart = safeParseDate(normalizedUpdates.contractStart);
      }
      if ('contractEnd' in normalizedUpdates) {
        normalizedUpdates.contractEnd = safeParseDate(normalizedUpdates.contractEnd);
      }

      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedUpdates),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update company");
      }

      const updated = await res.json();
      setCompanies(companies.map((c) => (c.id === companyId ? updated : c)));
      if (selectedCompany?.id === companyId) {
        setSelectedCompany(updated);
      }

      toast({
        title: "Company Updated",
        description: "Changes saved successfully",
      });
    } catch (err) {
      console.error("Update company error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update company",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedCompany) return;
    await handleUpdateCompany(selectedCompany.id, { notes: editNotes });
  };

  const handleSaveName = async () => {
    if (!selectedCompany || !editName.trim()) return;
    await handleUpdateCompany(selectedCompany.id, { name: editName.trim() });
    setEditingName(false);
  };

  const handleSaveDomain = async () => {
    if (!selectedCompany) return;
    await handleUpdateCompany(selectedCompany.id, { domain: editDomain.trim() || null });
    setEditingDomain(false);
  };

  const fetchAvailableUsers = async (companyId: string) => {
    try {
      const res = await fetch(`/api/admin/users/available-for-company/${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch available users:", err);
    }
  };

  const handleAssignUser = async (userId: string) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: selectedCompany.id }),
      });
      if (!res.ok) throw new Error("Failed to assign user");
      await fetchCompanyUsers(selectedCompany.id);
      await fetchAvailableUsers(selectedCompany.id);
      toast({ title: "User Assigned", description: "User has been added to the company" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to assign user", variant: "destructive" });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: null }),
      });
      if (!res.ok) throw new Error("Failed to remove user");
      setRemovingUserId(null);
      await fetchCompanyUsers(selectedCompany.id);
      toast({ title: "User Removed", description: "User has been removed from the company" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to remove user", variant: "destructive" });
    }
  };

  const handleTogglePaidSeat = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaidSeat: !currentStatus }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update user");
      }
      
      // Refetch users to ensure sync with server
      if (selectedCompany) {
        await fetchCompanyUsers(selectedCompany.id);
      }
      
      toast({
        title: !currentStatus ? "Upgraded to Paid Seat" : "Changed to Team Member",
        description: `User access level has been updated`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleAddReport = async () => {
    if (!selectedCompany || !newReport.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a report title",
        variant: "destructive",
      });
      return;
    }

    setAddingReport(true);
    try {
      // Step 1: Create the report record
      const res = await fetch("/api/admin/client-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          title: newReport.title,
          description: newReport.description || null,
          studyType: newReport.studyType,
          status: newReport.status,
          deliveredAt: newReport.deliveredAt || null,
          primaryContactEmail: newReport.primaryContactEmail || null,
          dashboardUrl: newReport.dashboardUrl || null,
          tags: [],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add report");
      }

      const createdReport = await res.json();

      // Step 2: If a PDF was selected, upload it
      if (reportPdfFile) {
        const formData = new FormData();
        formData.append("pdf", reportPdfFile);

        const uploadRes = await fetch(`/api/admin/client-reports/${createdReport.id}/pdf`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}));
          console.error("PDF upload failed:", errorData);
          toast({
            title: "Report Created",
            description: "Report was added but PDF upload failed. You can upload it later.",
            variant: "default",
          });
        }
      }

      toast({
        title: "Report Added",
        description: `Client report has been added for ${selectedCompany.name}`,
      });

      setAddReportOpen(false);
      setNewReport({
        title: "",
        description: "",
        studyType: "Test24 Basic",
        status: "Completed",
        deliveredAt: new Date().toISOString().split('T')[0],
        primaryContactEmail: "",
        dashboardUrl: "",
      });
      setReportPdfFile(null);
      if (reportPdfInputRef.current) {
        reportPdfInputRef.current.value = "";
      }
      
      await fetchCompanyReports(selectedCompany.id);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add report",
        variant: "destructive",
      });
    } finally {
      setAddingReport(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;

    setDeletingReport(true);
    try {
      const res = await fetch(`/api/admin/client-reports/${reportToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete report");
      }

      toast({
        title: "Report Deleted",
        description: "Client report has been removed",
      });

      setDeleteReportOpen(false);
      setReportToDelete(null);
      
      if (selectedCompany) {
        await fetchCompanyReports(selectedCompany.id);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete report",
        variant: "destructive",
      });
    } finally {
      setDeletingReport(false);
    }
  };

  const handleCreateCompany = async () => {
    if (!newCompany.name.trim()) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }
    if (!newCompany.userName.trim() || !newCompany.userEmail.trim()) {
      toast({
        title: "Error",
        description: "User name and email are required",
        variant: "destructive",
      });
      return;
    }

    setCreatingCompany(true);
    try {
      const res = await fetch("/api/admin/companies/with-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: newCompany.name,
            domain: newCompany.domain || null,
            tier: newCompany.tier,
            industry: newCompany.industry || null,
            companySize: newCompany.companySize || null,
            contractStart: newCompany.contractStart || null,
            contractEnd: newCompany.contractEnd || null,
            basicCreditsTotal: newCompany.basicCreditsTotal || 0,
            proCreditsTotal: newCompany.proCreditsTotal || 0,
            notes: newCompany.notes || null,
          },
          user: {
            name: newCompany.userName,
            email: newCompany.userEmail,
            phone: newCompany.userPhone || null,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create company");
      }

      const data = await res.json();
      
      toast({
        title: "Company Created",
        description: `${data.company.name} has been created and a password setup email was sent to ${data.user.email}`,
      });

      setCreateCompanyOpen(false);
      setNewCompany({
        name: "",
        domain: "",
        tier: "STARTER",
        industry: "",
        companySize: "",
        contractStart: "",
        contractEnd: "",
        basicCreditsTotal: 0,
        proCreditsTotal: 0,
        notes: "",
        userName: "",
        userEmail: "",
        userPhone: "",
      });
      
      await fetchCompanies();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create company",
        variant: "destructive",
      });
    } finally {
      setCreatingCompany(false);
    }
  };

  // Activate view-as-company mode and navigate to portal dashboard
  const handleViewClientPortal = async () => {
    if (!selectedCompany) return;
    setDrawerOpen(false);
    try {
      // Set impersonation state in AuthContext - this hides Admin tab and shows impersonation banner
      await impersonateCompany(selectedCompany.id);
      // Navigate to the company's portal dashboard (not research, to show full experience)
      setLocation("/portal");
    } catch (err) {
      // If impersonation fails, show error and stay in admin view
      toast({
        title: "Error",
        description: "Failed to view company portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getContractDaysRemaining = (contractStart: string | null | undefined) => {
    if (!contractStart) return null;
    const start = new Date(contractStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 365);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getContractEndDate = (contractStart: string | null | undefined) => {
    if (!contractStart) return null;
    const start = new Date(contractStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 365);
    return end.toISOString();
  };

  const formatCurrency = (amount: string | number | undefined) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    return `R${num.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;
  };

  const getCreditsProgress = (used: number, total: number) => {
    if (total === 0) return 0;
    return (used / total) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-serif font-bold">Company Accounts</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateCompanyOpen(true)} size="sm" data-testid="button-create-company">
            <Plus className="w-4 h-4 mr-2" />
            Create New Company
          </Button>
          <Button onClick={fetchCompanies} variant="outline" size="sm" data-testid="button-refresh-companies">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overview</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold" data-testid="text-total-companies">{stats.total}</div>
                <div className="text-[10px] text-muted-foreground">Companies</div>
              </div>
              <div>
                <div className="text-lg font-bold" data-testid="text-total-studies">{stats.totalStudies}</div>
                <div className="text-[10px] text-muted-foreground">Studies</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership Tiers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-1 text-center">
              <div>
                <div className="text-lg font-bold" data-testid="text-free-companies">{stats.free}</div>
                <div className="text-[10px] text-muted-foreground">Free</div>
              </div>
              <div>
                <div className="text-lg font-bold" data-testid="text-starter-companies">{stats.starter}</div>
                <div className="text-[10px] text-muted-foreground">Starter</div>
              </div>
              <div>
                <div className="text-lg font-bold" data-testid="text-growth-companies">{stats.growth}</div>
                <div className="text-[10px] text-muted-foreground">Growth</div>
              </div>
              <div>
                <div className="text-lg font-bold" data-testid="text-scale-companies">{stats.scale}</div>
                <div className="text-[10px] text-muted-foreground">Scale</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3 text-blue-500" />
                  <span className="text-lg font-bold" data-testid="text-basic-credits">
                    {stats.totalBasicCredits - stats.usedBasicCredits}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">Basic</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Crown className="h-3 w-3 text-purple-500" />
                  <span className="text-lg font-bold" data-testid="text-pro-credits">
                    {stats.totalProCredits - stats.usedProCredits}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground">Pro</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-64"
                data-testid="input-search-companies"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-36" data-testid="select-tier-filter">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="GROWTH">Growth</SelectItem>
                <SelectItem value="SCALE">Scale</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading companies...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No companies found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Basic Credits</TableHead>
                  <TableHead>Pro Credits</TableHead>
                  <TableHead>Studies</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => {
                  const tierInfo = tierConfig[company.tier] || tierConfig.STARTER;
                  const TierIcon = tierInfo.icon;
                  return (
                    <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                      <TableCell>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-muted-foreground">{company.domain || "—"}</div>
                        {company.industry && (
                          <span className="text-xs text-muted-foreground">{company.industry}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={tierInfo.color}>
                          <TierIcon className="w-3 h-3 mr-1" />
                          {tierInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const daysLeft = getContractDaysRemaining(company.contractStart);
                          if (daysLeft === null) return <span className="text-muted-foreground">—</span>;
                          if (daysLeft <= 0) return <Badge variant="destructive">Expired</Badge>;
                          if (daysLeft <= 30) return <Badge variant="destructive">{daysLeft} days</Badge>;
                          if (daysLeft <= 90) return <Badge variant="secondary" className="bg-amber-100 text-amber-800">{daysLeft} days</Badge>;
                          return <span className="font-medium">{daysLeft} days</span>;
                        })()}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{company.basicCreditsTotal - company.basicCreditsUsed}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{company.proCreditsTotal - company.proCreditsUsed}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          <span>{company.studyCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setLocation(`/portal/admin/companies/${company.id}`)}
                          data-testid={`button-view-company-${company.id}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          {selectedCompany && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Avatar className="w-14 h-14">
                        {selectedCompany.logoUrl ? (
                          <AvatarImage src={selectedCompany.logoUrl} alt={selectedCompany.name} />
                        ) : null}
                        <AvatarFallback className="bg-muted">
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                    />
                    <div className="flex-1 min-w-0">
                      {editingName ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-lg font-semibold"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                            data-testid="input-edit-company-name"
                          />
                          <Button size="icon" variant="ghost" onClick={handleSaveName} data-testid="button-save-name">
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <SheetTitle
                          className="text-lg cursor-pointer"
                          onClick={() => { setEditName(selectedCompany.name); setEditingName(true); }}
                          data-testid="text-company-name"
                        >
                          {selectedCompany.name}
                        </SheetTitle>
                      )}
                      {editingDomain ? (
                        <div className="flex items-center gap-1 mt-1">
                          <Input
                            value={editDomain}
                            onChange={(e) => setEditDomain(e.target.value)}
                            className="h-6 text-sm"
                            placeholder="e.g. company.co.za"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveDomain(); if (e.key === "Escape") setEditingDomain(false); }}
                            data-testid="input-edit-domain"
                          />
                          <Button size="icon" variant="ghost" onClick={handleSaveDomain} data-testid="button-save-domain">
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <SheetDescription
                          className="cursor-pointer"
                          onClick={() => { setEditDomain(selectedCompany.domain || ""); setEditingDomain(true); }}
                          data-testid="text-company-domain"
                        >
                          {selectedCompany.domain || "Click to add domain"}
                        </SheetDescription>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleViewClientPortal}
                  data-testid="button-view-client-portal"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Client Portal
                </Button>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tier</Label>
                    <div className="mt-1">
                      <Select 
                        value={selectedCompany.tier} 
                        onValueChange={(v) => handleUpdateCompany(selectedCompany.id, { tier: v })}
                      >
                        <SelectTrigger className="w-full" data-testid="select-company-tier">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FREE">Free</SelectItem>
                          <SelectItem value="STARTER">Starter</SelectItem>
                          <SelectItem value="GROWTH">Growth</SelectItem>
                          <SelectItem value="SCALE">Scale</SelectItem>
                          <SelectItem value="CUSTOM">Custom</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Industry</Label>
                    <div className="mt-1">
                      <Select 
                        value={selectedCompany.industry || "none"} 
                        onValueChange={(v) => handleUpdateCompany(selectedCompany.id, { industry: v === "none" ? null : v })}
                      >
                        <SelectTrigger className="w-full" data-testid="select-company-industry">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not set</SelectItem>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                          <SelectItem value="Food & Snacks">Food & Snacks</SelectItem>
                          <SelectItem value="Personal Care">Personal Care</SelectItem>
                          <SelectItem value="Beauty & Cosmetics">Beauty & Cosmetics</SelectItem>
                          <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                          <SelectItem value="Alcohol">Alcohol</SelectItem>
                          <SelectItem value="Agriculture">Agriculture</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="FMCG">FMCG</SelectItem>
                          <SelectItem value="Hospitality">Hospitality</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Company Size</Label>
                  <div className="mt-1">
                    <Select 
                      value={selectedCompany.companySize || "none"} 
                      onValueChange={(v) => handleUpdateCompany(selectedCompany.id, { companySize: v === "none" ? null : v })}
                    >
                      <SelectTrigger className="w-full" data-testid="select-company-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not set</SelectItem>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="501-1000">501-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4" />
                    Contract Period (365 days)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Input 
                        type="date" 
                        value={selectedCompany.contractStart ? new Date(selectedCompany.contractStart).toISOString().split('T')[0] : ""}
                        onChange={(e) => handleUpdateCompany(selectedCompany.id, { contractStart: e.target.value || null })}
                        className="mt-1"
                        data-testid="input-contract-start"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End Date (Auto)</Label>
                      <p className="font-medium mt-2">
                        {formatDate(getContractEndDate(selectedCompany.contractStart))}
                      </p>
                    </div>
                  </div>
                  {selectedCompany.contractStart && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/50">
                      {(() => {
                        const daysLeft = getContractDaysRemaining(selectedCompany.contractStart);
                        if (daysLeft === null) return null;
                        if (daysLeft <= 0) return <p className="text-sm text-destructive font-medium">Contract expired</p>;
                        if (daysLeft <= 30) return <p className="text-sm text-destructive font-medium">{daysLeft} days remaining</p>;
                        if (daysLeft <= 90) return <p className="text-sm text-amber-600 font-medium">{daysLeft} days remaining</p>;
                        return <p className="text-sm text-muted-foreground">{daysLeft} days remaining</p>;
                      })()}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4" />
                    Credit Pool
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-500" />
                          Test24 Basic Credits
                        </span>
                        <span className="font-bold">
                          {selectedCompany.basicCreditsTotal - selectedCompany.basicCreditsUsed} remaining
                        </span>
                      </div>
                      <Progress 
                        value={getCreditsProgress(selectedCompany.basicCreditsUsed, selectedCompany.basicCreditsTotal)} 
                        className="h-2" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedCompany.basicCreditsUsed} of {selectedCompany.basicCreditsTotal} used
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Crown className="w-4 h-4 text-purple-500" />
                          Test24 Pro Credits
                        </span>
                        <span className="font-bold">
                          {selectedCompany.proCreditsTotal - selectedCompany.proCreditsUsed} remaining
                        </span>
                      </div>
                      <Progress 
                        value={getCreditsProgress(selectedCompany.proCreditsUsed, selectedCompany.proCreditsTotal)} 
                        className="h-2" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedCompany.proCreditsUsed} of {selectedCompany.proCreditsTotal} used
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Adjust Basic Credits</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="Amount"
                          className="w-24"
                          id="basic-credits-input"
                          data-testid="input-adjust-basic-credits"
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="gap-1"
                          onClick={() => {
                            const input = document.getElementById('basic-credits-input') as HTMLInputElement;
                            const value = parseInt(input.value);
                            if (value > 0) {
                              handleUpdateCompany(selectedCompany.id, { 
                                basicCreditsTotal: selectedCompany.basicCreditsTotal + value 
                              });
                              input.value = '';
                            }
                          }}
                          data-testid="button-add-basic-credits"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => {
                            const input = document.getElementById('basic-credits-input') as HTMLInputElement;
                            const value = parseInt(input.value);
                            if (value > 0) {
                              const newTotal = Math.max(0, selectedCompany.basicCreditsTotal - value);
                              const newUsed = Math.min(selectedCompany.basicCreditsUsed, newTotal);
                              handleUpdateCompany(selectedCompany.id, { 
                                basicCreditsTotal: newTotal,
                                basicCreditsUsed: newUsed
                              });
                              input.value = '';
                            }
                          }}
                          data-testid="button-remove-basic-credits"
                        >
                          <Minus className="w-3 h-3" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Adjust Pro Credits</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="Amount"
                          className="w-24"
                          id="pro-credits-input"
                          data-testid="input-adjust-pro-credits"
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="gap-1"
                          onClick={() => {
                            const input = document.getElementById('pro-credits-input') as HTMLInputElement;
                            const value = parseInt(input.value);
                            if (value > 0) {
                              handleUpdateCompany(selectedCompany.id, { 
                                proCreditsTotal: selectedCompany.proCreditsTotal + value 
                              });
                              input.value = '';
                            }
                          }}
                          data-testid="button-add-pro-credits"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => {
                            const input = document.getElementById('pro-credits-input') as HTMLInputElement;
                            const value = parseInt(input.value);
                            if (value > 0) {
                              const newTotal = Math.max(0, selectedCompany.proCreditsTotal - value);
                              const newUsed = Math.min(selectedCompany.proCreditsUsed, newTotal);
                              handleUpdateCompany(selectedCompany.id, { 
                                proCreditsTotal: newTotal,
                                proCreditsUsed: newUsed
                              });
                              input.value = '';
                            }
                          }}
                          data-testid="button-remove-pro-credits"
                        >
                          <Minus className="w-3 h-3" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team Members
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        fetchAvailableUsers(selectedCompany.id);
                        setAssignUserOpen(true);
                      }}
                      data-testid="button-assign-user"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add User
                    </Button>
                  </div>
                  
                  {companyUsers.length > 0 && (
                    <div className="flex gap-4 mb-4 p-3 rounded-lg bg-muted/30">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">{companyUsers.filter(u => u.isPaidSeat).length}</p>
                        <p className="text-xs text-muted-foreground">Paid Seats</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{companyUsers.filter(u => !u.isPaidSeat).length}</p>
                        <p className="text-xs text-muted-foreground">Team Members</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{companyUsers.length}</p>
                        <p className="text-xs text-muted-foreground">Total Users</p>
                      </div>
                    </div>
                  )}
                  
                  {companyUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No users assigned to this company</p>
                  ) : (
                    <div className="space-y-2">
                      {companyUsers.map((user) => (
                        <div 
                          key={user.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                          data-testid={`row-company-user-${user.id}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                              <p className="font-medium truncate">{user.name || user.email}</p>
                              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant={user.isPaidSeat ? "default" : "outline"}
                              onClick={() => handleTogglePaidSeat(user.id, user.isPaidSeat)}
                              className={user.isPaidSeat ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
                              data-testid={`button-toggle-paid-${user.id}`}
                            >
                              {user.isPaidSeat ? (
                                <>
                                  <Crown className="w-3 h-3 mr-1" />
                                  Paid
                                </>
                              ) : (
                                "Team"
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setRemovingUserId(user.id)}
                              data-testid={`button-remove-user-${user.id}`}
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {assignUserOpen && (
                    <div className="mt-3 p-3 rounded-lg border border-dashed space-y-2">
                      <Label className="text-xs text-muted-foreground">Assign existing user to this company</Label>
                      {availableUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No unassigned users available</p>
                      ) : (
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {availableUsers.map((u) => (
                            <div key={u.id} className="flex items-center justify-between gap-2 p-2 rounded bg-muted/30">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{u.name || u.email}</p>
                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => handleAssignUser(u.id)} data-testid={`button-assign-${u.id}`}>
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setAssignUserOpen(false)} className="w-full">
                        Close
                      </Button>
                    </div>
                  )}

                  {removingUserId && (
                    <div className="mt-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                      <p className="text-sm mb-2">Remove this user from the company?</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={() => handleRemoveUser(removingUserId)} data-testid="button-confirm-remove-user">
                          Remove
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRemovingUserId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Client Reports
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddReportOpen(true)}
                      data-testid="button-add-report"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Report
                    </Button>
                  </div>
                  {companyReports.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No research reports delivered yet</p>
                  ) : (
                    <div className="space-y-2">
                      {companyReports.slice(0, 5).map((report) => (
                        <div 
                          key={report.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                          data-testid={`row-company-report-${report.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{report.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {report.studyType || "Test24 Basic"}
                              </Badge>
                              {report.status && (
                                <Badge variant={report.status === "Completed" ? "secondary" : "default"} className="text-xs">
                                  {report.status}
                                </Badge>
                              )}
                              <span>{formatDate(report.deliveredAt || report.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            {report.dashboardUrl && (
                              <a 
                                href={report.dashboardUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button size="icon" variant="ghost" data-testid={`button-dashboard-report-${report.id}`}>
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </a>
                            )}
                            {report.pdfUrl ? (
                              <a 
                                href={report.pdfUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button size="icon" variant="ghost" data-testid={`button-download-report-${report.id}`}>
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                No PDF
                              </Badge>
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => {
                                setReportToDelete(report);
                                setDeleteReportOpen(true);
                              }}
                              data-testid={`button-delete-report-${report.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {companyReports.length > 5 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-muted-foreground"
                          onClick={() => setLocation(`/portal/admin?tab=reports&companyId=${selectedCompany.id}`)}
                        >
                          View all {companyReports.length} reports
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4" />
                    Notes
                  </h4>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add internal notes about this company..."
                    className="min-h-[100px]"
                    data-testid="textarea-company-notes"
                  />
                  <Button 
                    onClick={handleSaveNotes} 
                    className="mt-2" 
                    size="sm"
                    data-testid="button-save-notes"
                  >
                    Save Notes
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <Label className="text-xs">Created</Label>
                      <p>{formatDate(selectedCompany.createdAt)}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Last Updated</Label>
                      <p>{formatDate(selectedCompany.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <Dialog open={addReportOpen} onOpenChange={setAddReportOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Client Report</DialogTitle>
            <DialogDescription>
              Add a new research report for {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-title">Report Title *</Label>
              <Input
                id="report-title"
                placeholder="e.g., Consumer Insights Q4 2024"
                value={newReport.title}
                onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                data-testid="input-report-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                placeholder="Brief description of the research..."
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                data-testid="input-report-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Study Type</Label>
                <Select
                  value={newReport.studyType}
                  onValueChange={(v) => setNewReport({ ...newReport, studyType: v })}
                >
                  <SelectTrigger data-testid="select-study-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Test24 Basic">Test24 Basic</SelectItem>
                    <SelectItem value="Test24 Pro">Test24 Pro</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newReport.status}
                  onValueChange={(v) => setNewReport({ ...newReport, status: v })}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Live">Live</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivered-at">Delivered Date</Label>
                <Input
                  id="delivered-at"
                  type="date"
                  value={newReport.deliveredAt}
                  onChange={(e) => setNewReport({ ...newReport, deliveredAt: e.target.value })}
                  data-testid="input-delivered-at"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-contact">Primary Contact Email</Label>
                <Input
                  id="primary-contact"
                  type="email"
                  placeholder="contact@company.com"
                  value={newReport.primaryContactEmail}
                  onChange={(e) => setNewReport({ ...newReport, primaryContactEmail: e.target.value })}
                  data-testid="input-primary-contact"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-pdf">Report PDF</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={reportPdfInputRef}
                  id="report-pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setReportPdfFile(e.target.files?.[0] || null)}
                  className="flex-1"
                  data-testid="input-report-pdf"
                />
                {reportPdfFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setReportPdfFile(null);
                      if (reportPdfInputRef.current) {
                        reportPdfInputRef.current.value = "";
                      }
                    }}
                    data-testid="button-clear-pdf"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
              {reportPdfFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {reportPdfFile.name} ({(reportPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dashboard-url">External Dashboard URL (optional)</Label>
              <Input
                id="dashboard-url"
                type="url"
                placeholder="https://upsiide.com/dashboard/..."
                value={newReport.dashboardUrl}
                onChange={(e) => setNewReport({ ...newReport, dashboardUrl: e.target.value })}
                data-testid="input-dashboard-url"
              />
              <p className="text-xs text-muted-foreground">Link to UpSiide, Storyteller, or other dashboard</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddReportOpen(false)}
              data-testid="button-cancel-report"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddReport}
              disabled={addingReport}
              data-testid="button-save-report"
            >
              {addingReport ? "Adding..." : "Add Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteReportOpen} onOpenChange={setDeleteReportOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Client Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{reportToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteReportOpen(false);
                setReportToDelete(null);
              }}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteReport}
              disabled={deletingReport}
              data-testid="button-confirm-delete"
            >
              {deletingReport ? "Deleting..." : "Delete Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={createCompanyOpen} onOpenChange={setCreateCompanyOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Company</DialogTitle>
            <DialogDescription>
              Set up a new company account with an initial user. The user will receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Company Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    placeholder="e.g., Acme Corporation"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    data-testid="input-company-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-domain">Domain</Label>
                  <Input
                    id="company-domain"
                    placeholder="e.g., acme.com"
                    value={newCompany.domain}
                    onChange={(e) => setNewCompany({ ...newCompany, domain: e.target.value })}
                    data-testid="input-company-domain"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Membership Tier</Label>
                  <Select
                    value={newCompany.tier}
                    onValueChange={(v) => setNewCompany({ ...newCompany, tier: v })}
                  >
                    <SelectTrigger data-testid="select-company-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">Free</SelectItem>
                      <SelectItem value="STARTER">Starter</SelectItem>
                      <SelectItem value="GROWTH">Growth</SelectItem>
                      <SelectItem value="SCALE">Scale</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract-start">Contract Start (365 day term)</Label>
                  <Input
                    id="contract-start"
                    type="date"
                    value={newCompany.contractStart}
                    onChange={(e) => setNewCompany({ ...newCompany, contractStart: e.target.value })}
                    data-testid="input-contract-start"
                  />
                  {newCompany.contractStart && (
                    <p className="text-xs text-muted-foreground">
                      Ends: {formatDate(getContractEndDate(newCompany.contractStart))}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select
                    value={newCompany.industry || "none"}
                    onValueChange={(v) => setNewCompany({ ...newCompany, industry: v === "none" ? "" : v })}
                  >
                    <SelectTrigger data-testid="select-new-company-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                      <SelectItem value="Food & Snacks">Food & Snacks</SelectItem>
                      <SelectItem value="Personal Care">Personal Care</SelectItem>
                      <SelectItem value="Beauty & Cosmetics">Beauty & Cosmetics</SelectItem>
                      <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                      <SelectItem value="Alcohol">Alcohol</SelectItem>
                      <SelectItem value="Agriculture">Agriculture</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="FMCG">FMCG</SelectItem>
                      <SelectItem value="Hospitality">Hospitality</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select
                    value={newCompany.companySize || "none"}
                    onValueChange={(v) => setNewCompany({ ...newCompany, companySize: v === "none" ? "" : v })}
                  >
                    <SelectTrigger data-testid="select-new-company-size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basic-credits">Basic Credits</Label>
                  <Input
                    id="basic-credits"
                    type="number"
                    min="0"
                    value={newCompany.basicCreditsTotal}
                    onChange={(e) => setNewCompany({ ...newCompany, basicCreditsTotal: parseInt(e.target.value) || 0 })}
                    data-testid="input-basic-credits"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pro-credits">Pro Credits</Label>
                  <Input
                    id="pro-credits"
                    type="number"
                    min="0"
                    value={newCompany.proCreditsTotal}
                    onChange={(e) => setNewCompany({ ...newCompany, proCreditsTotal: parseInt(e.target.value) || 0 })}
                    data-testid="input-pro-credits"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Initial User</h4>
              <p className="text-sm text-muted-foreground">This user will receive an email to set up their password and access the portal.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Full Name *</Label>
                  <Input
                    id="user-name"
                    placeholder="e.g., John Smith"
                    value={newCompany.userName}
                    onChange={(e) => setNewCompany({ ...newCompany, userName: e.target.value })}
                    data-testid="input-user-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email Address *</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="john@acme.com"
                    value={newCompany.userEmail}
                    onChange={(e) => setNewCompany({ ...newCompany, userEmail: e.target.value })}
                    data-testid="input-user-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-phone">Phone Number (optional)</Label>
                <Input
                  id="user-phone"
                  type="tel"
                  placeholder="+27 12 345 6789"
                  value={newCompany.userPhone}
                  onChange={(e) => setNewCompany({ ...newCompany, userPhone: e.target.value })}
                  data-testid="input-user-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-notes">Notes (optional)</Label>
              <Textarea
                id="company-notes"
                placeholder="Internal notes about this company..."
                value={newCompany.notes}
                onChange={(e) => setNewCompany({ ...newCompany, notes: e.target.value })}
                data-testid="input-company-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateCompanyOpen(false)}
              data-testid="button-cancel-create-company"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCompany}
              disabled={creatingCompany}
              data-testid="button-submit-create-company"
            >
              {creatingCompany ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

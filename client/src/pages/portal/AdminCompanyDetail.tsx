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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
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
  Activity,
  LogIn,
  BarChart3,
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
  Loader2,
  Zap,
  Paperclip,
  Target,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PortalLayout from "./PortalLayout";
import { safeParseDate } from "@shared/access";
import test24BasicImage from "@assets/Test24_Basic_1765398265879.png";
import test24ProImage from "@assets/Test24_Pro_1765398265879.png";

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
  companyId?: string | null;
  isPaidSeat?: boolean;
}

interface BriefSubmission {
  id: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedByContact: string | null;
  companyId: string | null;
  companyName: string;
  companyBrand: string | null;
  studyType: string;
  numIdeas: number;
  researchObjective: string;
  regions: string[];
  ages: string[];
  genders: string[];
  incomes: string[];
  industry: string | null;
  competitors: string[];
  projectFileUrls: string[];
  files: any[];
  concepts: any[];
  paymentMethod: string;
  paymentStatus: string | null;
  paymentIntentId: string | null;
  basicCreditsUsed: number;
  proCreditsUsed: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const getStudyTypeImage = (studyType: string | null): string | null => {
  if (!studyType) return null;
  const type = studyType.toLowerCase();
  if (type.includes("basic") || type === "test24_basic") return test24BasicImage;
  if (type.includes("pro") || type === "test24_pro") return test24ProImage;
  return null;
};

const formatStudyType = (studyType: string | null): string => {
  if (!studyType) return "Unknown";
  const lower = studyType.toLowerCase();
  if (lower.includes("pro")) return "Test24 Pro";
  if (lower.includes("basic")) return "Test24 Basic";
  if (lower === "consult") return "Consult";
  return studyType;
};

const getBriefStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "new": return "bg-blue-100 text-blue-700 border-blue-200";
    case "in_progress": return "bg-amber-100 text-amber-700 border-amber-200";
    case "under_review": return "bg-purple-100 text-purple-700 border-purple-200";
    case "completed": return "bg-green-100 text-green-700 border-green-200";
    case "on_hold": return "bg-gray-100 text-gray-600 border-gray-200";
    default: return "bg-muted text-muted-foreground";
  }
};

const formatBriefStatus = (status: string): string => {
  switch (status.toLowerCase()) {
    case "new": return "New";
    case "in_progress": return "In Progress";
    case "under_review": return "Under Review";
    case "completed": return "Completed";
    case "on_hold": return "On Hold";
    default: return status;
  }
};

const tierConfig: Record<string, { label: string; color: string; icon: any }> = {
  FREE: { label: "Free", color: "bg-gray-100 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400", icon: UserIcon },
  STARTER: { label: "Starter", color: "bg-muted text-muted-foreground", icon: UserIcon },
  GROWTH: { label: "Growth", color: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300", icon: TrendingUp },
  SCALE: { label: "Scale", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", icon: Crown },
};

export default function AdminCompanyDetail() {
  const { toast } = useToast();
  const { impersonateCompany } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/portal/admin/companies/:companyId");
  
  const [company, setCompany] = useState<Company | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [briefs, setBriefs] = useState<BriefSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit brief dialog
  const [editBriefOpen, setEditBriefOpen] = useState(false);
  const [editingBrief, setEditingBrief] = useState<BriefSubmission | null>(null);
  const [savingBrief, setSavingBrief] = useState(false);
  const [briefEditForm, setBriefEditForm] = useState({
    status: "",
    notes: "",
  });
  
  // Delete brief dialog
  const [deleteBriefOpen, setDeleteBriefOpen] = useState(false);
  const [briefToDelete, setBriefToDelete] = useState<BriefSubmission | null>(null);
  const [deletingBrief, setDeletingBrief] = useState(false);
  
  // Edit states
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  
  // Logo upload
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // Add user dialog
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserTab, setAddUserTab] = useState<"create" | "existing">("create");
  const [addingUser, setAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [availableUsers, setAvailableUsers] = useState<CompanyUser[]>([]);
  const [loadingAvailableUsers, setLoadingAvailableUsers] = useState(false);
  const [selectedExistingUser, setSelectedExistingUser] = useState<string>("");
  const [existingUserSearch, setExistingUserSearch] = useState("");
  
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

  // Activity tracking
  const [activitySummary, setActivitySummary] = useState<any>(null);
  const [activityEvents, setActivityEvents] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityRange, setActivityRange] = useState<"7d" | "14d" | "30d">("7d");

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

  const fetchBriefs = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`/api/admin/briefs`);
      if (!res.ok) throw new Error("Failed to fetch briefs");
      const allBriefs = await res.json();
      const companyBriefs = allBriefs.filter((b: BriefSubmission) => b.companyId === companyId);
      setBriefs(companyBriefs);
    } catch (err) {
      console.error("Failed to fetch briefs:", err);
    }
  };

  const fetchActivity = async () => {
    if (!companyId) return;
    setActivityLoading(true);
    try {
      const days = activityRange === "7d" ? 7 : activityRange === "14d" ? 14 : 30;
      const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();
      const [summaryRes, eventsRes] = await Promise.all([
        fetch(`/api/admin/companies/${companyId}/activity-summary?from=${from}&to=${to}`),
        fetch(`/api/admin/companies/${companyId}/activity?from=${from}&to=${to}`),
      ]);
      if (summaryRes.ok) setActivitySummary(await summaryRes.json());
      if (eventsRes.ok) setActivityEvents(await eventsRes.json());
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    }
    setActivityLoading(false);
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchCompany(), fetchUsers(), fetchReports(), fetchBriefs()]);
    setLoading(false);
  };

  useEffect(() => {
    if (companyId) {
      fetchAllData();
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchActivity();
    }
  }, [companyId, activityRange]);

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

  const handleUpdateCompany = async (updates: Partial<Company>) => {
    if (!company) return;
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update company");
      }
      const updated = await res.json();
      setCompany(updated);
      toast({ title: "Company Updated", description: "Changes saved successfully" });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to update company", variant: "destructive" });
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update user");
      }
      
      await fetchUsers();
      toast({ 
        title: "Access Updated", 
        description: !currentStatus ? "User now has paid seat access" : "User is now a team member" 
      });
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err instanceof Error ? err.message : "Failed to update user access", 
        variant: "destructive" 
      });
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

  const fetchAvailableUsers = async () => {
    if (!company) return;
    setLoadingAvailableUsers(true);
    try {
      const res = await fetch(`/api/admin/users/available-for-company/${company.id}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setAvailableUsers(data);
    } catch (err) {
      console.error("Failed to fetch available users:", err);
      setAvailableUsers([]);
    } finally {
      setLoadingAvailableUsers(false);
    }
  };

  const handleAssignExistingUser = async () => {
    if (!company || !selectedExistingUser) {
      toast({ title: "Error", description: "Please select a user to add", variant: "destructive" });
      return;
    }
    setAddingUser(true);
    try {
      const res = await fetch(`/api/admin/companies/${company.id}/assign-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedExistingUser }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to assign user");
      }
      await fetchUsers();
      setAddUserOpen(false);
      setSelectedExistingUser("");
      setExistingUserSearch("");
      toast({ title: "User Assigned", description: "Existing user has been added to this company" });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to assign user", variant: "destructive" });
    } finally {
      setAddingUser(false);
    }
  };

  // Fetch available users when dialog opens
  useEffect(() => {
    if (addUserOpen && addUserTab === "existing") {
      fetchAvailableUsers();
    }
  }, [addUserOpen, addUserTab, company?.id]);

  const filteredAvailableUsers = availableUsers.filter(u => {
    if (!existingUserSearch) return true;
    const search = existingUserSearch.toLowerCase();
    return (
      (u.name?.toLowerCase().includes(search)) ||
      (u.email?.toLowerCase().includes(search))
    );
  });

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
    }
  };

  const handleEditBrief = (brief: BriefSubmission) => {
    setEditingBrief(brief);
    setBriefEditForm({
      status: brief.status,
      notes: brief.notes || "",
    });
    setEditBriefOpen(true);
  };

  const handleSaveBrief = async () => {
    if (!editingBrief) return;
    setSavingBrief(true);
    try {
      const res = await fetch(`/api/admin/briefs/${editingBrief.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(briefEditForm),
      });
      if (!res.ok) throw new Error("Failed to update brief");
      await fetchBriefs();
      setEditBriefOpen(false);
      setEditingBrief(null);
      toast({ title: "Brief Updated" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update brief", variant: "destructive" });
    } finally {
      setSavingBrief(false);
    }
  };

  const handleDeleteBrief = async () => {
    if (!briefToDelete) return;
    setDeletingBrief(true);
    try {
      const res = await fetch(`/api/admin/briefs/${briefToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete brief");
      await fetchBriefs();
      setDeleteBriefOpen(false);
      setBriefToDelete(null);
      toast({ title: "Brief Deleted" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete brief", variant: "destructive" });
    } finally {
      setDeletingBrief(false);
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
        {/* Header with Back Button and Delete */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/portal/admin?tab=companies")}
            data-testid="button-back-to-companies"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Companies
          </Button>
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
                  {company.tier === "FREE" ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Free tier — Unlimited</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Contract: {formatDate(company.contractStart)} - {formatDate(company.contractEnd)}</span>
                      </div>
                      {daysRemaining !== null && (
                        <Badge variant={daysRemaining < 30 ? "destructive" : "secondary"}>
                          {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Contract expired"}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await impersonateCompany(company.id);
                    setLocation("/portal");
                  } catch (err) {
                    toast({
                      title: "Error",
                      description: "Failed to view as company",
                      variant: "destructive",
                    });
                  }
                }}
                data-testid="button-view-company-lens"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Company Lens
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Settings Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Membership Settings
            </CardTitle>
            <CardDescription>Manage company membership tier and access levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Membership Tier</Label>
                <Select 
                  value={company.tier} 
                  onValueChange={(v) => handleUpdateCompany({ tier: v })}
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
                <p className="text-xs text-muted-foreground">
                  {company.tier === "FREE" 
                    ? "Limited access - no premium content" 
                    : company.tier === "STARTER"
                    ? "Basic membership features"
                    : company.tier === "GROWTH"
                    ? "Full trends library access"
                    : company.tier === "SCALE"
                    ? "Premium access with priority support"
                    : "Full administrative access"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Paid Seats</Label>
                <div className="text-2xl font-bold text-primary">
                  {users.filter(u => u.isPaidSeat).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Users with full dashboard and report access
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Team Members</Label>
                <div className="text-2xl font-bold text-muted-foreground">
                  {users.filter(u => !u.isPaidSeat).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Users with limited access (past research, public content)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Briefs Section - only active briefs */}
        {briefs.filter(b => ["new", "in_progress", "under_review"].includes(b.status)).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Live Briefs
              </CardTitle>
              <CardDescription>
                {briefs.filter(b => ["new", "in_progress", "under_review"].includes(b.status)).length} active brief(s) from this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {briefs.filter(b => ["new", "in_progress", "under_review"].includes(b.status)).map((brief) => {
                  const studyImage = getStudyTypeImage(brief.studyType);
                  const totalCredits = brief.basicCreditsUsed + brief.proCreditsUsed;
                  const allFiles = [...(brief.files || []), ...(brief.projectFileUrls || []).map((url, idx) => ({ 
                    id: `legacy-${idx}`, 
                    fileName: url.split("/").pop() || "file", 
                    url,
                    fileSize: 0,
                    mimeType: "application/octet-stream"
                  }))];
                  const attachmentCount = allFiles.length;
                  const conceptCount = brief.concepts?.length || brief.numIdeas || 0;
                  const competitorCount = brief.competitors?.length || 0;
                  
                  return (
                    <Card key={brief.id} className="overflow-hidden border" data-testid={`card-brief-${brief.id}`}>
                      <div className="flex flex-col md:flex-row">
                        {/* Study Type Image */}
                        {studyImage && (
                          <div className="w-full md:w-32 h-24 md:h-auto flex-shrink-0 bg-muted">
                            <img 
                              src={studyImage} 
                              alt={formatStudyType(brief.studyType)} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Main Content */}
                        <div className="flex-1 p-4">
                          {/* Header Row */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <Badge variant="secondary" className="text-xs font-medium">
                                  {formatStudyType(brief.studyType)}
                                </Badge>
                                <Badge className={`text-xs ${getBriefStatusColor(brief.status)}`}>
                                  {formatBriefStatus(brief.status)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(brief.createdAt)}
                                </span>
                              </div>
                              <h4 className="font-medium text-sm mb-1 line-clamp-2" title={brief.researchObjective}>
                                {brief.researchObjective}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Submitted by <span className="font-medium">{brief.submittedByName}</span>
                                {brief.submittedByEmail && <span className="ml-1">({brief.submittedByEmail})</span>}
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditBrief(brief)}
                                data-testid={`button-edit-brief-${brief.id}`}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setBriefToDelete(brief);
                                  setDeleteBriefOpen(true);
                                }}
                                data-testid={`button-delete-brief-${brief.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Stats Row */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              <span>{conceptCount} concept{conceptCount !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              <span>{competitorCount} competitor{competitorCount !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              <span>{attachmentCount} file{attachmentCount !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              <span>{totalCredits} credit{totalCredits !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                          
                          {/* Files Download Section */}
                          {allFiles.length > 0 && (
                            <div className="border-t pt-3">
                              <p className="text-xs font-medium mb-2 flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                Attached Files
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {allFiles.map((file, idx) => {
                                  const fileUrl = typeof file === 'string' ? file : file.url;
                                  const fileName = typeof file === 'string' 
                                    ? file.split("/").pop() || "file" 
                                    : file.fileName;
                                  const publicUrl = fileUrl.includes("/api/files/briefs/") 
                                    ? fileUrl.replace("/api/files/", "/api/public/brief-files/")
                                    : fileUrl;
                                  
                                  return (
                                    <Button
                                      key={typeof file === 'string' ? idx : file.id}
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                      asChild
                                    >
                                      <a href={publicUrl} target="_blank" rel="noopener noreferrer" download>
                                        <Download className="w-3 h-3 mr-1" />
                                        {fileName.length > 20 ? fileName.slice(0, 17) + "..." : fileName}
                                      </a>
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credits Section - Compact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4" />
                  Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  {/* Basic Credits */}
                  <div className="flex items-center justify-between p-2 rounded-md border">
                    <div>
                      <p className="text-xs text-muted-foreground">Test24 Basic</p>
                      <p className="text-lg font-semibold">{basicRemaining}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateCredits("basic", -1)}
                        disabled={company.basicCreditsTotal <= 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateCredits("basic", 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Pro Credits */}
                  <div className="flex items-center justify-between p-2 rounded-md border">
                    <div>
                      <p className="text-xs text-muted-foreground">Test24 Pro</p>
                      <p className="text-lg font-semibold">{proRemaining}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateCredits("pro", -1)}
                        disabled={company.proCreditsTotal <= 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleUpdateCredits("pro", 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
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
                        <TableHead>Paid Seat</TableHead>
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
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.isPaidSeat || false}
                                onCheckedChange={() => handleTogglePaidSeat(user.id, user.isPaidSeat || false)}
                                data-testid={`switch-paid-seat-${user.id}`}
                              />
                              <Badge 
                                variant="outline" 
                                className={user.isPaidSeat 
                                  ? "bg-amber-100 text-amber-700 border-amber-200 text-xs" 
                                  : "bg-muted text-muted-foreground text-xs"
                                }
                              >
                                {user.isPaidSeat ? "Paid Seat" : "Team Member"}
                              </Badge>
                            </div>
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
                                {formatStudyType(report.studyType)}
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
                            onClick={() => setLocation("/portal/research")}
                          >
                            <Eye className="w-4 h-4" />
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

            {/* Research Log - Past/Completed Briefs */}
            {briefs.filter(b => ["completed", "on_hold", "cancelled"].includes(b.status)).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    Research Log
                  </CardTitle>
                  <CardDescription>
                    {briefs.filter(b => ["completed", "on_hold", "cancelled"].includes(b.status)).length} past brief(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {briefs
                      .filter(b => ["completed", "on_hold", "cancelled"].includes(b.status))
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((brief) => (
                        <div
                          key={brief.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          data-testid={`row-past-brief-${brief.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {formatStudyType(brief.studyType)}
                              </Badge>
                              <Badge className={`text-xs ${getBriefStatusColor(brief.status)}`}>
                                {formatBriefStatus(brief.status)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(brief.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm truncate" title={brief.researchObjective}>
                              {brief.researchObjective}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {brief.submittedByName}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0 ml-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBrief(brief)}
                              data-testid={`button-edit-past-brief-${brief.id}`}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setBriefToDelete(brief);
                                setDeleteBriefOpen(true);
                              }}
                              data-testid={`button-delete-past-brief-${brief.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Section */}
            <Card data-testid="card-company-activity">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Activity Log
                  </CardTitle>
                  <CardDescription>User activity for this company</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={activityRange} onValueChange={(v: "7d" | "14d" | "30d") => setActivityRange(v)}>
                    <SelectTrigger className="w-[120px]" data-testid="select-activity-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="14d">Last 14 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={fetchActivity} data-testid="button-refresh-activity">
                    <RefreshCw className={`w-4 h-4 ${activityLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activityLoading && !activitySummary ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : activitySummary ? (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg border text-center">
                        <LogIn className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-2xl font-bold" data-testid="text-activity-logins">{activitySummary.logins}</p>
                        <p className="text-xs text-muted-foreground">Logins</p>
                      </div>
                      <div className="p-3 rounded-lg border text-center">
                        <Eye className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-2xl font-bold" data-testid="text-activity-views">{activitySummary.reportViews}</p>
                        <p className="text-xs text-muted-foreground">Report Views</p>
                      </div>
                      <div className="p-3 rounded-lg border text-center">
                        <Download className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-2xl font-bold" data-testid="text-activity-downloads">{activitySummary.reportDownloads}</p>
                        <p className="text-xs text-muted-foreground">Downloads</p>
                      </div>
                      <div className="p-3 rounded-lg border text-center">
                        <BarChart3 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-2xl font-bold" data-testid="text-activity-total">{activitySummary.totalEvents}</p>
                        <p className="text-xs text-muted-foreground">Total Actions</p>
                      </div>
                    </div>

                    {/* User Breakdown */}
                    {activitySummary.byUser && activitySummary.byUser.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">User Breakdown</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead className="text-center">Logins</TableHead>
                              <TableHead className="text-center">Views</TableHead>
                              <TableHead className="text-center">Downloads</TableHead>
                              <TableHead className="text-center">Total</TableHead>
                              <TableHead>Last Active</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activitySummary.byUser.map((u: any) => (
                              <TableRow key={u.userId} data-testid={`row-user-activity-${u.userId}`}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{u.userName} {u.userSurname}</p>
                                    <p className="text-xs text-muted-foreground">{u.userEmail}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">{u.logins}</TableCell>
                                <TableCell className="text-center">{u.reportViews}</TableCell>
                                <TableCell className="text-center">{u.reportDownloads}</TableCell>
                                <TableCell className="text-center font-medium">{u.totalActions}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {u.lastActive ? new Date(u.lastActive).toLocaleDateString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Recent Events */}
                    {activityEvents.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Recent Events</h4>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {activityEvents.slice(0, 100).map((ev: any) => (
                              <div key={ev.id} className="flex items-start gap-3 p-2 rounded-lg border text-sm" data-testid={`row-activity-event-${ev.id}`}>
                                <div className="flex-shrink-0 mt-0.5">
                                  {ev.actionType === "login" && <LogIn className="w-3.5 h-3.5 text-blue-500" />}
                                  {ev.actionType === "view_report" && <Eye className="w-3.5 h-3.5 text-green-500" />}
                                  {ev.actionType === "download_report" && <Download className="w-3.5 h-3.5 text-purple-500" />}
                                  {ev.actionType === "view_trends" && <TrendingUp className="w-3.5 h-3.5 text-amber-500" />}
                                  {ev.actionType === "launch_brief" && <Target className="w-3.5 h-3.5 text-red-500" />}
                                  {ev.actionType === "view_past_research" && <Clock className="w-3.5 h-3.5 text-cyan-500" />}
                                  {ev.actionType === "view_client_report" && <Eye className="w-3.5 h-3.5 text-violet-500" />}
                                  {!["login", "view_report", "download_report", "view_trends", "launch_brief", "view_past_research", "view_client_report"].includes(ev.actionType) && <Activity className="w-3.5 h-3.5 text-muted-foreground" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium">
                                    {ev.userName} {ev.userSurname}
                                    <span className="font-normal text-muted-foreground ml-1">
                                      {ev.actionType === "login" && "logged in"}
                                      {ev.actionType === "view_report" && `viewed "${ev.entityName || "a report"}"`}
                                      {ev.actionType === "download_report" && `downloaded "${ev.entityName || "a report"}"`}
                                      {ev.actionType === "download_client_report" && `downloaded client report "${ev.entityName || ""}"`}
                                      {ev.actionType === "view_trends" && "viewed Trends & Insights"}
                                      {ev.actionType === "view_past_research" && "viewed Past Research"}
                                      {ev.actionType === "launch_brief" && `launched a brief${ev.entityName ? `: "${ev.entityName}"` : ""}`}
                                      {ev.actionType === "view_deals" && "viewed Member Offers"}
                                      {ev.actionType === "view_dashboard" && "visited Dashboard"}
                                      {ev.actionType === "view_settings" && "visited Settings"}
                                      {ev.actionType === "view_credits" && "viewed Credits & Billing"}
                                      {ev.actionType === "view_client_report" && `viewed report${ev.entityName ? `: "${ev.entityName}"` : ""}`}
                                    </span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(ev.createdAt).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {activitySummary.totalEvents === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No activity recorded for this period
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activity data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Stats & Notes */}
          <div className="space-y-6">
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

            {/* Notes */}
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
          </div>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={(open) => {
        setAddUserOpen(open);
        if (!open) {
          setAddUserTab("create");
          setNewUser({ name: "", email: "", phone: "" });
          setSelectedExistingUser("");
          setExistingUserSearch("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Add a user to {company.name}</DialogDescription>
          </DialogHeader>
          
          <Tabs value={addUserTab} onValueChange={(v) => setAddUserTab(v as "create" | "existing")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" data-testid="tab-create-user">Create New</TabsTrigger>
              <TabsTrigger value="existing" data-testid="tab-existing-user">Add Existing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Full name"
                  data-testid="input-new-user-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@company.com"
                  data-testid="input-new-user-email"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+27..."
                  data-testid="input-new-user-phone"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
                <Button onClick={handleAddUser} disabled={addingUser} data-testid="button-create-new-user">
                  {addingUser ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create User
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="existing" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Search Users</Label>
                <Input
                  placeholder="Search by name or email..."
                  value={existingUserSearch}
                  onChange={(e) => setExistingUserSearch(e.target.value)}
                  data-testid="input-search-existing-users"
                />
              </div>
              
              {loadingAvailableUsers ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  Loading users...
                </div>
              ) : filteredAvailableUsers.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {existingUserSearch ? "No matching users found" : "No available users to assign"}
                </div>
              ) : (
                <ScrollArea className="h-[200px] border rounded-md">
                  <div className="p-2 space-y-1">
                    {filteredAvailableUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedExistingUser(user.id)}
                        className={`p-2 rounded-md cursor-pointer transition-colors ${
                          selectedExistingUser === user.id 
                            ? "bg-primary/10 border border-primary" 
                            : "hover-elevate border border-transparent"
                        }`}
                        data-testid={`select-user-${user.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {(user.name || user.email || "?").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name || "No name"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          {user.companyId && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              Has company
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
              
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleAssignExistingUser} 
                  disabled={addingUser || !selectedExistingUser}
                  data-testid="button-assign-existing-user"
                >
                  {addingUser ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Add to Company
                </Button>
              </div>
            </TabsContent>
          </Tabs>
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

      {/* Edit Brief Dialog */}
      <Dialog open={editBriefOpen} onOpenChange={setEditBriefOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Brief</DialogTitle>
            <DialogDescription>
              Update the status and notes for this brief submission.
            </DialogDescription>
          </DialogHeader>
          {editingBrief && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatStudyType(editingBrief.studyType)}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{editingBrief.researchObjective}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted by {editingBrief.submittedByName} on {formatDate(editingBrief.createdAt)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={briefEditForm.status}
                  onValueChange={(value) => setBriefEditForm({ ...briefEditForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={briefEditForm.notes}
                  onChange={(e) => setBriefEditForm({ ...briefEditForm, notes: e.target.value })}
                  placeholder="Add internal notes about this brief..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Concepts:</span> {editingBrief.concepts?.length || editingBrief.numIdeas}
                </div>
                <div>
                  <span className="font-medium">Competitors:</span> {editingBrief.competitors?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Basic Credits:</span> {editingBrief.basicCreditsUsed}
                </div>
                <div>
                  <span className="font-medium">Pro Credits:</span> {editingBrief.proCreditsUsed}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBriefOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveBrief} disabled={savingBrief}>
              {savingBrief ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Brief Confirmation */}
      <AlertDialog open={deleteBriefOpen} onOpenChange={setDeleteBriefOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brief</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this brief submission? This action cannot be undone.
              {briefToDelete && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>{formatStudyType(briefToDelete.studyType)}</strong>: {briefToDelete.researchObjective.slice(0, 100)}...
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBrief}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingBrief}
            >
              {deletingBrief ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete Brief
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalLayout>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Mail, 
  Search, 
  Building2, 
  Users, 
  Calendar, 
  RefreshCw, 
  Crown, 
  Zap,
  MoreVertical,
  Eye,
  Edit,
  Loader2,
  Activity,
  Download,
  FileText,
  CreditCard,
  Trash2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import type { MailerSubscription } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  userId: string | null;
  payfastToken: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string | null;
  planType: string;
  amount: string;
  currency: string;
  frequency: number;
  cyclesTotal: number;
  cyclesCompleted: number;
  status: string;
  nextBillingDate: string | null;
  startDate: string;
  cancelledAt: string | null;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  membershipTier: string;
  companyId: string | null;
  createdAt: string;
  updatedAt?: string;
  pulseSubscribed?: boolean;
}

interface Company {
  id: string;
  name: string;
  basicCreditsTotal?: number;
  basicCreditsUsed?: number;
  proCreditsTotal?: number;
  proCreditsUsed?: number;
}

interface Study {
  id: string;
  companyId: string | null;
  submittedByEmail: string;
  status: string;
  createdAt: string;
}

const industryLabels: Record<string, string> = {
  beverage: "Food & Beverage",
  retail: "Retail",
  financial: "Financial Services",
  technology: "Technology",
  healthcare: "Healthcare",
  manufacturing: "Manufacturing",
  media: "Media & Entertainment",
  other: "Other",
};

const tierColors: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400",
  STARTER: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  GROWTH: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  SCALE: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function AdminMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editTierOpen, setEditTierOpen] = useState(false);
  const [newTier, setNewTier] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCompanyId, setEditCompanyId] = useState("");
  const [editMemberTier, setEditMemberTier] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);
  const { toast } = useToast();

  const { data: pulseSubscribers = [], isLoading: loadingPulse, refetch: refetchPulse } = useQuery<MailerSubscription[]>({
    queryKey: ["/api/admin/mailer-subscriptions"],
  });

  const { data: paymentSubscriptions = [], isLoading: loadingSubs, refetch: refetchSubs } = useQuery<Subscription[]>({
    queryKey: ["/api/admin/subscriptions"],
  });

  const { data: users = [], isLoading: loadingUsers, refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/admin/companies"],
  });

  const { data: studies = [] } = useQuery<Study[]>({
    queryKey: ["/api/admin/studies"],
  });

  const isLoading = loadingPulse || loadingSubs || loadingUsers;

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: { membershipTier?: string; companyId?: string; name?: string } }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      setEditTierOpen(false);
      setEditMode(false);
      setDetailsOpen(false);
      toast({ title: "Member updated", description: "Member details have been updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message || "Failed to update member.", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      if (!res.ok) {
        throw new Error("Failed to delete user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      toast({ title: "Member deleted", description: "The member has been permanently deleted." });
    },
    onError: (error: any) => {
      toast({ title: "Delete failed", description: error.message || "Failed to delete member.", variant: "destructive" });
    },
  });

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      deleteUserMutation.mutate(memberToDelete.id);
    }
  };

  const handleStartEdit = () => {
    if (selectedMember) {
      setEditName(selectedMember.name || "");
      setEditCompanyId(selectedMember.companyId || "none");
      setEditMemberTier(selectedMember.membershipTier || "FREE");
      setEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleSaveMember = () => {
    if (!selectedMember) return;
    updateUserMutation.mutate({
      userId: selectedMember.id,
      data: {
        name: editName,
        companyId: editCompanyId,
        membershipTier: editMemberTier,
      },
    });
  };

  const handleRefresh = () => {
    refetchPulse();
    refetchSubs();
    refetchUsers();
  };

  const companyMap = useMemo(() => {
    const map: Record<string, Company> = {};
    companies.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [companies]);

  const pulseEmailMap = useMemo(() => {
    const map: Record<string, MailerSubscription> = {};
    pulseSubscribers.forEach((sub) => {
      map[sub.email.toLowerCase()] = sub;
    });
    return map;
  }, [pulseSubscribers]);

  const paymentEmailMap = useMemo(() => {
    const map: Record<string, Subscription> = {};
    paymentSubscriptions.forEach((sub) => {
      map[sub.customerEmail.toLowerCase()] = sub;
    });
    return map;
  }, [paymentSubscriptions]);

  const studiesByEmail = useMemo(() => {
    const map: Record<string, number> = {};
    studies.forEach((s) => {
      const email = s.submittedByEmail?.toLowerCase();
      if (email) {
        map[email] = (map[email] || 0) + 1;
      }
    });
    return map;
  }, [studies]);

  const members = useMemo(() => {
    return users
      .filter((u) => u.role === "MEMBER")
      .map((user) => {
        const pulseInfo = pulseEmailMap[user.email.toLowerCase()];
        const paymentInfo = paymentEmailMap[user.email.toLowerCase()];
        const company = user.companyId ? companyMap[user.companyId] : null;
        const studyCount = studiesByEmail[user.email.toLowerCase()] || 0;
        return {
          ...user,
          isPulseSubscriber: !!pulseInfo || user.pulseSubscribed === true,
          pulseInfo,
          hasActivePayment: paymentInfo?.status === "active",
          paymentInfo,
          companyName: company?.name || null,
          company,
          studyCount,
          basicCreditsRemaining: company ? (company.basicCreditsTotal || 0) - (company.basicCreditsUsed || 0) : 0,
          proCreditsRemaining: company ? (company.proCreditsTotal || 0) - (company.proCreditsUsed || 0) : 0,
        };
      });
  }, [users, pulseEmailMap, paymentEmailMap, companyMap, studiesByEmail]);

  const filteredMembers = useMemo(() => {
    let filtered = members;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.email.toLowerCase().includes(term) ||
          m.companyName?.toLowerCase().includes(term)
      );
    }
    
    if (tierFilter !== "all") {
      filtered = filtered.filter((m) => m.membershipTier === tierFilter);
    }

    if (companyFilter !== "all") {
      filtered = filtered.filter((m) => m.companyId === companyFilter);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [members, searchTerm, tierFilter, companyFilter]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTierBadge = (tier: string) => {
    const colorClass = tierColors[tier] || "bg-muted text-muted-foreground";
    return (
      <Badge variant="secondary" className={colorClass}>
        {tier === "SCALE" && <Crown className="w-3 h-3 mr-1" />}
        {tier === "GROWTH" && <Zap className="w-3 h-3 mr-1" />}
        {tier}
      </Badge>
    );
  };

  const handleEditTier = (member: any) => {
    setSelectedMember(member);
    setNewTier(member.membershipTier);
    setEditTierOpen(true);
  };

  const handleViewDetails = (member: any) => {
    setSelectedMember(member);
    setDetailsOpen(true);
  };

  const handleSaveTier = () => {
    if (selectedMember && newTier) {
      updateUserMutation.mutate({ userId: selectedMember.id, data: { membershipTier: newTier } });
    }
  };

  const handleExportCsv = () => {
    const headers = ["Name", "Email", "Company", "Tier", "Pulse Subscriber", "Payment Status", "Studies", "Joined"];
    const rows = filteredMembers.map(m => [
      m.name,
      m.email,
      m.companyName || "",
      m.membershipTier,
      m.isPulseSubscriber ? "Yes" : "No",
      m.hasActivePayment ? "Active" : (m.paymentInfo?.status || "None"),
      m.studyCount,
      formatDate(m.createdAt),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `members-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activePayments = paymentSubscriptions.filter((s) => s.status === "active").length;
  const pulseCount = pulseSubscribers.length;
  const uniqueCompanies = new Set(members.map((m) => m.companyName).filter(Boolean)).size;
  const tierCounts = {
    FREE: members.filter(m => m.membershipTier === "FREE").length,
    STARTER: members.filter(m => m.membershipTier === "STARTER").length,
    GROWTH: members.filter(m => m.membershipTier === "GROWTH").length,
    SCALE: members.filter(m => m.membershipTier === "SCALE").length,
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Loading members...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-2">Members & Subscribers</h2>
          <p className="text-muted-foreground">
            All portal members with Pulse Insights subscription status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} data-testid="button-export-members">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} data-testid="button-refresh-members">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#5865F2]/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#5865F2]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pulseCount}</p>
                <p className="text-xs text-muted-foreground">Pulse Subs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePayments}</p>
                <p className="text-xs text-muted-foreground">Active Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tierCounts.STARTER}</p>
                <p className="text-xs text-muted-foreground">Starter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tierCounts.GROWTH}</p>
                <p className="text-xs text-muted-foreground">Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tierCounts.SCALE}</p>
                <p className="text-xs text-muted-foreground">Scale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Portal Members
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-members"
                />
              </div>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-36" data-testid="select-tier-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="GROWTH">Growth</SelectItem>
                  <SelectItem value="SCALE">Scale</SelectItem>
                </SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-40" data-testid="select-company-filter">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || tierFilter !== "all" || companyFilter !== "all" ? "No members match your filters" : "No members yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Studies</TableHead>
                    <TableHead>Pulse</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <a 
                            href={`mailto:${member.email}`} 
                            className="text-sm text-primary hover:underline"
                          >
                            {member.email}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.companyName || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getTierBadge(member.membershipTier)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {member.basicCreditsRemaining || 0}B
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {member.proCreditsRemaining || 0}P
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-muted-foreground" />
                          <span>{member.studyCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.isPulseSubscriber ? (
                          <Badge className="bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20">
                            <Mail className="w-3 h-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {formatDate(member.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-member-actions-${member.id}`}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(member)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedMember(member);
                              setEditName(member.name || "");
                              setEditCompanyId(member.companyId || "none");
                              setEditMemberTier(member.membershipTier || "FREE");
                              setEditMode(true);
                              setDetailsOpen(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Member
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${member.email}`}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setMemberToDelete(member);
                                setDeleteDialogOpen(true);
                              }}
                              data-testid={`button-delete-member-${member.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#5865F2]" />
            Pulse Insights Newsletter Subscribers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            All {pulseCount} subscribers to the Pulse Insights newsletter, including non-members.
          </p>
          {pulseSubscribers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No newsletter subscribers yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Subscribed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pulseSubscribers.map((sub) => (
                    <TableRow key={sub.id} data-testid={`row-pulse-${sub.id}`}>
                      <TableCell className="font-medium">{sub.name}</TableCell>
                      <TableCell>
                        <a 
                          href={`mailto:${sub.email}`} 
                          className="text-primary hover:underline"
                        >
                          {sub.email}
                        </a>
                      </TableCell>
                      <TableCell>{sub.company}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {industryLabels[sub.industry] || sub.industry}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(sub.subscribedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={(open) => {
        setDetailsOpen(open);
        if (!open) setEditMode(false);
      }}>
        <DialogContent className="max-w-md" data-testid="dialog-member-details">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Member" : "Member Details"}</DialogTitle>
            <DialogDescription>{selectedMember?.email}</DialogDescription>
          </DialogHeader>
          {selectedMember && !editMode && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedMember.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tier</Label>
                  <div className="mt-1">{getTierBadge(selectedMember.membershipTier)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Company</Label>
                  <p className="font-medium">{selectedMember.companyName || "Not assigned"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Joined</Label>
                  <p>{formatDate(selectedMember.createdAt)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-xs text-muted-foreground">Credits Remaining</Label>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary">{selectedMember.basicCreditsRemaining} Basic</Badge>
                  <Badge variant="outline">{selectedMember.proCreditsRemaining} Pro</Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-xs text-muted-foreground">Activity</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedMember.studyCount} studies submitted</span>
                </div>
              </div>

              <div className="border-t pt-4 flex gap-2">
                <Button variant="default" size="sm" onClick={handleStartEdit} data-testid="button-edit-member">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Member
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${selectedMember.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </a>
                </Button>
              </div>
            </div>
          )}

          {selectedMember && editMode && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Member name"
                    data-testid="input-edit-name"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-tier">Membership Tier</Label>
                  <Select value={editMemberTier} onValueChange={setEditMemberTier}>
                    <SelectTrigger data-testid="select-edit-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FREE">Free</SelectItem>
                      <SelectItem value="STARTER">Starter</SelectItem>
                      <SelectItem value="GROWTH">Growth</SelectItem>
                      <SelectItem value="SCALE">Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-company">Assign to Company</Label>
                  <Select value={editCompanyId} onValueChange={setEditCompanyId}>
                    <SelectTrigger data-testid="select-edit-company">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No company (unassigned)</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assigning to a company will add this member to the company's user list
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSaveMember}
                  disabled={updateUserMutation.isPending}
                  data-testid="button-save-member"
                >
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editTierOpen} onOpenChange={setEditTierOpen}>
        <DialogContent className="max-w-sm" data-testid="dialog-edit-tier">
          <DialogHeader>
            <DialogTitle>Edit Membership Tier</DialogTitle>
            <DialogDescription>
              Change tier for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Tier</Label>
              <Select value={newTier} onValueChange={setNewTier}>
                <SelectTrigger data-testid="select-new-tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="GROWTH">Growth</SelectItem>
                  <SelectItem value="SCALE">Scale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditTierOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveTier} 
                disabled={updateUserMutation.isPending}
                data-testid="button-save-tier"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to permanently delete this member?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToDelete && (
                <>
                  You are about to permanently delete <strong>{memberToDelete.name || memberToDelete.email}</strong>. 
                  This action cannot be undone and will remove all of their data from the system.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

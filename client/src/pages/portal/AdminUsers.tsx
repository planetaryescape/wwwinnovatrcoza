import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  RefreshCw, 
  User, 
  Mail, 
  Building2,
  Calendar,
  CreditCard,
  Wallet,
  Activity,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Crown,
  Zap,
  FileSpreadsheet,
  Trash2,
  UserMinus
} from "lucide-react";
import NewUserModal from "./NewUserModal";
import { useToast } from "@/hooks/use-toast";
import { exportUsersToCSV } from "@/lib/csvExport";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  companyId: string | null;
  membershipTier: string;
  role: string;
  status: string;
  creditsBasic: number;
  creditsPro: number;
  totalSpend?: string;
  firstProjectDate?: string | null;
  lastProjectDate?: string | null;
  lastActivityDate?: string | null;
  internalNotes?: string | null;
  pulseSubscribed?: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface Company {
  id: string;
  name: string;
}

interface Subscription {
  id: string;
  customerEmail: string;
  planType: string;
  status: string;
  cyclesCompleted: number;
  cyclesTotal: number;
}

const tierConfig: Record<string, { label: string; color: string; icon: any }> = {
  STARTER: { label: "Starter", color: "bg-gray-100 text-gray-700", icon: User },
  GROWTH: { label: "Growth", color: "bg-violet-100 text-violet-700", icon: TrendingUp },
  SCALE: { label: "Scale", color: "bg-amber-100 text-amber-700", icon: Crown },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-700" },
  SUSPENDED: { label: "Suspended", color: "bg-red-100 text-red-700" },
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, subsRes, companiesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/subscriptions"),
        fetch("/api/admin/companies"),
      ]);
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData = await usersRes.json();
      setUsers(usersData);
      
      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubscriptions(subsData);
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUserSubscription = (email: string) => {
    return subscriptions.find((s) => s.customerEmail === email && s.status === "active");
  };

  useEffect(() => {
    let filtered = users;
    
    if (search) {
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.company?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (tierFilter !== "all") {
      filtered = filtered.filter(u => u.membershipTier === tierFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(u => u.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  }, [users, search, tierFilter, statusFilter]);

  const stats = {
    total: users.length,
    starter: users.filter(u => u.membershipTier === "STARTER").length,
    growth: users.filter(u => u.membershipTier === "GROWTH").length,
    scale: users.filter(u => u.membershipTier === "SCALE").length,
    active: users.filter(u => u.status === "ACTIVE").length,
  };

  const handleOpenProfile = (user: AdminUser) => {
    setSelectedUser(user);
    setEditNotes(user.internalNotes || "");
    setDrawerOpen(true);
  };

  const handleUpdateUser = async (userId: string, updates: Partial<AdminUser>) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update user");

      setUsers(users.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, ...updates });
      }

      toast({
        title: "User Updated",
        description: "Changes saved successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedUser) return;
    await handleUpdateUser(selectedUser.id, { internalNotes: editNotes });
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      if (selectedUser?.id === userToDelete.id) {
        setDrawerOpen(false);
        setSelectedUser(null);
      }
      
      toast({
        title: "User Deleted",
        description: "User has been removed from the system",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (user: AdminUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string | number | undefined) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    return `R${num.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 
            className="text-2xl font-bold mb-1 text-gray-900"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            Users Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage user accounts, memberships, and activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => exportUsersToCSV(users)} 
            className="rounded-full"
            data-testid="button-export-users"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={() => setModalOpen(true)} 
            className="rounded-full"
            style={{ backgroundColor: '#0033A0' }}
            data-testid="button-new-user"
          >
            <Plus className="w-4 h-4 mr-2" />
            New User
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Users className="w-5 h-5 text-[#0033A0]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-50">
                <User className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.starter}</p>
                <p className="text-xs text-muted-foreground">Starter</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <TrendingUp className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.growth}</p>
                <p className="text-xs text-muted-foreground">Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Crown className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.scale}</p>
                <p className="text-xs text-muted-foreground">Scale</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Zap className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[130px]" data-testid="select-tier-filter">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="GROWTH">Growth</SelectItem>
                  <SelectItem value="SCALE">Scale</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">User</TableHead>
                <TableHead className="font-medium w-28">Tier</TableHead>
                <TableHead className="font-medium w-24">Status</TableHead>
                <TableHead className="font-medium w-20 text-center">Pulse</TableHead>
                <TableHead className="font-medium w-28">Subscription</TableHead>
                <TableHead className="font-medium w-20 text-center">Basic</TableHead>
                <TableHead className="font-medium w-20 text-center">Pro</TableHead>
                <TableHead className="font-medium w-28">Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No users found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const tierStyle = tierConfig[user.membershipTier] || tierConfig.STARTER;
                  const statusStyle = statusConfig[user.status] || statusConfig.ACTIVE;
                  const sub = getUserSubscription(user.email);
                  
                  return (
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleOpenProfile(user)}
                      data-testid={`row-user-${user.id}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{user.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${tierStyle.color} border-0`}>
                          {tierStyle.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusStyle.color} border-0`}>
                          {statusStyle.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {user.pulseSubscribed ? (
                          <Badge className="bg-blue-50 text-blue-700 border-0 text-xs">
                            <Mail className="w-3 h-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {sub ? (
                          <Badge className="bg-green-50 text-green-700 border-0 text-xs">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            {sub.cyclesCompleted}/{sub.cyclesTotal}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-gray-700">{user.creditsBasic}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-gray-700">{user.creditsPro}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-600">
                          {formatDate(user.lastActivityDate || user.lastLoginAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </Card>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedUser && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <SheetTitle 
                        className="text-xl"
                        style={{ fontFamily: 'DM Serif Display, serif' }}
                      >
                        {selectedUser.name || "Unnamed User"}
                      </SheetTitle>
                      <SheetDescription>{selectedUser.email}</SheetDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => confirmDelete(selectedUser)}
                    className="text-destructive hover:text-destructive"
                    data-testid="button-delete-user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm">Company</Label>
                    </div>
                    <Select
                      value={selectedUser.companyId || "independent"}
                      onValueChange={(val) => {
                        const selectedCompany = val !== "independent" 
                          ? companies.find(c => c.id === val) 
                          : null;
                        handleUpdateUser(selectedUser.id, { 
                          companyId: val !== "independent" ? val : null,
                          company: selectedCompany?.name || null
                        });
                      }}
                    >
                      <SelectTrigger className="w-40" data-testid="drawer-select-company">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="independent">
                          <div className="flex items-center gap-2">
                            <UserMinus className="w-4 h-4 text-muted-foreground" />
                            <span>Independent</span>
                          </div>
                        </SelectItem>
                        {[...companies].sort((a, b) => a.name.localeCompare(b.name)).map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm">Industry</Label>
                    </div>
                    <p className="text-sm font-medium">{(selectedUser as any).industry || "—"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-sm">Total Spend</Label>
                    </div>
                    <p className="text-sm font-medium">{formatCurrency(selectedUser.totalSpend)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Membership & Credits
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Membership Tier</Label>
                      <Select
                        value={selectedUser.membershipTier}
                        onValueChange={(val) => handleUpdateUser(selectedUser.id, { membershipTier: val })}
                      >
                        <SelectTrigger className="w-32" data-testid="drawer-select-tier">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STARTER">Starter</SelectItem>
                          <SelectItem value="GROWTH">Growth</SelectItem>
                          <SelectItem value="SCALE">Scale</SelectItem>
                          <SelectItem value="CUSTOM">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Status</Label>
                      <Select
                        value={selectedUser.status}
                        onValueChange={(val) => handleUpdateUser(selectedUser.id, { status: val })}
                      >
                        <SelectTrigger className="w-32" data-testid="drawer-select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Basic Credits</Label>
                      <Input
                        type="number"
                        value={selectedUser.creditsBasic}
                        onChange={(e) => handleUpdateUser(selectedUser.id, { creditsBasic: parseInt(e.target.value) || 0 })}
                        className="w-20 h-8"
                        data-testid="drawer-input-basic"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Pro Credits</Label>
                      <Input
                        type="number"
                        value={selectedUser.creditsPro}
                        onChange={(e) => handleUpdateUser(selectedUser.id, { creditsPro: parseInt(e.target.value) || 0 })}
                        className="w-20 h-8"
                        data-testid="drawer-input-pro"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Activity Timeline
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Account Created</span>
                      </div>
                      <span className="font-medium">{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>First Project</span>
                      </div>
                      <span className="font-medium">{formatDate(selectedUser.firstProjectDate)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>Last Project</span>
                      </div>
                      <span className="font-medium">{formatDate(selectedUser.lastProjectDate)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Last Login</span>
                      </div>
                      <span className="font-medium">{formatDate(selectedUser.lastLoginAt)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="w-4 h-4" />
                        <span>Last Activity</span>
                      </div>
                      <span className="font-medium">{formatDate(selectedUser.lastActivityDate)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Internal Notes
                  </h4>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add internal notes about this user..."
                    className="h-24 mb-2"
                    data-testid="drawer-textarea-notes"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSaveNotes}
                    disabled={editNotes === (selectedUser.internalNotes || "")}
                    className="rounded-full"
                    style={{ backgroundColor: '#0033A0' }}
                    data-testid="button-save-notes"
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <NewUserModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchData} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name || userToDelete?.email}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

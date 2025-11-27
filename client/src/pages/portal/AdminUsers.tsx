import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, RefreshCw } from "lucide-react";
import NewUserModal from "./NewUserModal";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  membershipTier: string;
  role: string;
  status: string;
  creditsBasic: number;
  creditsPro: number;
  createdAt: string;
  lastLoginAt: string | null;
}

interface Subscription {
  id: string;
  customerEmail: string;
  planType: string;
  status: string;
  cyclesCompleted: number;
  cyclesTotal: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, subsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/subscriptions"),
        ]);
        if (!usersRes.ok) throw new Error("Failed to fetch users");
        const usersData = await usersRes.json();
        setUsers(usersData);
        
        if (subsRes.ok) {
          const subsData = await subsRes.json();
          setSubscriptions(subsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
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
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (tierFilter !== "all") {
      filtered = filtered.filter(u => u.membershipTier === tierFilter);
    }
    
    setFilteredUsers(filtered);
  }, [users, search, tierFilter]);

  const handleRefresh = () => {
    fetchData();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, subsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/subscriptions"),
      ]);
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData = await usersRes.json();
      setUsers(usersData);
      
      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubscriptions(subsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-2">Users Management</h2>
          <p className="text-muted-foreground">Manage user accounts and memberships</p>
        </div>
        <Button onClick={() => setModalOpen(true)} data-testid="button-new-user">
          <Plus className="w-4 h-4 mr-2" />
          New User
        </Button>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-users"
                />
              </div>
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-40" data-testid="select-tier-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="GROWTH">Growth</SelectItem>
                <SelectItem value="SCALE">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-muted-foreground">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-muted-foreground">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Tier</th>
                    <th className="text-left py-2 px-2">Subscription</th>
                    <th className="text-left py-2 px-2">Role</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Basic Credits</th>
                    <th className="text-left py-2 px-2">Pro Credits</th>
                    <th className="text-left py-2 px-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50" data-testid={`row-user-${user.id}`}>
                      <td className="py-2 px-2">{user.name || "—"}</td>
                      <td className="py-2 px-2 text-xs">{user.email}</td>
                      <td className="py-2 px-2">
                        <Select
                          value={user.membershipTier}
                          onValueChange={(val) =>
                            handleUpdateUser(user.id, { membershipTier: val })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs" data-testid={`select-tier-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STARTER">Starter</SelectItem>
                            <SelectItem value="GROWTH">Growth</SelectItem>
                            <SelectItem value="SCALE">Scale</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2">
                        {(() => {
                          const sub = getUserSubscription(user.email);
                          if (sub) {
                            return (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                {sub.cyclesCompleted}/{sub.cyclesTotal}
                              </Badge>
                            );
                          }
                          return <span className="text-muted-foreground text-xs">—</span>;
                        })()}
                      </td>
                      <td className="py-2 px-2">
                        <Select
                          value={user.role}
                          onValueChange={(val) =>
                            handleUpdateUser(user.id, { role: val })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs" data-testid={`select-role-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="DEAL_ADMIN">Deal Admin</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2">
                        <Select
                          value={user.status}
                          onValueChange={(val) =>
                            handleUpdateUser(user.id, { status: val })
                          }
                        >
                          <SelectTrigger className="h-8 text-xs" data-testid={`select-status-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          value={user.creditsBasic}
                          onChange={(e) =>
                            handleUpdateUser(user.id, { creditsBasic: parseInt(e.target.value) })
                          }
                          className="h-8 text-xs w-16"
                          data-testid={`input-basic-credits-${user.id}`}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          value={user.creditsPro}
                          onChange={(e) =>
                            handleUpdateUser(user.id, { creditsPro: parseInt(e.target.value) })
                          }
                          className="h-8 text-xs w-16"
                          data-testid={`input-pro-credits-${user.id}`}
                        />
                      </td>
                      <td className="py-2 px-2 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <NewUserModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={handleRefresh} />
    </div>
  );
}

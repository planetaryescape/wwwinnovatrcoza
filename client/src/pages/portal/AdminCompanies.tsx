import { useEffect, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
}

const tierConfig: Record<string, { label: string; color: string; icon: any }> = {
  STARTER: { label: "Starter", color: "bg-muted text-muted-foreground", icon: UserIcon },
  GROWTH: { label: "Growth", color: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300", icon: TrendingUp },
  SCALE: { label: "Scale", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", icon: Crown },
};

export default function AdminCompanies() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");

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
    
    setFilteredCompanies(filtered);
  }, [companies, search, tierFilter]);

  const stats = {
    total: companies.length,
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
    setDrawerOpen(true);
    await fetchCompanyUsers(company.id);
  };

  const handleUpdateCompany = async (companyId: string, updates: Partial<Company>) => {
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update company");

      setCompanies(companies.map((c) => (c.id === companyId ? { ...c, ...updates } : c)));
      if (selectedCompany?.id === companyId) {
        setSelectedCompany({ ...selectedCompany, ...updates });
      }

      toast({
        title: "Company Updated",
        description: "Changes saved successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update company",
        variant: "destructive",
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedCompany) return;
    await handleUpdateCompany(selectedCompany.id, { notes: editNotes });
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
    return `R${num.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;
  };

  const getCreditsProgress = (used: number, total: number) => {
    if (total === 0) return 0;
    return (used / total) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">Company Accounts</h2>
          <p className="text-muted-foreground">Manage company contracts and credit pools</p>
        </div>
        <Button onClick={fetchCompanies} variant="outline" size="sm" data-testid="button-refresh-companies">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-companies">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scale Accounts</CardTitle>
            <Crown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-scale-companies">{stats.scale}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Basic Credits</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-basic-credits">
              {stats.usedBasicCredits}/{stats.totalBasicCredits}
            </div>
            <Progress value={getCreditsProgress(stats.usedBasicCredits, stats.totalBasicCredits)} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Credits</CardTitle>
            <Crown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-pro-credits">
              {stats.usedProCredits}/{stats.totalProCredits}
            </div>
            <Progress value={getCreditsProgress(stats.usedProCredits, stats.totalProCredits)} className="mt-2 h-1" />
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
                <SelectItem value="STARTER">Starter</SelectItem>
                <SelectItem value="GROWTH">Growth</SelectItem>
                <SelectItem value="SCALE">Scale</SelectItem>
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
                  <TableHead>Contract</TableHead>
                  <TableHead>Basic Credits</TableHead>
                  <TableHead>Pro Credits</TableHead>
                  <TableHead>Monthly Fee</TableHead>
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
                      </TableCell>
                      <TableCell>
                        <Badge className={tierInfo.color}>
                          <TierIcon className="w-3 h-3 mr-1" />
                          {tierInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(company.contractStart)} - {formatDate(company.contractEnd)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{company.basicCreditsTotal - company.basicCreditsUsed}</span>
                          <span className="text-muted-foreground text-sm">/ {company.basicCreditsTotal}</span>
                        </div>
                        <Progress 
                          value={getCreditsProgress(company.basicCreditsUsed, company.basicCreditsTotal)} 
                          className="mt-1 h-1 w-20" 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{company.proCreditsTotal - company.proCreditsUsed}</span>
                          <span className="text-muted-foreground text-sm">/ {company.proCreditsTotal}</span>
                        </div>
                        <Progress 
                          value={getCreditsProgress(company.proCreditsUsed, company.proCreditsTotal)} 
                          className="mt-1 h-1 w-20" 
                        />
                      </TableCell>
                      <TableCell>{company.monthlyFee ? formatCurrency(company.monthlyFee) : "—"}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenProfile(company)}
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
                <SheetTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {selectedCompany.name}
                </SheetTitle>
                <SheetDescription>
                  Company account details and credit management
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Domain</Label>
                    <p className="font-medium">{selectedCompany.domain || "—"}</p>
                  </div>
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
                          <SelectItem value="STARTER">Starter</SelectItem>
                          <SelectItem value="GROWTH">Growth</SelectItem>
                          <SelectItem value="SCALE">Scale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4" />
                    Contract Period
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <p className="font-medium">{formatDate(selectedCompany.contractStart)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End Date</Label>
                      <p className="font-medium">{formatDate(selectedCompany.contractEnd)}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label className="text-xs text-muted-foreground">Monthly Fee</Label>
                    <p className="font-medium text-lg">{selectedCompany.monthlyFee ? formatCurrency(selectedCompany.monthlyFee) : "—"}</p>
                  </div>
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

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Add Basic Credits</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="0"
                          className="w-20"
                          data-testid="input-add-basic-credits"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const value = parseInt((e.target as HTMLInputElement).value);
                              if (value > 0) {
                                handleUpdateCompany(selectedCompany.id, { 
                                  basicCreditsTotal: selectedCompany.basicCreditsTotal + value 
                                });
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
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
                          Add
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Add Pro Credits</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="0"
                          className="w-20"
                          data-testid="input-add-pro-credits"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const value = parseInt((e.target as HTMLInputElement).value);
                              if (value > 0) {
                                handleUpdateCompany(selectedCompany.id, { 
                                  proCreditsTotal: selectedCompany.proCreditsTotal + value 
                                });
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
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
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4" />
                    Company Users
                  </h4>
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
                          <div>
                            <p className="font-medium">{user.name || user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
                            {user.status}
                          </Badge>
                        </div>
                      ))}
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
    </div>
  );
}

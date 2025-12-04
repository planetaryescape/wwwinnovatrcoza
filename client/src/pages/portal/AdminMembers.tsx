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
import { useQuery } from "@tanstack/react-query";
import { Mail, Search, Building2, Users, CreditCard, Calendar, RefreshCw, Crown, Zap } from "lucide-react";
import { useState, useMemo } from "react";
import type { MailerSubscription } from "@shared/schema";

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
}

interface Company {
  id: string;
  name: string;
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
  STARTER: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  GROWTH: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  SCALE: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function AdminMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

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

  const isLoading = loadingPulse || loadingSubs || loadingUsers;

  const handleRefresh = () => {
    refetchPulse();
    refetchSubs();
    refetchUsers();
  };

  const companyMap = useMemo(() => {
    const map: Record<string, string> = {};
    companies.forEach((c) => {
      map[c.id] = c.name;
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

  const members = useMemo(() => {
    return users
      .filter((u) => u.role === "MEMBER")
      .map((user) => {
        const pulseInfo = pulseEmailMap[user.email.toLowerCase()];
        const paymentInfo = paymentEmailMap[user.email.toLowerCase()];
        return {
          ...user,
          isPulseSubscriber: !!pulseInfo,
          pulseInfo,
          hasActivePayment: paymentInfo?.status === "active",
          paymentInfo,
          companyName: user.companyId ? companyMap[user.companyId] : null,
        };
      });
  }, [users, pulseEmailMap, paymentEmailMap, companyMap]);

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
    
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [members, searchTerm, tierFilter]);

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

  const activePayments = paymentSubscriptions.filter((s) => s.status === "active").length;
  const pulseCount = pulseSubscribers.length;
  const uniqueCompanies = new Set(members.map((m) => m.companyName).filter(Boolean)).size;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading members...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-2">Members & Subscribers</h2>
          <p className="text-muted-foreground">
            All portal members with Pulse Insights subscription status
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh-members">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
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
                <p className="text-sm text-muted-foreground">Pulse Subscribers</p>
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
                <p className="text-sm text-muted-foreground">Active Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueCompanies}</p>
                <p className="text-sm text-muted-foreground">Companies</p>
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
            <div className="flex items-center gap-3">
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
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="GROWTH">Growth</SelectItem>
                  <SelectItem value="SCALE">Scale</SelectItem>
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
                {searchTerm || tierFilter !== "all" ? "No members match your filters" : "No members yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Pulse</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Joined</TableHead>
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
                      {member.isPulseSubscriber ? (
                        <Badge className="bg-[#5865F2]/10 text-[#5865F2] border-[#5865F2]/20">
                          <Mail className="w-3 h-3 mr-1" />
                          Subscribed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Not subscribed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.hasActivePayment ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CreditCard className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : member.paymentInfo ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          {member.paymentInfo.status}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(member.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </div>
  );
}

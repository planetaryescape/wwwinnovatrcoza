import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subscriptions");
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      const data = await res.json();
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    let filtered = subscriptions;

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          s.customerEmail?.toLowerCase().includes(search.toLowerCase()) ||
          s.customerCompany?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Sort by most recent first
    filtered = [...filtered].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredSubscriptions(filtered);
  }, [subscriptions, search, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Paused</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Completed</Badge>;
      case "expired":
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFrequencyLabel = (frequency: number) => {
    switch (frequency) {
      case 3:
        return "Monthly";
      case 4:
        return "Quarterly";
      case 5:
        return "Biannually";
      case 6:
        return "Annually";
      default:
        return `Every ${frequency}`;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: string) => {
    return `R${Number(amount).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-2">Subscriptions Management</h2>
          <p className="text-muted-foreground">
            View and manage recurring payment subscriptions
          </p>
        </div>
        <Button variant="outline" onClick={fetchSubscriptions} data-testid="button-refresh-subscriptions">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
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
                  placeholder="Search by name, email, or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-subscriptions"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-muted-foreground">Loading subscriptions...</p>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No subscriptions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Subscriptions will appear here when customers sign up for recurring billing
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Customer</th>
                    <th className="text-left py-2 px-2">Plan</th>
                    <th className="text-left py-2 px-2">Amount</th>
                    <th className="text-left py-2 px-2">Frequency</th>
                    <th className="text-left py-2 px-2">Progress</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Next Billing</th>
                    <th className="text-left py-2 px-2">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((subscription) => (
                    <tr
                      key={subscription.id}
                      className="border-b hover:bg-muted/50"
                      data-testid={`row-subscription-${subscription.id}`}
                    >
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{subscription.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {subscription.customerEmail}
                          </p>
                          {subscription.customerCompany && (
                            <p className="text-xs text-muted-foreground">
                              {subscription.customerCompany}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="capitalize">
                          {subscription.planType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {formatAmount(subscription.amount)}
                      </td>
                      <td className="py-3 px-2">
                        {getFrequencyLabel(subscription.frequency)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full max-w-20">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${(subscription.cyclesCompleted / subscription.cyclesTotal) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {subscription.cyclesCompleted}/{subscription.cyclesTotal}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">{getStatusBadge(subscription.status)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {formatDate(subscription.nextBillingDate)}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs">
                        {formatDate(subscription.startDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {subscriptions.filter((s) => s.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {subscriptions.filter((s) => s.status === "paused").length}
              </p>
              <p className="text-sm text-muted-foreground">Paused</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {subscriptions.filter((s) => s.status === "cancelled").length}
              </p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {subscriptions.filter((s) => s.status === "completed").length}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

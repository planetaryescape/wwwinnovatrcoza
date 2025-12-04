import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Eye, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  RefreshCw,
  Calendar,
  Building2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface OrderItem {
  id: string;
  orderId: string;
  type: string;
  description: string | null;
  quantity: number;
  unitAmount: string;
}

interface AdminOrder {
  id: string;
  customerName: string | null;
  customerEmail: string;
  customerCompany: string | null;
  amount: string;
  currency: string;
  purchaseType: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const CHART_COLORS = {
  primary: "#0033A0",
  secondary: "#7c3aed",
  success: "#22c55e",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (search) {
      filtered = filtered.filter(
        (o) =>
          o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
          o.purchaseType.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (companyFilter !== "all") {
      filtered = filtered.filter((o) => o.customerCompany === companyFilter);
    }

    filtered = [...filtered].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredOrders(filtered);
  }, [orders, search, statusFilter, companyFilter]);

  const companies = useMemo(() => 
    Array.from(new Set(orders.map(o => o.customerCompany).filter(Boolean))) as string[],
    [orders]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear();
    });

    const totalValue = orders.reduce((sum, o) => sum + parseFloat(o.amount || "0"), 0);
    const thisMonthValue = thisMonth.reduce((sum, o) => sum + parseFloat(o.amount || "0"), 0);

    return {
      total: orders.length,
      thisMonth: thisMonth.length,
      totalValue,
      thisMonthValue,
      averageOrder: orders.length > 0 ? totalValue / orders.length : 0,
      completed: orders.filter(o => o.status === "completed").length,
      pending: orders.filter(o => o.status === "pending").length,
    };
  }, [orders]);

  const ordersByMonth = useMemo(() => {
    const byMonth: Record<string, { month: string; orders: number; revenue: number }> = {};
    
    orders.forEach(o => {
      const date = new Date(o.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[key]) {
        byMonth[key] = { month: key, orders: 0, revenue: 0 };
      }
      byMonth[key].orders++;
      byMonth[key].revenue += parseFloat(o.amount || "0");
    });

    return Object.values(byMonth)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [orders]);

  const ordersByType = useMemo(() => {
    const byType: Record<string, { type: string; count: number; revenue: number }> = {};
    
    orders.forEach(o => {
      const type = o.purchaseType || "Other";
      if (!byType[type]) {
        byType[type] = { type, count: 0, revenue: 0 };
      }
      byType[type].count++;
      byType[type].revenue += parseFloat(o.amount || "0");
    });

    return Object.values(byType).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  const formatPrice = (price: string | number) => {
    return `R${Number(price).toLocaleString("en-ZA")}`;
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-ZA", { month: "short" });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      processing: "default",
      completed: "default",
      failed: "destructive",
    };
    return variants[status] || "outline";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || "";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update order status");

      const updatedOrder = await res.json();
      setOrders(orders.map(o => o.id === orderId ? { ...updatedOrder, items: o.items } : o));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...updatedOrder, items: selectedOrder.items });
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-1">Orders Management</h2>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading} data-testid="button-refresh-orders">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
                <p className="text-xs text-muted-foreground">Orders This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatPrice(stats.thisMonthValue)}</p>
                <p className="text-xs text-muted-foreground">This Month Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatPrice(stats.averageOrder)}</p>
                <p className="text-xs text-muted-foreground">Average Order</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Orders & Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByMonth.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersByMonth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={11} tickFormatter={formatMonth} />
                    <YAxis yAxisId="left" fontSize={11} />
                    <YAxis yAxisId="right" orientation="right" fontSize={11} tickFormatter={(v) => `R${v/1000}k`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? formatPrice(value) : value,
                        name === "revenue" ? "Revenue" : "Orders"
                      ]}
                      labelFormatter={formatMonth}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="orders" name="Orders" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS.success} strokeWidth={2} dot={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No order data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue by Product Type</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByType.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={11} tickFormatter={(v) => `R${v/1000}k`} />
                    <YAxis type="category" dataKey="type" width={120} fontSize={11} tickLine={false} />
                    <Tooltip formatter={(value: number) => formatPrice(value)} />
                    <Bar dataKey="revenue" fill={CHART_COLORS.secondary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No order data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, email, or purchase type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-orders"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-48" data-testid="select-company-filter">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading orders...</p>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover-elevate" data-testid={`card-order-${order.id}`}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm" data-testid={`text-order-id-${order.id}`}>
                        Order #{order.id.substring(0, 8)}
                      </p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customer: {order.customerName || "Unknown"} ({order.customerEmail})
                    </p>
                    {order.customerCompany && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {order.customerCompany}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Purchase: {order.purchaseType}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Date: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-bold text-lg">
                      {formatPrice(order.amount)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                      data-testid={`button-view-order-${order.id}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-order-details">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      {selectedOrder.customerName || "Unknown"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {selectedOrder.customerEmail}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Company:</span>{" "}
                      {selectedOrder.customerCompany || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Order Information</h4>
                  <div className="space-y-3 text-sm">
                    <p>
                      <span className="text-muted-foreground">Purchase Type:</span>{" "}
                      {selectedOrder.purchaseType}
                    </p>
                    <div>
                      <label className="text-muted-foreground text-xs mb-1 block">Status</label>
                      <Select value={selectedOrder.status} onValueChange={(status) => handleUpdateStatus(selectedOrder.id, status)} disabled={updatingStatus}>
                        <SelectTrigger className="w-40" data-testid={`select-order-status-${selectedOrder.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p>
                      <span className="text-muted-foreground">Date:</span>{" "}
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Total:</span>{" "}
                      <span className="font-semibold">
                        {formatPrice(selectedOrder.amount)}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-2 text-sm border rounded-lg p-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start pb-2 border-b last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{item.description || item.type}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-right">
                          {formatPrice(
                            String(
                              Number(item.unitAmount) * item.quantity
                            )
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

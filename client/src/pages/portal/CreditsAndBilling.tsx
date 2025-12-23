import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Download, Package, CheckCircle, Clock, AlertCircle, FileText } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import OrderFormDialog from "@/components/OrderFormDialog";
import type { Order } from "@shared/schema";

const mockCreditPackages = [
  {
    type: "Basic",
    credits: 1,
    price: 5000,
    regularPrice: 10000,
    savings: 50,
  },
  {
    type: "Basic",
    credits: 10,
    price: 45000,
    regularPrice: 100000,
    savings: 55,
  },
  {
    type: "Pro",
    credits: 1,
    price: 45000,
    regularPrice: 50000,
    savings: 10,
  },
  {
    type: "Pro",
    credits: 3,
    price: 120000,
    regularPrice: 150000,
    savings: 20,
  },
];

const mockBillingHistory = [
  {
    id: "INV-2024-11-001",
    date: "2024-11-01",
    description: "Growth Membership Annual Renewal",
    amount: 180000,
    status: "paid",
  },
  {
    id: "INV-2024-10-024",
    date: "2024-10-15",
    description: "Test24 Basic Credit Pack (10x)",
    amount: 45000,
    status: "paid",
  },
  {
    id: "INV-2024-09-018",
    date: "2024-09-22",
    description: "Test24 Pro Study",
    amount: 45000,
    status: "paid",
  },
];

export default function CreditsAndBilling() {
  const [, setLocation] = useLocation();
  const { isPaidMember, user, company: authCompany } = useAuth();
  const { formatPrice } = useCurrency();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedPack, setSelectedPack] = useState<typeof mockCreditPackages[0] | null>(null);

  // Fetch fresh company data to ensure credits are up-to-date
  const { data: freshCompany } = useQuery({
    queryKey: ['/api/member/company', user?.companyId],
    queryFn: async () => {
      const response = await fetch(`/api/member/company?companyId=${user?.companyId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.companyId,
  });

  // Use fresh company data if available, otherwise fall back to auth context
  const company = freshCompany || authCompany;

  // Fetch user's orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/member/orders', { email: user?.email }],
    queryFn: async () => {
      const response = await fetch(`/api/member/orders?email=${encodeURIComponent(user?.email || '')}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: !!user?.email,
  });

  // Separate pending invoice orders from completed/paid orders
  // Pending invoice orders: invoiceRequested=true AND status=pending
  // Completed orders: Any order that is paid, completed, or any non-pending invoice order
  const pendingInvoiceOrders = orders.filter(
    (order) => order.invoiceRequested === true && order.status === 'pending'
  );
  
  // Billing history shows all orders except pending invoice requests
  // This includes: paid orders, completed orders, and any order that isn't a pending invoice
  const billingHistoryOrders = orders
    .filter((order) => !(order.invoiceRequested === true && order.status === 'pending'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatPriceLocal = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatPrice(num);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string, invoiceRequested: boolean | null) => {
    if (invoiceRequested && status === 'pending') {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          <Clock className="w-3 h-3 mr-1" />
          Invoice Pending
        </Badge>
      );
    }
    switch (status) {
      case 'paid':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const handlePurchasePack = (pack: typeof mockCreditPackages[0]) => {
    setSelectedPack(pack);
    setShowOrderForm(true);
  };

  const getOrderItems = () => {
    if (!selectedPack) return [];
    return [{
      type: "credit_pack",
      description: `Test24 ${selectedPack.type} Credit${selectedPack.credits > 1 ? 's' : ''} (${selectedPack.credits}x)`,
      quantity: 1,
      unitAmount: selectedPack.price.toString(),
    }];
  };

  // Calculate credits from actual company data
  const basicCreditsTotal = company?.basicCreditsTotal ?? 0;
  const basicCreditsUsed = company?.basicCreditsUsed ?? 0;
  const basicCreditsRemaining = basicCreditsTotal - basicCreditsUsed;
  
  const proCreditsTotal = company?.proCreditsTotal ?? 0;
  const proCreditsUsed = company?.proCreditsUsed ?? 0;
  const proCreditsRemaining = proCreditsTotal - proCreditsUsed;
  
  const basicCredits = { remaining: basicCreditsRemaining, total: basicCreditsTotal };
  const proCredits = { remaining: proCreditsRemaining, total: proCreditsTotal };

  const basicPercentage = basicCredits.total > 0 ? (basicCredits.remaining / basicCredits.total) * 100 : 0;
  const proPercentage = proCredits.total > 0 ? (proCredits.remaining / proCredits.total) * 100 : 0;

  // Free users can access this page to purchase memberships/credits
  if (!isPaidMember) {
    return (
      <PortalLayout>
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">Purchase Membership & Credits</h1>
              <p className="text-lg text-muted-foreground">
                Upgrade your account and unlock exclusive features
              </p>
            </div>
            <Badge variant="secondary" className="text-sm" data-testid="badge-free-tier">
              Free Tier
            </Badge>
          </div>

          {/* Membership Purchase CTA */}
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3">Become an Innovatr Member</h3>
                  <p className="text-muted-foreground mb-4">
                    Unlock discounted Test24 credits, access the full trends library, member deals, and priority support. Choose from Entry, Growth, or Scale tiers.
                  </p>
                  <div className="flex gap-3">
                    <Button size="lg" onClick={() => setLocation("/#membership")} data-testid="button-explore-plans">
                      View Membership Plans
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setLocation("/#pricing")} data-testid="button-payg-pricing">
                      Pay-As-You-Go Pricing
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4">What You'll Get with Membership</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Discounted Credits</h4>
                  <p className="text-sm text-muted-foreground">
                    Save up to 55% on Test24 Basic and Pro research credits
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Full Trends Library</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all industry reports and market insights
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Member Deals</h4>
                  <p className="text-sm text-muted-foreground">
                    Access exclusive offers and bundle packages
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">Credits & Billing</h1>
          <p className="text-lg text-muted-foreground">
            Manage your research credits and billing information
          </p>
        </div>

        {/* Current Credit Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-accent">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Test24 Basic Credits</span>
                <Badge variant="secondary">{basicCredits.remaining} Available</Badge>
              </CardTitle>
              <CardDescription>
                {company?.tier ? `Included in ${company.tier.charAt(0) + company.tier.slice(1).toLowerCase()} Membership` : 'Company credits'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">
                    {basicCredits.total - basicCredits.remaining} of {basicCredits.total}
                  </span>
                </div>
                <Progress value={100 - basicPercentage} className="h-3" />
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Member rate: R5,000 per credit (50% off)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Test24 Pro Credits</span>
                <Badge variant="secondary">{proCredits.remaining} Available</Badge>
              </CardTitle>
              <CardDescription>
                {company?.tier ? `Included in ${company.tier.charAt(0) + company.tier.slice(1).toLowerCase()} Membership` : 'Company credits'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">
                    {proCredits.total - proCredits.remaining} of {proCredits.total}
                  </span>
                </div>
                <Progress value={100 - proPercentage} className="h-3" />
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Member rate: R45,000 per credit (10% off)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Credit Packs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Purchase Credit Packs
            </CardTitle>
            <CardDescription>
              Top up your credits with exclusive member pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockCreditPackages.map((pack, index) => (
                <Card
                  key={index}
                  className="hover-elevate"
                  data-testid={`credit-pack-${index}`}
                >
                  <CardHeader>
                    <Badge
                      variant={pack.type === "Pro" ? "default" : "secondary"}
                      className="w-fit"
                    >
                      {pack.type}
                    </Badge>
                    <CardTitle className="text-2xl mt-2">
                      {pack.credits}x Credit{pack.credits > 1 ? "s" : ""}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-primary">
                        {formatPriceLocal(pack.price)}
                      </p>
                      <p className="text-sm text-muted-foreground line-through">
                        {formatPriceLocal(pack.regularPrice)}
                      </p>
                    </div>
                    <div className="bg-accent/10 rounded-lg p-2 text-center">
                      <p className="text-sm font-semibold text-accent">
                        Save {pack.savings}%
                      </p>
                    </div>
                    <Button 
                      className="w-full" 
                      data-testid={`button-buy-pack-${index}`}
                      onClick={() => handlePurchasePack(pack)}
                    >
                      Purchase
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invoice Orders */}
        {pendingInvoiceOrders.length > 0 && (
          <Card className="border-amber-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Pending Invoices
              </CardTitle>
              <CardDescription>
                Orders awaiting payment. Credits will be activated once payment is received.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvoiceOrders.map((order) => (
                    <TableRow key={order.id} data-testid={`pending-order-${order.id}`}>
                      <TableCell className="font-medium font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.purchaseType}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPriceLocal(order.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(order.status, order.invoiceRequested)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-sm text-muted-foreground mt-4">
                An invoice has been sent to your email. Once payment is confirmed, your credits will be activated automatically.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing History
            </CardTitle>
            <CardDescription>
              View and download your invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Show orders from API */}
                {billingHistoryOrders.map((order) => (
                  <TableRow key={order.id} data-testid={`order-${order.id}`}>
                    <TableCell className="font-medium font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.purchaseType}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPriceLocal(order.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(order.status, order.invoiceRequested)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`button-download-order-${order.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Show mock data if no real orders exist */}
                {billingHistoryOrders.length === 0 && mockBillingHistory.map((invoice) => (
                  <TableRow key={invoice.id} data-testid={`invoice-${invoice.id}`}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>
                      {new Date(invoice.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPriceLocal(invoice.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`button-download-invoice-${invoice.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
              <Button variant="outline" data-testid="button-update-payment">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Form Dialog for Credit Pack Purchases */}
      {selectedPack && (
        <OrderFormDialog
          open={showOrderForm}
          onOpenChange={setShowOrderForm}
          orderItems={getOrderItems()}
          totalAmount={selectedPack.price}
          purchaseType={`Test24 ${selectedPack.type} Credit Pack`}
          onSuccess={() => {
            setSelectedPack(null);
          }}
        />
      )}
    </PortalLayout>
  );
}

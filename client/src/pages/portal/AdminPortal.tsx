import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortalLayout from "./PortalLayout";
import AdminOverview from "./AdminOverview";
import AdminOrders from "./AdminOrders";
import AdminReports from "./AdminReports";
import AdminDeals from "./AdminDeals";
import AdminSubscriptions from "./AdminSubscriptions";
import AdminCompanies from "./AdminCompanies";
import AdminMailerSubscriptions from "./AdminMailerSubscriptions";
import AdminBriefs from "./AdminBriefs";

export default function AdminPortal() {
  const [, setLocation] = useLocation();
  const { isAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      setLocation("/portal");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  if (!isAdmin || !isAuthenticated) {
    return null;
  }

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage companies, orders, reports, deals, and system overview
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" data-testid="tab-admin-overview">Overview</TabsTrigger>
            <TabsTrigger value="companies" data-testid="tab-admin-companies">Companies</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-admin-orders">Orders</TabsTrigger>
            <TabsTrigger value="briefs" data-testid="tab-admin-briefs">Briefs</TabsTrigger>
            <TabsTrigger value="subscriptions" data-testid="tab-admin-subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="subscribers" data-testid="tab-admin-subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-admin-reports">Reports</TabsTrigger>
            <TabsTrigger value="deals" data-testid="tab-admin-deals">Deals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="companies">
            <AdminCompanies />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>

          <TabsContent value="briefs">
            <AdminBriefs />
          </TabsContent>

          <TabsContent value="subscriptions">
            <AdminSubscriptions />
          </TabsContent>

          <TabsContent value="subscribers">
            <AdminMailerSubscriptions />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReports />
          </TabsContent>

          <TabsContent value="deals">
            <AdminDeals />
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}

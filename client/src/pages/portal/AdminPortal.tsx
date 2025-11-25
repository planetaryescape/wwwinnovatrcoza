import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortalLayout from "./PortalLayout";
import AdminOverview from "./AdminOverview";
import AdminUsers from "./AdminUsers";
import AdminReports from "./AdminReports";
import AdminDeals from "./AdminDeals";

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
            Manage users, reports, deals, and system overview
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-admin-overview">Overview</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-admin-users">Users</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-admin-reports">Reports</TabsTrigger>
            <TabsTrigger value="deals" data-testid="tab-admin-deals">Deals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
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

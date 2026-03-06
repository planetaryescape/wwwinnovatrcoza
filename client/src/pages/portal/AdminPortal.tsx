import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PortalLayout from "./PortalLayout";
import AdminOrders from "./AdminOrders";
import AdminReports from "./AdminReports";
import AdminDeals from "./AdminDeals";
import AdminCaseStudies from "./AdminCaseStudies";
import AdminCompanies from "./AdminCompanies";
import AdminMembers from "./AdminMembers";
import AdminBriefs from "./AdminBriefs";
import AdminOverview from "./AdminOverview";

const VALID_TABS = ["overview", "companies", "members", "reports", "briefs", "orders", "offers", "casestudies"];

export default function AdminPortal() {
  const [location, setLocation] = useLocation();
  const { isAdmin, isAuthenticated, isViewingAsCompany } = useAuth();
  
  const getTabFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return tab && VALID_TABS.includes(tab) ? tab : "overview";
  }, []);
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || isViewingAsCompany) {
      setLocation("/portal");
    }
  }, [isAuthenticated, isAdmin, isViewingAsCompany, setLocation]);
  
  useEffect(() => {
    const urlTab = getTabFromUrl();
    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [location, getTabFromUrl]);
  
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setLocation(`/portal/admin?tab=${newTab}`, { replace: true });
  };

  if (!isAdmin || !isAuthenticated || isViewingAsCompany) {
    return null;
  }

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-[16px]">Our dashboard to oversee companies, briefs, orders, reports, deals, and the smooth running of… everything.</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" data-testid="tab-admin-overview">Overview</TabsTrigger>
            <TabsTrigger value="companies" data-testid="tab-admin-companies">Companies</TabsTrigger>
            <TabsTrigger value="members" data-testid="tab-admin-members">Members</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-admin-reports">Intelligence</TabsTrigger>
            <TabsTrigger value="briefs" data-testid="tab-admin-briefs">Briefs</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-admin-orders">Orders</TabsTrigger>
            <TabsTrigger value="offers" data-testid="tab-admin-offers">Offers</TabsTrigger>
            <TabsTrigger value="casestudies" data-testid="tab-admin-casestudies">Case Studies</TabsTrigger>
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

          <TabsContent value="members">
            <AdminMembers />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReports />
          </TabsContent>

          <TabsContent value="offers">
            <AdminDeals />
          </TabsContent>

          <TabsContent value="casestudies">
            <AdminCaseStudies />
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
}

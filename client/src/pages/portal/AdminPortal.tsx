import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { PortalTabContent, PortalTabs } from "@/components/portal/PortalTabs";
import PortalLayout from "./PortalLayout";
import AdminOrders from "./AdminOrders";
import AdminReports from "./AdminReports";
import AdminDeals from "./AdminDeals";
import AdminCaseStudies from "./AdminCaseStudies";
import AdminCompanies from "./AdminCompanies";
import AdminMembers from "./AdminMembers";
import AdminBriefs from "./AdminBriefs";
import AdminOverview from "./AdminOverview";

const ADMIN_TAB_VALUES = ["overview", "companies", "members", "reports", "briefs", "orders", "offers", "casestudies"] as const;
type AdminTab = typeof ADMIN_TAB_VALUES[number];

const ADMIN_TABS: { value: AdminTab; label: string; testId: string }[] = [
  { value: "overview", label: "Overview", testId: "tab-admin-overview" },
  { value: "companies", label: "Companies", testId: "tab-admin-companies" },
  { value: "members", label: "Members", testId: "tab-admin-members" },
  { value: "reports", label: "Intelligence", testId: "tab-admin-reports" },
  { value: "briefs", label: "Briefs", testId: "tab-admin-briefs" },
  { value: "orders", label: "Orders", testId: "tab-admin-orders" },
  { value: "offers", label: "Offers", testId: "tab-admin-offers" },
  { value: "casestudies", label: "Case Studies", testId: "tab-admin-casestudies" },
];

export default function AdminPortal() {
  const [, setLocation] = useLocation();
  const { isAdmin, isAuthenticated, isViewingAsCompany } = useAuth();
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(ADMIN_TAB_VALUES).withDefault("overview"),
  );

  useEffect(() => {
    if (!isAuthenticated || !isAdmin || isViewingAsCompany) {
      setLocation("/portal");
    }
  }, [isAuthenticated, isAdmin, isViewingAsCompany, setLocation]);
  if (!isAdmin || !isAuthenticated || isViewingAsCompany) {
    return null;
  }

  return (
    <PortalLayout>
      <div className="portal-page">
        <div className="portal-page-content space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-[16px]">Our dashboard to oversee companies, briefs, orders, reports, deals, and the smooth running of… everything.</p>
        </div>

        <PortalTabs value={activeTab} onValueChange={(tab) => void setActiveTab(tab)} tabs={ADMIN_TABS} barClassName="px-0">
          <PortalTabContent value="overview" className="mt-6">
            <AdminOverview />
          </PortalTabContent>

          <PortalTabContent value="companies" className="mt-6">
            <AdminCompanies />
          </PortalTabContent>

          <PortalTabContent value="orders" className="mt-6">
            <AdminOrders />
          </PortalTabContent>

          <PortalTabContent value="briefs" className="mt-6">
            <AdminBriefs />
          </PortalTabContent>

          <PortalTabContent value="members" className="mt-6">
            <AdminMembers />
          </PortalTabContent>

          <PortalTabContent value="reports" className="mt-6">
            <AdminReports />
          </PortalTabContent>

          <PortalTabContent value="offers" className="mt-6">
            <AdminDeals />
          </PortalTabContent>

          <PortalTabContent value="casestudies" className="mt-6">
            <AdminCaseStudies />
          </PortalTabContent>
        </PortalTabs>
        </div>
      </div>
    </PortalLayout>
  );
}

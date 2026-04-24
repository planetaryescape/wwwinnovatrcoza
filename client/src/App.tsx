import { Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { useGtmPageTracking } from "@/hooks/use-gtm-page-tracking";
import { NuqsAdapter } from "nuqs/adapters/react";

const InnovatrHome = lazy(() => import("@/pages/InnovatrHome"));
const WhatWeDo = lazy(() => import("@/pages/ConsultPage"));
const PricingPage = lazy(() => import("@/pages/ResearchPage"));
const ResearchTools = lazy(() => import("@/pages/ToolsPage"));
const CaseStudies = lazy(() => import("@/pages/CaseStudiesPage"));
const ContactUs = lazy(() => import("@/pages/ContactPage"));
const Test24BasicPage = lazy(() => import("@/pages/Test24BasicPage"));
const Test24ProPage = lazy(() => import("@/pages/Test24ProPage"));
const ConsultPillarPage = lazy(() => import("@/pages/ConsultPillarPage"));
const CouponSignup = lazy(() => import("@/pages/CouponSignup"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const CaseStudyDetail = lazy(() => import("@/pages/CaseStudyDetail"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("@/pages/TermsOfUse"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const NotFound = lazy(() => import("@/pages/not-found"));
const CheckoutBasicPAYG = lazy(() => import("@/pages/CheckoutBasicPAYG"));
const CheckoutProPAYG = lazy(() => import("@/pages/CheckoutProPAYG"));
const CheckoutBasicMembers = lazy(() => import("@/pages/CheckoutBasicMembers"));
const CheckoutProMembers = lazy(() => import("@/pages/CheckoutProMembers"));
const CheckoutMembershipEntry = lazy(() => import("@/pages/CheckoutMembershipEntry"));
const CheckoutMembershipGold = lazy(() => import("@/pages/CheckoutMembershipGold"));
const CheckoutMembershipPlatinum = lazy(() => import("@/pages/CheckoutMembershipPlatinum"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const PaymentReturn = lazy(() => import("@/pages/PaymentReturn"));
const Dashboard = lazy(() => import("@/pages/portal/Dashboard"));
const TrendsInsights = lazy(() => import("@/pages/portal/TrendsInsights"));
const InsightDetail = lazy(() => import("@/pages/portal/InsightDetail"));
const LaunchBrief = lazy(() => import("@/pages/portal/LaunchBrief"));
const CreditsAndBilling = lazy(() => import("@/pages/portal/CreditsAndBilling"));
const MemberDeals = lazy(() => import("@/pages/portal/MemberDeals"));
const Settings = lazy(() => import("@/pages/portal/Settings"));
const AdminPortal = lazy(() => import("@/pages/portal/AdminPortal"));
const AdminCompanyDetail = lazy(() => import("@/pages/portal/AdminCompanyDetail"));
const ExplorePage = lazy(() => import("@/pages/portal/ExplorePage"));
const TestPage = lazy(() => import("@/pages/portal/TestPage"));
const ActPage = lazy(() => import("@/pages/portal/ActPage"));
const HealthPage = lazy(() => import("@/pages/portal/HealthPage"));
const ReportDetailPage = lazy(() => import("@/pages/portal/ReportDetailPage"));

/**
 * AdminOnly wraps a portal page so that only admins (Hannah, Richard, Alroy)
 * can access it. Non-admins are bounced back to the dashboard. Used to lock
 * down all portal pages except Dashboard, Explore, Test (incl. Launch a Brief),
 * and Settings while we finalise the rest of the experience.
 */
function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }
  if (!isAdmin) {
    return <Redirect to="/portal/dashboard" />;
  }
  return <>{children}</>;
}

function Router() {
  useGtmPageTracking();
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div data-testid="loading-spinner" style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#3A2FBF", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>}>
        <Switch>
          <Route path="/" component={InnovatrHome} />
          <Route path="/research" component={PricingPage} />
          <Route path="/tools" component={ResearchTools} />
          <Route path="/case-studies" component={CaseStudies} />
          <Route path="/contact" component={ContactUs} />
          <Route path="/test24-basic" component={Test24BasicPage} />
          <Route path="/test24-pro" component={Test24ProPage} />
          <Route path="/innovatr-consult">{() => <Redirect to="/consult" />}</Route>
          <Route path="/consult" component={WhatWeDo} />
          <Route path="/consult/:pillarId" component={ConsultPillarPage} />
          <Route path="/case-study/:id" component={CaseStudyDetail} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-use" component={TermsOfUse} />
          <Route path="/cookie-policy" component={CookiePolicy} />
          <Route path="/innovatr-intelligence">{() => <Redirect to="/#membership" />}</Route>
          <Route path="/checkout/basic-payg" component={CheckoutBasicPAYG} />
          <Route path="/checkout/pro-payg" component={CheckoutProPAYG} />
          <Route path="/checkout/basic-members" component={CheckoutBasicMembers} />
          <Route path="/checkout/pro-members" component={CheckoutProMembers} />
          <Route path="/checkout/membership-entry" component={CheckoutMembershipEntry} />
          <Route path="/checkout/membership-gold" component={CheckoutMembershipGold} />
          <Route path="/checkout/membership-growth" component={CheckoutMembershipGold} />
          <Route path="/checkout/membership-platinum" component={CheckoutMembershipPlatinum} />
          <Route path="/checkout/membership-scale" component={CheckoutMembershipPlatinum} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/payment/return" component={PaymentReturn} />
          <Route path="/payment/cancel" component={PaymentReturn} />
          <Route path="/portal" component={Dashboard} />
          <Route path="/portal/dashboard" component={Dashboard} />
          <Route path="/portal/explore/trends" component={TrendsInsights} />
          <Route path="/portal/explore/insights/:slug" component={InsightDetail} />
          <Route path="/portal/trends">{() => <Redirect to="/portal/explore/trends" />}</Route>
          <Route path="/portal/insights/:slug" component={InsightDetail} />
          <Route path="/portal/launch" component={LaunchBrief} />
          <Route path="/portal/credits">{() => <AdminOnly><CreditsAndBilling /></AdminOnly>}</Route>
          <Route path="/portal/explore" component={ExplorePage} />
          <Route path="/portal/test" component={TestPage} />
          <Route path="/portal/act" component={ActPage} />
          <Route path="/portal/health" component={HealthPage} />
          <Route path="/portal/research">{() => <Redirect to="/portal/test" />}</Route>
          <Route path="/portal/deals" component={MemberDeals} />
          <Route path="/portal/reports/:id" component={ReportDetailPage} />
          <Route path="/portal/admin" component={AdminPortal} />
          <Route path="/portal/admin/companies/:companyId" component={AdminCompanyDetail} />
          <Route path="/portal/settings" component={Settings} />
          <Route path="/claim-coupon" component={CouponSignup} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route component={NotFound} />
        </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CurrencyProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </CurrencyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </NuqsAdapter>
  );
}

export default App;

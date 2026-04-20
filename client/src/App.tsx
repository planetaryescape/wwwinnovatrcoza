import { Suspense, lazy } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { useGtmPageTracking } from "@/hooks/use-gtm-page-tracking";
import { AnimatePresence, motion } from "framer-motion";
import InnovatrHome from "@/pages/InnovatrHome";
import WhatWeDo from "@/pages/ConsultPage";
import PricingPage from "@/pages/ResearchPage";
import ResearchTools from "@/pages/ToolsPage";
import CaseStudies from "@/pages/CaseStudiesPage";
import ContactUs from "@/pages/ContactPage";
import Test24BasicPage from "@/pages/Test24BasicPage";
import Test24ProPage from "@/pages/Test24ProPage";
import ConsultPillarPage from "@/pages/ConsultPillarPage";
import CouponSignup from "@/pages/CouponSignup";
import ResetPassword from "@/pages/ResetPassword";
import CaseStudyDetail from "@/pages/CaseStudyDetail";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import CookiePolicy from "@/pages/CookiePolicy";
import NotFound from "@/pages/not-found";

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
const PastResearch = lazy(() => import("@/pages/portal/PastResearch"));
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
  const [location] = useLocation();
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div data-testid="loading-spinner" style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#3A2FBF", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>}>
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
      >
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
          <Route path="/portal/trends">{() => <AdminOnly><TrendsInsights /></AdminOnly>}</Route>
          <Route path="/portal/insights/:slug">{(params) => <AdminOnly><InsightDetail {...(params as any)} /></AdminOnly>}</Route>
          <Route path="/portal/launch" component={LaunchBrief} />
          <Route path="/portal/credits">{() => <AdminOnly><CreditsAndBilling /></AdminOnly>}</Route>
          <Route path="/portal/explore" component={ExplorePage} />
          <Route path="/portal/test" component={TestPage} />
          <Route path="/portal/act">{() => <AdminOnly><ActPage /></AdminOnly>}</Route>
          <Route path="/portal/health">{() => <AdminOnly><HealthPage /></AdminOnly>}</Route>
          <Route path="/portal/research">{() => <AdminOnly><PastResearch /></AdminOnly>}</Route>
          <Route path="/portal/deals">{() => <AdminOnly><MemberDeals /></AdminOnly>}</Route>
          <Route path="/portal/reports/:id">{(params) => <AdminOnly><ReportDetailPage {...(params as any)} /></AdminOnly>}</Route>
          <Route path="/portal/admin" component={AdminPortal} />
          <Route path="/portal/admin/companies/:companyId" component={AdminCompanyDetail} />
          <Route path="/portal/settings" component={Settings} />
          <Route path="/claim-coupon" component={CouponSignup} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
    </Suspense>
  );
}

function App() {
  return (
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
  );
}

export default App;

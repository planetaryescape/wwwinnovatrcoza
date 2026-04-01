import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { useGtmPageTracking } from "@/hooks/use-gtm-page-tracking";
import CinematicLanding from "@/pages/CinematicLanding";
import Home from "@/pages/Home";
import Test24BasicPage from "@/pages/Test24BasicPage";
import Test24ProPage from "@/pages/Test24ProPage";
import ConsultPillarPage from "@/pages/ConsultPillarPage";
import CheckoutBasicPAYG from "@/pages/CheckoutBasicPAYG";
import CheckoutProPAYG from "@/pages/CheckoutProPAYG";
import CheckoutBasicMembers from "@/pages/CheckoutBasicMembers";
import CheckoutProMembers from "@/pages/CheckoutProMembers";
import CheckoutMembershipEntry from "@/pages/CheckoutMembershipEntry";
import CheckoutMembershipGold from "@/pages/CheckoutMembershipGold";
import CheckoutMembershipPlatinum from "@/pages/CheckoutMembershipPlatinum";
import CheckoutPage from "@/pages/CheckoutPage";
import PaymentReturn from "@/pages/PaymentReturn";
import Dashboard from "@/pages/portal/Dashboard";
import TrendsInsights from "@/pages/portal/TrendsInsights";
import InsightDetail from "@/pages/portal/InsightDetail";
import LaunchBrief from "@/pages/portal/LaunchBrief";
import CreditsAndBilling from "@/pages/portal/CreditsAndBilling";
import PastResearch from "@/pages/portal/PastResearch";
import MemberDeals from "@/pages/portal/MemberDeals";
import Settings from "@/pages/portal/Settings";
import AdminPortal from "@/pages/portal/AdminPortal";
import AdminCompanyDetail from "@/pages/portal/AdminCompanyDetail";
import ExplorePage from "@/pages/portal/ExplorePage";
import TestPage from "@/pages/portal/TestPage";
import ActPage from "@/pages/portal/ActPage";
import HealthPage from "@/pages/portal/HealthPage";
import CouponSignup from "@/pages/CouponSignup";
import ResetPassword from "@/pages/ResetPassword";
import CaseStudyDetail from "@/pages/CaseStudyDetail";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/not-found";

function Router() {
  useGtmPageTracking();
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/test24-basic" component={Test24BasicPage} />
      <Route path="/test24-pro" component={Test24ProPage} />
      <Route path="/innovatr-consult">{() => <Redirect to="/consult" />}</Route>
      <Route path="/consult" component={CinematicLanding} />
      <Route path="/consult/:pillarId" component={ConsultPillarPage} />
      <Route path="/case-study/:id" component={CaseStudyDetail} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
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
      <Route path="/portal/trends" component={TrendsInsights} />
      <Route path="/portal/insights/:slug" component={InsightDetail} />
      <Route path="/portal/launch" component={LaunchBrief} />
      <Route path="/portal/credits" component={CreditsAndBilling} />
      <Route path="/portal/explore" component={ExplorePage} />
      <Route path="/portal/test" component={TestPage} />
      <Route path="/portal/act" component={ActPage} />
      <Route path="/portal/health" component={HealthPage} />
      <Route path="/portal/research" component={PastResearch} />
      <Route path="/portal/deals" component={MemberDeals} />
      <Route path="/portal/admin" component={AdminPortal} />
      <Route path="/portal/admin/companies/:companyId" component={AdminCompanyDetail} />
      <Route path="/portal/settings" component={Settings} />
      <Route path="/claim-coupon" component={CouponSignup} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
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

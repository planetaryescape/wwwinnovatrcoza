import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Test24BasicPage from "@/pages/Test24BasicPage";
import Test24ProPage from "@/pages/Test24ProPage";
import InnovatrConsultPage from "@/pages/InnovatrConsultPage";
import CheckoutBasicPAYG from "@/pages/CheckoutBasicPAYG";
import CheckoutProPAYG from "@/pages/CheckoutProPAYG";
import CheckoutBasicMembers from "@/pages/CheckoutBasicMembers";
import CheckoutProMembers from "@/pages/CheckoutProMembers";
import CheckoutMembershipEntry from "@/pages/CheckoutMembershipEntry";
import CheckoutMembershipGold from "@/pages/CheckoutMembershipGold";
import CheckoutMembershipPlatinum from "@/pages/CheckoutMembershipPlatinum";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/test24-basic" component={Test24BasicPage} />
      <Route path="/test24-pro" component={Test24ProPage} />
      <Route path="/innovatr-consult" component={InnovatrConsultPage} />
      <Route path="/checkout/basic-payg" component={CheckoutBasicPAYG} />
      <Route path="/checkout/pro-payg" component={CheckoutProPAYG} />
      <Route path="/checkout/basic-members" component={CheckoutBasicMembers} />
      <Route path="/checkout/pro-members" component={CheckoutProMembers} />
      <Route path="/checkout/membership-entry" component={CheckoutMembershipEntry} />
      <Route path="/checkout/membership-gold" component={CheckoutMembershipGold} />
      <Route path="/checkout/membership-platinum" component={CheckoutMembershipPlatinum} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

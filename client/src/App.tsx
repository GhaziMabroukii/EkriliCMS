import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";

// Pages
import Home from "@/pages/home";
import Listings from "@/pages/listings";
import ListingDetail from "@/pages/listing-detail";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import PostListing from "@/pages/post-listing";
import OwnerDashboard from "@/pages/dashboard/owner";
import TenantDashboard from "@/pages/dashboard/tenant";
import Chat from "@/pages/chat";
import Profile from "@/pages/profile";
import Maps from "@/pages/maps";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/listings" component={Listings} />
      <Route path="/listing/:id" component={ListingDetail} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/signup" component={Signup} />
      <Route path="/post-listing" component={PostListing} />
      <Route path="/dashboard/owner" component={OwnerDashboard} />
      <Route path="/dashboard/tenant" component={TenantDashboard} />
      <Route path="/chat/:userId" component={Chat} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/maps" component={Maps} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

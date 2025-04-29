
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard, { DashboardTools } from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardTools.Overview />} />
              <Route path="social" element={<DashboardTools.SocialMedia />} />
              <Route path="ip-domain" element={<DashboardTools.IPDomain />} />
              <Route path="email-phone" element={<DashboardTools.EmailPhone />} />
              <Route path="web-scraping" element={<DashboardTools.WebScraping />} />
              <Route path="reporting" element={<DashboardTools.SecureReporting />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

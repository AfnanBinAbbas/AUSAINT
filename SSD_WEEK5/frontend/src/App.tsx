import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard, { DashboardTools } from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Dashboard routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardTools.Overview />} />
                <Route path="social" element={<DashboardTools.SocialMedia />} />
                <Route path="ip-domain" element={<DashboardTools.IPDomain />} />
                <Route path="email-phone" element={<DashboardTools.EmailPhone />} />
                <Route path="web-scraping" element={<DashboardTools.WebScraping />} />
                <Route path="reporting" element={<DashboardTools.SecureReporting />} />
              </Route>
              
              {/* Root route redirects to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

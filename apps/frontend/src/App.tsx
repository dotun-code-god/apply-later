import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Alerts from "./pages/Alerts";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ApplicationDetail from "./pages/ApplicationDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to dashboard for mobile-first experience */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/application/:id" element={<ApplicationDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/features/auth/auth-provider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";
import { VerifiedRoute } from "./components/auth/VerifiedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import ApplicationDetails from "./pages/ApplicationDetails";
import Alerts from "./pages/Alerts";
import Search from "./pages/Search";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<Signup />} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<VerifiedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                <Route path="/applications/:id" element={<ApplicationDetails />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/search" element={<Search />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/onboarding" element={<Onboarding />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

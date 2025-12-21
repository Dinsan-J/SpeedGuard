import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import OfficerQRSearch from "./pages/officer/OfficerQRSearch";
import PoliceDashboard from "./pages/police/PoliceDashboard";
import PoliceAnalytics from "./pages/police/PoliceAnalytics";
import UserDashboard from "./pages/user/UserDashboard";
import UserVehicles from "./pages/user/UserVehicles";
import UserViolations from "./pages/user/UserViolations";
import UserLayout from "@/components/Layout/UserLayout";
import MainLayout from "@/components/Layout/MainLayout";
import OfficerLayout from "@/components/Layout/OfficerLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public/Officer routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Officer routes with OfficerLayout */}
          <Route path="/officer" element={<OfficerLayout />}>
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="qr-search" element={<OfficerQRSearch />} />
            <Route path="police-analytics" element={<PoliceAnalytics />} />
          </Route>

          {/* User routes with UserLayout */}
          <Route path="/user" element={<UserLayout />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="vehicles" element={<UserVehicles />} />
            <Route path="violations" element={<UserViolations />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

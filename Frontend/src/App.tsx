import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import OfficerVehicles from "./pages/officer/OfficerVehicles";
import OfficerFines from "./pages/officer/OfficerFines";
import OfficerAnalytics from "./pages/officer/OfficerAnalytics";
import OfficerQRSearch from "./pages/officer/OfficerQRSearch";
import OfficerIssueFine from "./pages/officer/OfficerIssueFine";
import UserDashboard from "./pages/user/UserDashboard";
import UserVehicles from "./pages/user/UserVehicles";
import UserViolations from "./pages/user/UserViolations";
import UserPayments from "./pages/user/UserPayments";
import UserLayout from "@/components/Layout/UserLayout";
import MainLayout from "@/components/Layout/MainLayout";

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
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Officer Routes */}
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/vehicles" element={<OfficerVehicles />} />
            <Route path="/officer/fines" element={<OfficerFines />} />
            <Route path="/officer/analytics" element={<OfficerAnalytics />} />
            <Route path="/officer/qr-search" element={<OfficerQRSearch />} />
            <Route path="/officer/issue-fine" element={<OfficerIssueFine />} />
          </Route>

          {/* User routes with UserLayout */}
          <Route path="/user" element={<UserLayout />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="vehicles" element={<UserVehicles />} />
            <Route path="violations" element={<UserViolations />} />
            <Route path="payments" element={<UserPayments />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


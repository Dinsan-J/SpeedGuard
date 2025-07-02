import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import ULayout from "./userLayout/Layout";
import Dashboard from "./components/sidebar/dashboard/DashBoard";
import SpeedHistoryPage from "./components/sidebar/speedHistory/SpeedHistoryPage";
import LandingPage from "./pages/Landing";
import FineHistory from "./components/sidebar/fineHistory/FineHistory";
import Violation from "./components/sidebar/violation/Violation";
import Profile from "./components/sidebar/profile/Profile"; // Profile component import
import OfficerLayout from "./officerLayout/Layout"; // Import the officer layout
import OfficerDashboard from "./components/officer/OfficerDashboard";
import VehicleLookup from "./components/officer/VehicleLookup";
import IssueFine from "./components/officer/IssueFine";
import OfficerFineHistory from "./components/officer/OfficerFineHistory";
import OfficerProfile from "./components/officer/OfficerProfile";
import Sidebar from "./components/sidebar/Sidebar";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes wrapped inside ULayout */}
      <Route path="/driver-Layout" element={<ULayout />}>
        {/* Redirect /driver-Layout to /driver-Layout/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="speed-history" element={<SpeedHistoryPage />} />
        <Route path="violations" element={<Violation />} />
        <Route path="fine-history" element={<FineHistory />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Officer Layout */}
      <Route path="/officer-Layout" element={<OfficerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="vehicle-lookup" element={<VehicleLookup />} />
        <Route path="issue-fine" element={<IssueFine />} />
        <Route path="fine-history" element={<OfficerFineHistory />} />
        <Route path="profile" element={<OfficerProfile />} />
      </Route>
    </Routes>
  );
}

export default App;

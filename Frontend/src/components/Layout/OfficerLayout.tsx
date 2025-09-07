import { Navbar } from "@/components/Layout/Navbar";
import { Outlet, useNavigate } from "react-router-dom";

const OfficerLayout = () => {
  const navigate = useNavigate();
  // Try to get officer user from localStorage, fallback to dummy values if only role is present
  let user: { id: string; name: string; role: "officer" } | null = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object" && parsed.role === "officer") {
        // If id or name is missing, provide fallback values
        user = {
          id: parsed.id || "officer-id",
          name: parsed.name || "Officer",
          role: "officer",
        };
      }
    }
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Outlet />
    </>
  );
};

export default OfficerLayout;

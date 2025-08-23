import { Navbar } from "@/components/Layout/Navbar";
import { Outlet, useNavigate } from "react-router-dom";

const UserLayout = () => {
  const navigate = useNavigate();
  // Get user from localStorage or your auth context
  const user = JSON.parse(localStorage.getItem("user") || "{}");

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

export default UserLayout;
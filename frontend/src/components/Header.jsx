import React from "react";
import { useNavigate } from "react-router-dom";
import { HiBell, HiUserCircle, HiChevronDown } from "react-icons/hi2";
import { toast } from "react-hot-toast";

const Header = () => {
  const navigate = useNavigate();
  const notifications = 3;

  const handleNavigate = (path) => {
    navigate(path);
  };

  const user = {
    name: "John Doe",
    role: "User",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out!");
    setTimeout(() => {
      navigate("/login");
    }, 900);
  };

  return (
    <div className="fixed top-0 z-50 ml-5 w-[calc(100%-270px)] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border-b border-gray-700 shadow-xl flex items-center justify-end p-3 rounded-b-4xl">
      <div className="flex items-center space-x-5 relative">
        {/* Notifications */}
        <div className="relative group">
          <HiBell className="text-2xl text-gray-300 cursor-pointer hover:text-blue-400 transition" />
          {notifications > 0 && (
            <span className="absolute top-[-8px] right-[-8px] text-[10px] text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
              {notifications}
            </span>
          )}
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-opacity duration-300 z-50">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                Notifications
              </h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                <li className="p-2 rounded-md hover:bg-gray-700 text-sm text-gray-300 cursor-pointer">
                  ⚠️ Speed limit exceeded
                </li>
                <li className="p-2 rounded-md hover:bg-gray-700 text-sm text-gray-300 cursor-pointer">
                  ⚠️ Fines need to be paid
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="relative group cursor-pointer">
          <div className="flex items-center space-x-2 hover:text-blue-400 transition">
            <HiUserCircle className="text-3xl text-gray-300" />
            <div className="text-left">
              <p className="text-base font-semibold text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
            <HiChevronDown className="text-lg text-gray-300" />
          </div>
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 group-hover:visible invisible transition-opacity duration-300 z-50">
            <div className="p-3 space-y-2">
              <button
                onClick={() => handleNavigate("/profile")}
                className="block w-full text-left p-2 rounded-md hover:bg-gray-700 text-sm text-gray-300"
              >
                👤 View Profile
              </button>
              <button
                onClick={() => handleNavigate("/settings")}
                className="block w-full text-left p-2 rounded-md hover:bg-gray-700 text-sm text-gray-300"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left p-2 rounded-md hover:bg-gray-700 text-sm text-red-400"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

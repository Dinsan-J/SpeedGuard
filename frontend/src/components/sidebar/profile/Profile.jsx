import React, { useEffect, useState } from "react";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const Spinner = () => (
  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
);

const Profile = () => {
  const [loading, setLoading] = useState("");
  const navigate = useNavigate();

  const handleEdit = () => {
    setLoading("edit");
    setTimeout(() => setLoading(""), 1500);
  };

  const handleLogout = async () => {
    setLoading("logout");
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      toast.success("Logged out!");
      setTimeout(() => {
        setLoading("");
        navigate("/login", { replace: true });
      }, 900);
    } catch (err) {
      toast.error("Logout failed!");
      setLoading("");
    }
  };

  // Disable page scroll when profile card is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div className="mt-15 flex items-center justify-center overflow-hidden">
      <div className="max-w-md w-full p-8 rounded-xl shadow-2xl text-white bg-gray-800/80 dark:bg-gray-800 animate-slide-fade-in">
        {/* Profile Image */}
        <div className="flex justify-center -mt-16 mb-6">
          <div className=" mt-10 w-32 h-32 rounded-full border-4 border-white bg-gray-700 flex items-center justify-center text-4xl">
            DJ
          </div>
        </div>

        {/* Title */}
        <div className="text-center text-sm text-indigo-200 uppercase font-semibold mb-4">
          Profile Details
        </div>

        {/* Info */}
        <div className="space-y-3">
          <div className="flex">
            <span className="w-24 text-indigo-100 font-medium">Name:</span>
            <span>Dinsan J.</span>
          </div>
          <div className="flex">
            <span className="w-24 text-indigo-100 font-medium">Age:</span>
            <span>25</span>
          </div>
          <div className="flex">
            <span className="w-24 text-indigo-100 font-medium">Mobile:</span>
            <span>+94 702202620</span>
          </div>
          <div className="flex">
            <span className="w-24 text-indigo-100 font-medium">Email:</span>
            <span>Deenu1835@gmail.com</span>
          </div>
          <div className="flex">
            <span className="w-24 text-indigo-100 font-medium">Address:</span>
            <span>Mullaitivu</span>
          </div>
        </div>

        {/* Footer with Buttons */}
        <div className="mt-8 pt-4 border-t border-indigo-300 flex justify-between">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow transition-transform duration-200 hover:scale-105"
          >
            {loading === "edit" ? <Spinner /> : <FaEdit />}
            Edit
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white shadow transition-transform duration-200 hover:scale-105"
          >
            {loading === "logout" ? <Spinner /> : <FaSignOutAlt />}
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

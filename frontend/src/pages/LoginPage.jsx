import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";
import { ImSpinner2 } from "react-icons/im";
import toast, { Toaster } from "react-hot-toast";
import HomeButton from "../components/HomeButton";
import axios from "axios";

const Login = () => {
  const [emailOrName, setEmailOrName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (user && token) {
      const userData = JSON.parse(user);
      if (userData.role === "officer") {
        navigate("/driver-Layout");
      } else {
        navigate("/driver-Layout");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: emailOrName,
          password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));
        // Store token in localStorage
        localStorage.setItem("token", response.data.token);

        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          // Redirecting based on user role
          if (response.data.user.role === "officer") {
            navigate("/officer-Layout", { replace: true });
          } else {
            navigate("/driver-Layout", { replace: true });
          }
        }, 900);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      <HomeButton />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="bg-black/10 p-10 rounded-3xl shadow-2xl backdrop-blur-2xl w-full max-w-md z-10 card-shine"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center mb-5 bg-white/10 backdrop-blur-lg">
            <FiUser className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-white text-3xl font-bold">Login</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-7">
          {/* Email/Username Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <FiUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white opacity-70" />
            <input
              type="text"
              placeholder="Email or Username"
              value={emailOrName}
              onChange={(e) => setEmailOrName(e.target.value)}
              className="w-full pl-12 p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <FiLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white opacity-70" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {loading ? (
              <ImSpinner2 className="animate-spin h-6 w-6" />
            ) : (
              "Login"
            )}
          </motion.button>
        </form>

        {/* Register Link */}
        <div className="text-center text-white/80 text-sm mt-8">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-300 hover:underline font-semibold"
          >
            Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

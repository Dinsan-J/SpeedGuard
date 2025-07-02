import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiCreditCard } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import HomeButton from "../components/HomeButton";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [policeId, setPoliceId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const role = location.state?.role || "user";
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
          role,
          policeId: role === "officer" ? policeId : undefined,
        }
      );

      // Store the JWT token and user data in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setLoading(false);
      toast.success("Registered successfully!");

      // Redirect based on the role
      setTimeout(() => {
        if (role === "officer") {
          navigate("/officer-Layout");
        } else {
          navigate("/driver-Layout");
        }
      }, 900);
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      <HomeButton />
      <Toaster position="top-center" reverseOrder={false} />
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
          <h2 className="text-white text-3xl font-bold">Create Account</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-7">
          {/* Username Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <FiUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white opacity-70" />
            <input
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </motion.div>

          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <FiMail className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white opacity-70" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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

          {/* Police ID Input (Only for Officer) */}
          {role === "officer" && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative"
            >
              <FiCreditCard className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white opacity-70" />
              <input
                type="text"
                placeholder="Police ID"
                value={policeId}
                onChange={(e) => setPoliceId(e.target.value)}
                className="w-full pl-12 p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </motion.div>
          )}

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
              "Register"
            )}
          </motion.button>
        </form>

        {/* Login Link */}
        <div className="text-center text-white/80 text-sm mt-8">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-300 hover:underline font-semibold"
          >
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

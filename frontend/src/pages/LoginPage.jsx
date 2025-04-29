import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { FiUser, FiLock } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // <-- For navigation

const Login = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success("Logged in successfully!");
    }, 2000);
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#1a002b] via-[#0b0015] to-[#0d0c1d] relative">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Animated border glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute w-[350px] h-[450px] bg-gradient-to-tr from--500 via-purple-500 to-blue-500 blur-2xl rounded-3xl"
      />

      {/* Main glass container */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="bg-blue/10 p-10 rounded-3xl shadow-2xl backdrop-blur-2xl border border-blue/30 w-full max-w-md z-10 container-shine"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center mb-5 bg-white/10 backdrop-blur-lg">
            <FiUser className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-white text-3xl font-bold">Welcome Back</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-7">
          {/* Username input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <FiUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white opacity-70" />
            <input
              type="text"
              placeholder="Username"
              className="w-full pl-12 p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          </motion.div>

          {/* Password input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <FiLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white opacity-70" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 p-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          </motion.div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold flex items-center justify-center transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {loading ? (
              <ImSpinner2 className="animate-spin h-6 w-6" />
            ) : (
              "Login"
            )}
          </motion.button>

          {/* Remember me and forgot password */}
          <div className="flex items-center justify-between text-white/80 text-sm mt-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox accent-pink-500"
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="hover:underline">
              Forgot Password?
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div className="text-center text-white/80 text-sm mt-8">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-pink-400 hover:underline font-semibold"
          >
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

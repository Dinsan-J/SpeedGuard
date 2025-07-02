import React from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar Section */}
      <div className="fixed left-0 top-0 h-full w-64 z-30">
        <Sidebar role="Officer" />
      </div>
      {/* Main Section */}
      <div className="flex flex-col flex-1 ml-64 min-h-screen">
        {/* Header Section */}
        <div className="fixed top-0 left-64 right-0 z-20">
          <Header />
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-auto pt-16 pb-16 p-4 bg-gray-100">
          <Outlet />
        </div>

        {/* Footer Section */}
        <div className="relative mt-auto -ml-5">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;

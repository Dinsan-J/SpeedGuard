import React from "react";
import TopComponent from "./TopComponet";
import SpeedGraph from "./SpeedGraph";
import RecentActivities from "./RecentActivities";

const Dashboard = () => {
  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Top Metrics */}
      <div
        className="w-full h-[500px] ml-3 -mt-2 animate-slide-fade-in opacity-0"
        style={{ animationDelay: "0s", animationFillMode: "forwards" }}
      >
        <TopComponent />
      </div>

      {/* Speed Graph */}
      <div
        className="mt-15 animate-slide-fade-in opacity-0"
        style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
      >
        <SpeedGraph />
      </div>

      {/* Recent Activities */}
      <div
        className="mt-15 animate-slide-fade-in opacity-0"
        style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
      >
        <RecentActivities />
      </div>
    </div>
  );
};

export default Dashboard;

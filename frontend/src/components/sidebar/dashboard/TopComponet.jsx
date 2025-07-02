import React from "react";
import {
  FaTachometerAlt,
  FaChartLine,
  FaExclamationTriangle,
  FaCar,
} from "react-icons/fa";

const TopComponent = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-5 p-6">
      {/* Current Speed */}
      <div className="bg-gray-800/80 dark:bg-gray-800 rounded-xl shadow-lg p-5 hover:scale-105 transition-transform duration-200 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Current Speed</h2>
          <FaTachometerAlt className="text-blue-500 text-2xl" />
        </div>
        <p className="text-3xl font-extrabold text-white mb-1">65 km/h</p>
        <p className="text-green-600 font-medium mb-2">✅ Within Limit</p>
        <p className="text-gray-400 text-sm">Colombo Main Rd</p>
        <p className="text-gray-400 text-sm">14:30</p>
      </div>

      {/* Today's Statistics */}
      <div className="bg-gray-800/80 dark:bg-gray-800 rounded-xl shadow-lg p-5 hover:scale-105 transition-transform duration-200 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Today's Stats</h2>
          <FaChartLine className="text-purple-500 text-2xl" />
        </div>
        <div className="space-y-2 text-sm mt-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Max Speed:</span>
            <span className="font-semibold text-white">85 km/h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Avg Speed:</span>
            <span className="font-semibold text-white">55 km/h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Distance:</span>
            <span className="font-semibold text-white">124 km</span>
          </div>
        </div>
      </div>

      {/* Active Violations */}
      <div className="bg-gray-800/80 dark:bg-gray-800 rounded-xl shadow-lg p-5 hover:scale-105 transition-transform duration-200 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Active Violations</h2>
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center mt-3">
          <p className="text-red-600 text-2xl font-extrabold">1</p>
          <p className="text-gray-400 text-sm">Pending Fine</p>
          <p className="text-red-600 font-semibold">Rs. 2,500</p>
          <button className="mt-2 text-blue-600 text-sm font-medium hover:underline">
            View Details
          </button>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="bg-gray-800/80 dark:bg-gray-800 rounded-xl shadow-lg p-5 hover:scale-105 transition-transform duration-200 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Vehicle Info</h2>
          <FaCar className="text-green-500 text-2xl" />
        </div>
        <div className="space-y-2 text-sm mt-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Number:</span>
            <span className="font-semibold text-white">CBB-1234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Type:</span>
            <span className="font-semibold text-white">Car</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className="font-semibold text-white">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopComponent;

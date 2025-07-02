import React from "react";

const OfficerDashboard = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <h1 className="text-3xl font-bold text-blue-900 mb-8">Officer Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gray-800/80 rounded-xl shadow p-6">
        <div className="text-gray-300">Vehicles Checked Today</div>
        <div className="text-2xl font-bold text-white">18</div>
      </div>
      <div className="bg-gray-800/80 rounded-xl shadow p-6">
        <div className="text-gray-300">Fines Issued</div>
        <div className="text-2xl font-bold text-white">5</div>
      </div>
      <div className="bg-gray-800/80 rounded-xl shadow p-6">
        <div className="text-gray-300">Active IoT Devices</div>
        <div className="text-2xl font-bold text-white">12</div>
      </div>
    </div>
    <h2 className="text-xl font-semibold mb-4 text-blue-900">
      Recent Violations
    </h2>
    <div className="bg-gray-800/80 rounded-xl shadow mb-8 overflow-x-auto">
      <table className="w-full text-white">
        <thead>
          <tr className="bg-gray-700 text-gray-300">
            <th className="p-3 text-left">Vehicle</th>
            <th className="p-3 text-left">Speed</th>
            <th className="p-3 text-left">Location</th>
            <th className="p-3 text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-700/60 transition">
            <td className="p-3 font-semibold text-blue-200">CBB-1234</td>
            <td className="p-3 text-red-400 font-bold">92 km/h</td>
            <td className="p-3">Colombo Main Rd</td>
            <td className="p-3">14:30</td>
          </tr>
          <tr className="hover:bg-gray-700/60 transition">
            <td className="p-3 font-semibold text-blue-200">ABC-5678</td>
            <td className="p-3 text-red-400 font-bold">88 km/h</td>
            <td className="p-3">Kandy Rd</td>
            <td className="p-3">13:10</td>
          </tr>
        </tbody>
      </table>
    </div>
    <h2 className="text-xl font-semibold mb-4 text-blue-900">
      IoT Device Status
    </h2>
    <div className="bg-gray-800/80 rounded-xl shadow p-6 text-white">
      <ul className="space-y-4">
        <li className="flex justify-between items-center p-2 hover:bg-gray-700/60 rounded-lg transition">
          <span>Device #1</span>
          <span className="text-green-400 font-bold">Online</span>
        </li>
        <li className="flex justify-between items-center p-2 hover:bg-gray-700/60 rounded-lg transition">
          <span>Device #2</span>
          <span className="text-green-400 font-bold">Online</span>
        </li>
        <li className="flex justify-between items-center p-2 hover:bg-gray-700/60 rounded-lg transition">
          <span>Device #3</span>
          <span className="text-red-400 font-bold">Offline</span>
        </li>
      </ul>
    </div>
  </div>
);

export default OfficerDashboard;

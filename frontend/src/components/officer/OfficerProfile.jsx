import React from "react";

const mockOfficer = {
  name: "Officer Dinsan J.",
  badgeId: "POL-2025-001",
  email: "officer.dinsan@police.lk",
  station: "Colombo Central",
};

const OfficerProfile = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <h1 className="text-3xl font-bold text-blue-900 mb-6">Officer Profile</h1>
    <div className="bg-gray-800/80 rounded-xl shadow-lg p-6 max-w-md text-white">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Name:</span>
          <span className="font-semibold text-blue-200">
            {mockOfficer.name}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Badge ID:</span>
          <span className="font-semibold">{mockOfficer.badgeId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Email:</span>
          <span className="font-semibold">{mockOfficer.email}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Station:</span>
          <span className="font-semibold">{mockOfficer.station}</span>
        </div>
      </div>
      <button className="mt-6 w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        Edit Profile
      </button>
    </div>
  </div>
);

export default OfficerProfile;

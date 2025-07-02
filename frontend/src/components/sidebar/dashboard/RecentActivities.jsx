import React from "react";
import { Clock, MapPin, Gauge, CheckCircle, XCircle } from "lucide-react";

const RecentActivities = () => {
  const activities = [
    {
      time: "13:15",
      location: "Galle Road",
      speed: "45 km/h",
      speedLimit: "60 km/h",
      status: "Normal",
    },
    {
      time: "11:45",
      location: "Kandy Highway",
      speed: "75 km/h",
      speedLimit: "60 km/h",
      status: "Violation",
    },
    {
      time: "10:30",
      location: "Negombo Road",
      speed: "55 km/h",
      speedLimit: "60 km/h",
      status: "Normal",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Violation":
        return {
          colorClass: "bg-red-100 text-red-800",
          icon: <XCircle className="w-4 h-4 mr-1 text-red-600" />,
        };
      case "Normal":
        return {
          colorClass: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4 mr-1 text-green-600" />,
        };
      default:
        return {
          colorClass: "bg-gray-100 text-gray-800",
          icon: null,
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-2xl shadow-gray-500/50 font-sans mt-6 ml-10">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Gauge className="w-6 h-6 mr-2 text-blue-400" /> Recent Activities
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700 text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-400 uppercase tracking-wider">
                <Clock className="inline w-4 h-4 mr-1 text-gray-400" /> Time
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-400 uppercase tracking-wider">
                <MapPin className="inline w-4 h-4 mr-1 text-gray-400" />{" "}
                Location
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-400 uppercase tracking-wider">
                Speed
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-400 uppercase tracking-wider">
                Speed Limit
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {activities.map((activity, index) => {
              const statusInfo = getStatusStyle(activity.status);
              return (
                <tr key={index} className="hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-200">
                    {activity.time}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-200">
                    {activity.location}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-200">
                    {activity.speed}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-200">
                    {activity.speedLimit}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.colorClass}`}
                    >
                      {statusInfo.icon}
                      {activity.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivities;

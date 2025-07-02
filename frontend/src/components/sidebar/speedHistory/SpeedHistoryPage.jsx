import React from "react";
import { Line } from "react-chartjs-2";
import { FaTachometerAlt } from "react-icons/fa";
import "chart.js/auto";

const SpeedHistoryPage = () => {
  const speedData = [
    { date: "2025-05-01", time: "08:30 AM", location: "Colombo", speed: 78 },
    { date: "2025-05-03", time: "04:15 PM", location: "Kandy", speed: 92 },
    { date: "2025-05-05", time: "11:00 AM", location: "Jaffna", speed: 62 },
    { date: "2025-05-08", time: "06:20 PM", location: "Galle", speed: 85 },
    { date: "2025-05-09", time: "09:50 AM", location: "Batticaloa", speed: 74 },
  ];

  const chartData = {
    labels: speedData.map((entry) => entry.date),
    datasets: [
      {
        label: "Speed (km/h)",
        data: speedData.map((entry) => entry.speed),
        fill: false,
        borderColor: "#38bdf8", // sky-400
        tension: 0.3,
        pointBackgroundColor: "#0ea5e9",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, suggestedMax: 120 },
    },
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <FaTachometerAlt className="text-sky-500 text-3xl mr-3" />
        <h1 className="text-4xl font-extrabold text-blue-900">
          <div className="text-blue-900 text-3xl">Speed History</div>
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Table Card */}
        <div
          className="bg-gray-800 dark:bg-gray-900/90 rounded-xl shadow p-4 backdrop-blur-md animate-slide-fade-in opacity-0"
          style={{ animationDelay: "0s", animationFillMode: "forwards" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-white">
            History Records
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-200">
              <thead className="bg-sky-100 dark:bg-gray-700 text-sky-800 dark:text-sky-300">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Speed (km/h)</th>
                </tr>
              </thead>
              <tbody>
                {speedData.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-2">{entry.date}</td>
                    <td className="px-4 py-2">{entry.time}</td>
                    <td className="px-4 py-2">{entry.location}</td>
                    <td
                      className={`px-4 py-2 font-bold ${
                        entry.speed > 80 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {entry.speed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Card */}
        <div
          className="bg-gray-800 dark:bg-gray-900/90 rounded-xl shadow p-4 backdrop-blur-md animate-slide-fade-in opacity-0"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Speed Trend</h2>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default SpeedHistoryPage;

import React from "react";
import {
  FaExclamationTriangle,
  FaMoneyBillAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaTachometerAlt,
} from "react-icons/fa";

const Violation = () => {
  const violations = [
    {
      date: "2025-05-01",
      location: "Colombo",
      speedLimit: 60,
      recordedSpeed: 85,
      fine: "Rs. 5000",
      status: "Unpaid",
    },
    {
      date: "2025-04-15",
      location: "Kandy",
      speedLimit: 50,
      recordedSpeed: 72,
      fine: "Rs. 3000",
      status: "Paid",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-white">
        <FaExclamationTriangle className="text-red-500 text-2xl" />
        <div className="text-red-500 text-3xl">Speed Violations</div>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {violations.map((item, idx) => {
          const exceeded = item.recordedSpeed - item.speedLimit;
          const isPaid = item.status === "Paid";

          return (
            <div
              key={idx}
              className={`bg-gray-800/80 dark:bg-gray-800 rounded-xl shadow-lg p-5 backdrop-blur-md text-white transform transition duration-500 opacity-0 animate-slide-fade-in`}
              style={{
                animationDelay: `${idx * 0.2}s`,
                animationFillMode: "forwards",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
                  <FaTachometerAlt className="text-blue-400" /> Speeding
                </h2>
                <span
                  className={`text-sm font-medium flex items-center gap-1 px-3 py-1 rounded-full ${
                    isPaid ? "bg-green-600 text-white" : "bg-red-600 text-white"
                  }`}
                >
                  {isPaid ? (
                    <>
                      <FaCheckCircle /> Paid
                    </>
                  ) : (
                    <>
                      <FaTimesCircle /> Unpaid
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-1 text-sm mt-3">
                <p>
                  <span className="text-gray-400">Date:</span>{" "}
                  <span className="text-white font-medium">{item.date}</span>
                </p>
                <p>
                  <span className="text-gray-400">Location:</span>{" "}
                  <span className="text-white font-medium">
                    {item.location}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Speed Limit:</span>{" "}
                  <span className="text-white">{item.speedLimit} km/h</span>
                </p>
                <p>
                  <span className="text-gray-400">Your Speed:</span>{" "}
                  <span className="text-white">{item.recordedSpeed} km/h</span>
                </p>
                <p>
                  <span className="text-gray-400">Exceeded By:</span>{" "}
                  <span className="text-yellow-400 font-semibold">
                    {exceeded} km/h
                  </span>
                </p>
                <p className="flex items-center gap-2 mt-2 text-white">
                  <FaMoneyBillAlt className="text-green-400" />
                  <span className="text-lg font-bold">{item.fine}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Violation;

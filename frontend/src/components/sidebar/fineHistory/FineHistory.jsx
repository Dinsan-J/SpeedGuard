import React from "react";
import { FaMoneyBillWave } from "react-icons/fa";

const FineHistory = () => {
  const fines = [
    {
      date: "2025-04-01",
      amount: "Rs. 5000",
      status: "Paid",
    },
    {
      date: "2025-03-15",
      amount: "Rs. 7500",
      status: "Unpaid",
    },
  ];

  return (
    <div className="p-6 text-white animate-slide-fade-in opacity-0">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-white">
        <FaMoneyBillWave className="text-green-500" />

        <div className="text-blue-900 text-3xl"> Fine History</div>
      </h1>

      <div className="bg-gray-900/80 rounded-xl shadow-lg p-6 backdrop-blur-md border border-gray-700">
        <ul className="space-y-4">
          {fines.map((fine, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center p-4 rounded-lg bg-gray-800/60 border border-gray-700"
            >
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <div className="text-white font-semibold">{fine.date}</div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-sm text-gray-400">Amount</p>
                <div className="text-white font-semibold">{fine.amount}</div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                  fine.status === "Paid"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {fine.status}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FineHistory;

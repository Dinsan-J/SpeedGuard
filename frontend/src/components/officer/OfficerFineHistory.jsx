import React, { useState } from "react";

const mockFines = [
  { vehicle: "CBB-1234", amount: 2500, status: "Unpaid", date: "2025-05-10" },
  { vehicle: "ABC-5678", amount: 5000, status: "Paid", date: "2025-05-09" },
  { vehicle: "XYZ-9999", amount: 3000, status: "Unpaid", date: "2025-05-08" },
];

const OfficerFineHistory = () => {
  const [filter, setFilter] = useState("");
  const fines = filter
    ? mockFines.filter((f) => f.status === filter)
    : mockFines;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">
        Officer Fine History
      </h1>
      <div className="mb-4">
        <label className="mr-2 font-semibold text-gray-700">
          Filter by status:
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>
      <div className="bg-gray-800/80 rounded-xl shadow p-6 overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="bg-gray-700 text-gray-300">
              <th className="p-3 text-left">Vehicle</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {fines.map((fine, idx) => (
              <tr key={idx} className="hover:bg-gray-700/60 transition">
                <td className="p-3 font-semibold text-blue-200">
                  {fine.vehicle}
                </td>
                <td className="p-3">Rs. {fine.amount}</td>
                <td
                  className={`p-3 font-bold ${
                    fine.status === "Paid" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {fine.status}
                </td>
                <td className="p-3">{fine.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfficerFineHistory;

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const mockVehicle = {
  plate: "CBB-1234",
  owner: "Dinsan J.",
  type: "Car",
  status: "Active",
};

const IssueFine = () => {
  const [plateInput, setPlateInput] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handlePlateSubmit = (e) => {
    e.preventDefault();
    if (plateInput.trim().toUpperCase() === mockVehicle.plate) {
      setVehicle(mockVehicle);
    } else {
      toast.error("🚫 Vehicle not found!");
    }
  };

  const handleFineSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("✅ Fine issued successfully!");
      setAmount("");
      setReason("");
    }, 900);
  };

  return (
    <div
      className={`min-h-screen px-4 py-10 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } bg-gray-100`}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-8 text-center">
          🚔 Issue Traffic Fine
        </h1>

        {/* Step 1: Plate Number Form */}
        {!vehicle && (
          <form
            onSubmit={handlePlateSubmit}
            className="bg-gray-800/80 rounded-xl shadow-lg p-6 space-y-4"
          >
            <label className="block text-lg font-semibold text-gray-200">
              Enter Vehicle Plate Number
            </label>
            <input
              type="text"
              placeholder="e.g., CBB-1234"
              value={plateInput}
              onChange={(e) => setPlateInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg uppercase bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
            >
              🔍 Search Vehicle
            </button>
          </form>
        )}

        {/* Step 2: Show Vehicle + Fine Form */}
        {vehicle && (
          <div className="space-y-6 mt-6 animate-fade-in">
            {/* Vehicle Info */}
            <div className="bg-gray-800/80 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-200">
                Vehicle Details
              </h2>
              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>Plate:</strong>{" "}
                  <span className="text-blue-400 font-semibold">
                    {vehicle.plate}
                  </span>
                </p>
                <p>
                  <strong>Owner:</strong> {vehicle.owner}
                </p>
                <p>
                  <strong>Type:</strong> {vehicle.type}
                </p>
                <p>
                  <strong>Status:</strong> {vehicle.status}
                </p>
              </div>
            </div>

            {/* Fine Form */}
            <form
              onSubmit={handleFineSubmit}
              className="bg-gray-800/80 rounded-xl shadow-lg p-6 space-y-4"
            >
              <div>
                <label className="block mb-1 font-semibold text-gray-200">
                  💰 Fine Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-gray-200">
                  ✍️ Reason
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg font-bold transition-colors ${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? "Issuing..." : "✅ Issue Fine"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueFine;

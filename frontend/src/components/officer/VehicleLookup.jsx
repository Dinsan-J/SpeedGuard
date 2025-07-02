import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const mockVehicle = {
  plate: "CBB-1234",
  owner: "Dinsan J.",
  type: "Car",
  status: "Active",
};

const VehicleLookup = () => {
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (plate.trim().toUpperCase() === mockVehicle.plate) {
      setVehicle(mockVehicle);
    } else {
      setVehicle(null);
      toast.error("🚫 Vehicle not found!");
    }
  };

  return (
    <div
      className={`min-h-screen px-4 py-10 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } bg-gray-100`}
    >
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-8 text-center">
          🚗 Vehicle Lookup
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/80 rounded-xl shadow-lg p-6 space-y-4"
        >
          <label className="block text-lg font-semibold text-gray-200">
            Enter Plate Number
          </label>
          <input
            type="text"
            placeholder="e.g., CBB-1234"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 rounded-lg uppercase bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            🔍 Search
          </button>
        </form>

        {vehicle && (
          <div className="bg-gray-800/80 rounded-xl shadow-lg p-6 mt-6 animate-fade-in text-gray-300">
            <h2 className="text-lg font-semibold mb-3 text-gray-200">
              Vehicle Details
            </h2>
            <div className="space-y-2">
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
        )}
      </div>
    </div>
  );
};

export default VehicleLookup;

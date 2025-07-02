import React, { useState } from "react";
import { predictFine } from "../services/predictFine";

function PredictForm() {
  const [formData, setFormData] = useState({
    Vehicle_Type: "Car",
    Location_Risk: "High",
    Road_Condition: "School",
    Speed_Exceeded: 0, // Percentage
    Previous_Violations: 0, // New field
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const prediction = await predictFine(formData);
      setResult(prediction[0]);
    } catch (err) {
      alert("Failed to get prediction");
    }
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Fine Prediction Form
      </h2>
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-4 bg-white p-6 rounded-lg shadow-lg"
      >
        <div className="flex flex-col">
          <label
            htmlFor="Vehicle_Type"
            className="mb-2 text-sm font-medium text-gray-600"
          >
            Vehicle Type
          </label>
          <select
            id="Vehicle_Type"
            name="Vehicle_Type"
            value={formData.Vehicle_Type}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="Car">Car</option>
            <option value="Truck">Truck</option>
            <option value="Bike">Bike</option>
            <option value="Heavy Vehicle">Heavy Vehicle</option>
            <option value="Auto">Auto</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="Location_Risk"
            className="mb-2 text-sm font-medium text-gray-600"
          >
            Location Risk
          </label>
          <select
            id="Location_Risk"
            name="Location_Risk"
            value={formData.Location_Risk}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="Road_Condition"
            className="mb-2 text-sm font-medium text-gray-600"
          >
            Road Condition
          </label>
          <select
            id="Road_Condition"
            name="Road_Condition"
            value={formData.Road_Condition}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="School">School</option>
            <option value="Hospital">Hospital</option>
            <option value="None">None</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="Speed_Exceeded"
            className="mb-2 text-sm font-medium text-gray-600"
          >
            Speed Exceeded (%) - Enter a value like 20 for 20% over the limit
          </label>
          <input
            type="number"
            id="Speed_Exceeded"
            name="Speed_Exceeded"
            value={formData.Speed_Exceeded}
            onChange={handleChange}
            placeholder="Enter Speed Exceeded Percentage"
            className="p-2 border border-gray-300 rounded-md"
            min="0"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="Previous_Violations"
            className="mb-2 text-sm font-medium text-gray-600"
          >
            Previous Violations (Number of past offenses)
          </label>
          <input
            type="number"
            id="Previous_Violations"
            name="Previous_Violations"
            value={formData.Previous_Violations}
            onChange={handleChange}
            placeholder="Enter number of previous violations"
            className="p-2 border border-gray-300 rounded-md"
            min="0"
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 mt-4 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-300"
        >
          Predict Fine
        </button>
      </form>

      {result !== null && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-md w-full text-center">
          <h3 className="text-lg font-semibold">Predicted Fine: Rs {result}</h3>
        </div>
      )}
    </div>
  );
}

export default PredictForm;

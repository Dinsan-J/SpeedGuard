import SpeedLog from "../models/SpeedLog.js";
import Vehicle from "../models/Vehicle.js";

// Add a speed log (simulate IoT)
export const addSpeedLog = async (req, res) => {
  const { plateNumber, speed, location } = req.body;

  try {
    const vehicle = await Vehicle.findOne({ plateNumber });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const log = new SpeedLog({
      vehicle: vehicle._id,
      speed,
      location,
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all speed logs by plate number
export const getSpeedLogs = async (req, res) => {
  const { plateNumber } = req.params;

  try {
    const vehicle = await Vehicle.findOne({ plateNumber });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const logs = await SpeedLog.find({ vehicle: vehicle._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

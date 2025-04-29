import Fine from "../models/Fine.js";
import Vehicle from "../models/Vehicle.js";

export const issueFine = async (req, res) => {
  const { plateNumber, speed, location, fineAmount, reason, officerId } =
    req.body;

  try {
    const vehicle = await Vehicle.findOne({ plateNumber });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const fine = new Fine({
      vehicle: vehicle._id,
      officer: officerId, // For now pass manually
      speed,
      location,
      fineAmount,
      reason,
    });

    await fine.save();
    res.status(201).json(fine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFinesByPlate = async (req, res) => {
  const { plateNumber } = req.params;

  try {
    const vehicle = await Vehicle.findOne({ plateNumber });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const fines = await Fine.find({ vehicle: vehicle._id })
      .populate("officer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(fines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all fines issued by the logged-in officer
export const getFinesByOfficer = async (req, res) => {
  try {
    const fines = await Fine.find({ officer: req.user._id })
      .populate("vehicle", "plateNumber owner")
      .sort({ createdAt: -1 });

    res.status(200).json({ fines });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

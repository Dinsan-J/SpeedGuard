import Vehicle from "../models/Vehicle.js";

// Register vehicle
export const registerVehicle = async (req, res) => {
  const { plateNumber, model, make, year } = req.body;
  const ownerId = req.user._id;

  try {
    const existingVehicle = await Vehicle.findOne({ plateNumber });
    if (existingVehicle) {
      return res.status(400).json({ message: "Vehicle already registered" });
    }

    const vehicle = new Vehicle({
      plateNumber,
      model,
      make,
      year,
      owner: ownerId,
    });
    await vehicle.save();

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vehicles of the logged-in user
export const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const mongoose = require("mongoose");

const MONGO_URI =
  "mongodb://deenu1835:Lji8aW4CE2bOVnsJ@ac-x3oqzzo-shard-00-00.sr16oht.mongodb.net:27017,ac-x3oqzzo-shard-00-01.sr16oht.mongodb.net:27017,ac-x3oqzzo-shard-00-02.sr16oht.mongodb.net:27017/?ssl=true&replicaSet=atlas-s6z7iy-shard-0&authSource=admin&appName=Cluster0";

async function main() {
  await mongoose.connect(MONGO_URI);

  // Ensure all relevant schemas are registered on this connection
  require("./models/DriverProfile");
  const User = require("./models/User");
  const Vehicle = require("./models/Vehicle");

  const email = "deenu1835@gmail.com";
  const vehicleNumber = "BHZ-9638";

  const user = await User.findOne({ email }).populate("driverProfile");
  console.log("User:", user ? { id: user._id, email: user.email, role: user.role } : null);

  const vehicle = await Vehicle.findOne({ vehicleNumber }).lean();
  console.log("Vehicle:", vehicle);

  if (user && user.driverProfile && vehicle) {
    console.log(
      "Linking vehicle to driverProfile:",
      user.driverProfile._id.toString()
    );
    await Vehicle.updateOne(
      { _id: vehicle._id },
      { $set: { driverId: user.driverProfile._id } }
    );
    const updated = await Vehicle.findById(vehicle._id).lean();
    console.log("Updated vehicle.driverId:", updated.driverId);
  } else {
    console.log("Cannot link vehicle: missing user, driverProfile, or vehicle");
  }

  // Check how many vehicles exist with plate/number BHZ-9638
  const bhzVehicles = await Vehicle.find({
    $or: [{ plateNumber: vehicleNumber }, { vehicleNumber }],
  })
    .select("_id vehicleNumber plateNumber vehicleType speedLimit driverId")
    .lean();
  console.log("Vehicles matching BHZ-9638:", bhzVehicles);

  // Show latest violations and what vehicle they currently reference.
  const Violation = require("./models/Violation");
  const latestViolations = await Violation.find({})
    .sort({ timestamp: -1 })
    .limit(10)
    .lean();

  console.log(
    "Latest violations (violation.vehicleId -> vehicle.vehicleNumber):"
  );
  for (const v of latestViolations) {
    const veh = v.vehicleId
      ? await Vehicle.findById(v.vehicleId).select("vehicleNumber")
      : null;
    console.log({
      violationId: v._id,
      speed: v.speed,
      speedLimit: v.speedLimit,
      status: v.status,
      timestamp: v.timestamp,
      violationVehicleId: v.vehicleId,
      referencedVehicleNumber: veh ? veh.vehicleNumber : null,
    });
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

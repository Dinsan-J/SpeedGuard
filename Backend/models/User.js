const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "officer"], default: "user" },
  policeId: { type: String }, // Only required for officers
  vehicles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" }], // Array of vehicle references
});

module.exports = mongoose.model("User", userSchema);

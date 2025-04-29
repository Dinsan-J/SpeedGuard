import mongoose from "mongoose";

const speedLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    speed: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SpeedLog = mongoose.model("SpeedLog", speedLogSchema);
export default SpeedLog;

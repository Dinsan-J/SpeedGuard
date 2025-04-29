import mongoose from "mongoose";

const fineSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    fineAmount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Fine = mongoose.model("Fine", fineSchema);
export default Fine;

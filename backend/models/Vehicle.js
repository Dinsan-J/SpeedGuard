import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    model: String,
    make: String,
    year: Number,
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;

import mongoose from "mongoose";

// MongoDB Atlas connection string
const uri =
  "mongodb+srv://deenu1835:ZgL97TKxHUcYI6b3@cluster0.sr16oht.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Connection error:", err));

// Define schema
const violationSchema = new mongoose.Schema({
  vehicleId: String,
  location: { lat: Number, lng: Number },
  speed: Number,
  timestamp: Date,
});

// Create model with collection name 'violations'
const Violation = mongoose.model("Violation", violationSchema, "violations");

// Dummy data
const data = [
  {
    vehicleId: "ABC1234",
    location: { lat: 7.2906, lng: 80.6337 },
    speed: 55,
    timestamp: new Date("2025-08-23T09:15:00Z"),
  },
  {
    vehicleId: "XYZ5678",
    location: { lat: 6.9271, lng: 79.8612 },
    speed: 72,
    timestamp: new Date("2025-08-23T09:20:00Z"),
  },
  {
    vehicleId: "LMN9101",
    location: { lat: 8.3114, lng: 80.4037 },
    speed: 48,
    timestamp: new Date("2025-08-23T09:25:00Z"),
  },
  {
    vehicleId: "PQR3456",
    location: { lat: 7.8731, lng: 80.7718 },
    speed: 64,
    timestamp: new Date("2025-08-23T09:30:00Z"),
  },
  {
    vehicleId: "DEF7890",
    location: { lat: 9.6615, lng: 80.0255 },
    speed: 82,
    timestamp: new Date("2025-08-23T09:35:00Z"),
  },
  {
    vehicleId: "JKL2222",
    location: { lat: 7.957, lng: 81.0 },
    speed: 43,
    timestamp: new Date("2025-08-23T09:40:00Z"),
  },
  {
    vehicleId: "UVW3333",
    location: { lat: 6.0535, lng: 80.22 },
    speed: 68,
    timestamp: new Date("2025-08-23T09:45:00Z"),
  },
  {
    vehicleId: "HIJ4444",
    location: { lat: 7.25, lng: 80.6 },
    speed: 59,
    timestamp: new Date("2025-08-23T09:50:00Z"),
  },
  {
    vehicleId: "NOP5555",
    location: { lat: 6.8, lng: 79.95 },
    speed: 77,
    timestamp: new Date("2025-08-23T09:55:00Z"),
  },
  {
    vehicleId: "RST6666",
    location: { lat: 9.2671, lng: 80.817 },
    speed: 50,
    timestamp: new Date("2025-08-23T10:00:00Z"),
  },
];

// Insert data
Violation.insertMany(data)
  .then(() => {
    console.log("Data inserted into 'violations' collection!");
    mongoose.disconnect();
  })
  .catch((err) => console.error("Insert error:", err));

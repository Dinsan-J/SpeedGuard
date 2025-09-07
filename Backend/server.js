require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const allowedOrigins = [
  "http://localhost:8080",
  "https://speedguard-l2rhwsneb-dinsan-js-projects.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // if you use cookies or authentication
  })
);
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", require("./routes/auth")); // update path if needed
app.use("/api/vehicle", require("./routes/vehicle"));
app.use("/api/violation", require("./routes/violation"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

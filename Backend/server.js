require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(
  cors({
    origin: [
      "https://speedguard-nine.vercel.app", // backend
      "https://https://speedguard-zeta.vercel.app/", // <-- your deployed frontend URL
    ],
    credentials: true,
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

app.use("/api/auth", require("../routes/auth"));

// Vercel handler
module.exports = app;

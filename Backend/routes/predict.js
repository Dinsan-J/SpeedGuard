const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const router = express.Router();

// POST /api/predict-fine
router.post("/predict-fine", (req, res) => {
  const inputData = JSON.stringify(req.body);

  // Correct Python executable and absolute path to script

  const pyPath = path.join(__dirname, "../Ml/fine_prediction.py");
  const py = spawn("python", [pyPath, inputData]);

  let result = "";
  let errorOutput = "";

  py.stdout.on("data", (data) => {
    result += data.toString();
  });

  py.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error("Python error:", data.toString());
  });

  py.on("close", (code) => {
    if (code === 0) {
      try {
        const parsed = JSON.parse(result);
        res.json(parsed);
      } catch (err) {
        res.status(500).json({
          error: "Invalid JSON from Python script",
          details: err.message,
        });
      }
    } else {
      res
        .status(500)
        .json({ error: "Python script failed", details: errorOutput });
    }
  });
});

module.exports = router;

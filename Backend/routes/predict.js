const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const router = express.Router();

// Helper function to run Python prediction
function runPrediction(inputData) {
  return new Promise((resolve, reject) => {
    const pyPath = path.join(__dirname, "../ml/fine_prediction.py");
    const py = spawn("python", [pyPath, JSON.stringify(inputData)]);

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
          resolve(parsed);
        } catch (err) {
          reject({ error: "Invalid JSON from Python script", details: err.message });
        }
      } else {
        reject({ error: "Python script failed", details: errorOutput });
      }
    });
  });
}

// POST /api/predict-fine
router.post("/predict-fine", async (req, res) => {
  try {
    const result = await runPrediction(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// POST /api/predict-violation-fine - Calculate fine for a violation
router.post("/predict-violation-fine", async (req, res) => {
  try {
    const { speed, speedLimit, locationType, timeOfDay, pastViolations } = req.body;
    
    const speedOverLimit = speed - (speedLimit || 70);
    
    const payload = {
      SpeedOverLimit: speedOverLimit,
      LocationType: locationType || "Urban",
      TimeOfDay: timeOfDay || "Day",
      PastViolations: pastViolations || 0
    };

    const result = await runPrediction(payload);
    res.json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;

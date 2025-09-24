const express = require("express");
const { spawn } = require("child_process");
const router = express.Router();

// POST /api/predict-fine
router.post("/predict-fine", (req, res) => {
  const inputData = JSON.stringify(req.body);
  // Make sure your Python script path is correct
  const py = spawn("python3", ["backend/ml/fine_prediction.py", inputData]);

  let result = "";
  py.stdout.on("data", (data) => (result += data.toString()));
  py.stderr.on("data", (data) =>
    console.error("Python error:", data.toString())
  );

  py.on("close", (code) => {
    if (code === 0) {
      res.json(JSON.parse(result));
    } else {
      res.status(500).json({ error: "Python script failed" });
    }
  });
});

module.exports = router;

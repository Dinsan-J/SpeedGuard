// Get recent violations
router.get("/", async (req, res) => {
  try {
    const violations = await Violation.find({ speed: { $gt: 70 } }) // only fetch above 70
      .sort({ timestamp: -1 }); // remove .limit(10) to return all
    res.json({ success: true, violations });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching violations" });
  }
});

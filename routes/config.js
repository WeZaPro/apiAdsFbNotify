// backend/routes/config.js
const express = require("express");
const router = express.Router();
const { saveUserConfig } = require("../utils/db");

router.post("/save", async (req, res) => {
  const { lineUserId, fbAccessToken, notifyConfig } = req.body;
  await saveUserConfig(lineUserId, fbAccessToken, notifyConfig);
  res.json({ message: "Config saved" });
});

module.exports = router;

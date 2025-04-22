// backend/routes/webhook.js
const express = require("express");
const router = express.Router();
const { handleLineEvent } = require("../controllers/lineController");
const crypto = require("crypto");

router.post(
  "/",
  express.json({ verify: verifySignature }),
  async (req, res) => {
    const events = req.body.events;
    console.log("events/webhook ", events);
    for (const event of events) {
      await handleLineEvent(event);
    }
    res.status(200).send("OK");
  }
);

function verifySignature(req, res, buf) {
  const signature = req.get("X-Line-Signature");
  const hash = crypto
    .createHmac("SHA256", process.env.LINE_CHANNEL_SECRET)
    .update(buf)
    .digest("base64");

  if (signature !== hash) {
    throw new Error("Invalid LINE signature");
  }
}

module.exports = router;

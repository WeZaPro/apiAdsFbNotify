// backend/index.js
require("dotenv").config();
const cron = require("node-cron");
const express = require("express");
const app = express();
const webhook = require("./routes/webhook");
// const auth = require("./routes/auth");
const config = require("./routes/config");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();

const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI;

app.use(express.json());
app.use(cors({ origin: process.env.Frontend, credentials: true }));
app.use("/webhook", webhook);
// app.use("/auth", auth);
app.use("/config", config);

// longlive token
// Step 1: Facebook OAuth Login URL
app.get("/acctoken", (req, res) => {
  const fbLoginUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(
    FB_REDIRECT_URI
  )}&scope=ads_read,ads_management&response_type=code`;
  res.redirect(fbLoginUrl);
});

// Step 2: Callback after user login
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res
      .status(400)
      .json({ error: "Authorization code not found in request" });
  }

  try {
    // Step 3: Exchange code for short-lived access token
    const tokenRes = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: FB_APP_ID,
          redirect_uri: FB_REDIRECT_URI,
          client_secret: FB_APP_SECRET,
          code,
        },
      }
    );

    const shortToken = tokenRes.data.access_token;

    // Step 4: Exchange for long-lived access token
    const exchangeRes = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          fb_exchange_token: shortToken,
        },
      }
    );

    const longToken = exchangeRes.data.access_token;

    // Redirect to frontend with long-lived token
    res.redirect(`${process.env.Frontend}/dashboard?token=${longToken}`);
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Something went wrong",
      details: err.response?.data || err.message,
    });
  }
});

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Facebook Ads API application." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// // backend/routes/auth.js
// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const { storeLineUserId } = require("../utils/db");

// router.get("/login", (req, res) => {
//   const redirectUri = process.env.LINE_REDIRECT_URI;
//   const state = "myCustomState";
//   const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.LINE_LOGIN_CHANNEL_ID}&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile`;

//   res.redirect(url);
// });

// router.get("/callback", async (req, res) => {
//   const { code } = req.query;
//   const tokenRes = await axios.post(
//     "https://api.line.me/oauth2/v2.1/token",
//     null,
//     {
//       params: {
//         grant_type: "authorization_code",
//         code,
//         redirect_uri: process.env.LINE_REDIRECT_URI,
//         client_id: process.env.LINE_LOGIN_CHANNEL_ID,
//         client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET,
//       },
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     }
//   );

//   const idToken = tokenRes.data.id_token;
//   const decoded = JSON.parse(
//     Buffer.from(idToken.split(".")[1], "base64").toString()
//   );
//   const lineUserId = decoded.sub;

//   await storeLineUserId(lineUserId);
//   res.redirect(`https://your-frontend.com/setting?lineUserId=${lineUserId}`);
// });

// module.exports = router;

// backend/services/notifyService.js
const axios = require("axios");
require("dotenv").config();

exports.replyMessage = async (token, text) => {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken: token,
      messages: [{ type: "text", text }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
};

exports.pushMessage = async (to, text) => {
  console.log(`Sending message to ${to}: ${text}`); // เพิ่ม log
  await axios.post(
    "https://api.line.me/v2/bot/message/push",
    {
      to,
      messages: [{ type: "text", text }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
};

// exports.pushMessage = async (userId, text) => {
//   await axios.post(
//     "https://api.line.me/v2/bot/message/push",
//     {
//       to: userId,
//       messages: [{ type: "text", text }],
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };

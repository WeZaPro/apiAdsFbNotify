// backend/services/lineService.js
const axios = require("axios");

exports.getLineProfile = async (userId) => {
  const res = await axios.get(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });

  return res.data; // { userId, displayName, pictureUrl, statusMessage }
};

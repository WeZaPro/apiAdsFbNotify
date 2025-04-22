// // backend/services/facebookService.js
// const axios = require("axios");

// exports.getAdPerformance = async (accessToken, adAccountId) => {
//   const fields = "campaign_name,ad_name,ctr";
//   const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/ads?fields=${fields}&access_token=${accessToken}`;
//   const res = await axios.get(url);
//   return res.data.data;
// };

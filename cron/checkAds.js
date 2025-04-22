// backend/cron/checkAds.js
const { getAllUsersWithConfig } = require("../utils/db");
const { getAdPerformance } = require("../services/facebookService");
const { pushMessage } = require("../services/notifyService");

exports.checkAllUsers = async () => {
  const users = await getAllUsersWithConfig();

  for (const user of users) {
    const ads = await getAdPerformance(user.fbAccessToken, user.fbAdAccountId);
    for (const ad of ads) {
      if (parseFloat(ad.ctr) < 1.0) {
        await pushMessage(
          user.lineUserId,
          `⚠️ CTR ของแคมเปญ ${ad.ad_name} ต่ำกว่า 1%`
        );
      }
    }
  }
};

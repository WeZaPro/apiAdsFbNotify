const { pushMessage } = require("../services/notifyService");
const { getAllLineUserIds } = require("../utils/db"); // ต้องมี function นี้ใน db.js
const { fetchFacebookAdsInsights } = require("../utils/getFbAds"); // ต้องมี function นี้ใน db.js

exports.sendFBdata = async () => {
  // console.log("sendFBdata:");
  const users = await getAllLineUserIds(); // ดึง lineUserId ทั้งหมดจาก DB

  for (const user of users) {
    console.log("Users fetched user from DB:", user);
    const message = `${user.displayName}📣 แจ้งเตือนจาก Facebook: ข้อมูลใหม่มาแล้ว!`;
    try {
      const ads_id = JSON.parse(user.ads_id || "[]");
      const check_rules = JSON.parse(user.notifyConfig || "{}");

      const userObj = {
        LINE_USER_ID: user.lineUserId,
        displayName: user.displayName,
        AD_ACCOUNT_ID: user.adAccountId,
        FB_ACCESS_TOKEN: user.fbAccessToken,
        LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN,
        ads_id,
        check_rules,

        MsgCheck: user.MsgCheck,
        SpendCheck: user.SpendCheck,
        CtrCheck: user.CtrCheck,
        CpmCheck: user.CpmCheck,
        costMsgValue: user.costMsgValue,
        SpendValue: user.SpendValue,
        CtrValue: user.CtrValue,
        CpmValue: user.CpmValue,
        triggerTime: user.triggerTime,

        _date_preset: user.alertTime, // หรือปรับตามความเหมาะสม
      };

      await fetchFacebookAdsInsights(userObj, user.fbAccessToken);
    } catch (error) {
      console.error(
        `❌ ส่งข้อความถึง ${user.lineUserId} ไม่สำเร็จ: `,
        error.message
      );
    }
  }
};

// const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
// const cron = require("node-cron");
// const express = require("express");
require("dotenv").config();

const check_imp = 100;
function convertTime(_timer) {
  const timeMap = {
    today: "วันนี้",
    yesterday: "เมื่อวานนี้",
    this_month: "เดือนนี้",
    last_7d: "7 วันล่าสุด",
  };
  return timeMap[_timer] || "-";
}

exports.fetchFacebookAdsInsights = async (userObj) => {
  console.log("userObj ", userObj);
  const allowedAdIds = userObj.ads_id || [];

  if (allowedAdIds.length === 0) {
    console.log(`⚠️ [${userObj.LINE_USER_ID}] ไม่มี ads_id ใน user.json`);
    return;
  }

  const _params = {
    // access_token: userObj.fbAccessToken,
    access_token:
      "EAAFxXnwMhMoBOZCCAN9PxehjosjzjkgBHH0Qm3F5ZC3tpWNHZCVnlLVdq56mzJmgRY5pUQjwINP0StVsXgZC3OqGMWoumfteA7HiwXeu7Ttrh6IZB5Cx4CSA121MWFkhdbZAIbablpuI5TcBt2hOatOBnWNmyo2SA3IB6xvZCCoUVe7PvvZAJMkmL4YG8FdZAeSXz1K1AH5LCTtpqZAZASQ",
    level: "ad",
    fields:
      "ad_id,ad_name,campaign_name,adset_name,cpc,ctr,cpm,reach,impressions,actions,spend,cost_per_action_type",
    date_preset: userObj._date_preset,
    filtering: [
      {
        field: "ad.id",
        operator: "IN",
        value: allowedAdIds,
      },
    ],
  };

  try {
    const res = await axios.get(
      `https://graph.facebook.com/v19.0/act_${userObj.AD_ACCOUNT_ID}/insights`,
      { params: _params }
    );

    const adsData = res.data.data.filter(
      (item) => parseInt(item.impressions || "0") > check_imp
    );

    console.log("adsData ", adsData);

    console.log(
      `[${new Date().toLocaleString()}] [${userObj.LINE_USER_ID}] ดึงข้อมูล ${
        adsData.length
      } ชิ้น`
    );

    for (const item of adsData) {
      const actions = item.actions || [];
      const costPerAction = item.cost_per_action_type || [];
      const getActionValue = (type) =>
        actions.find((act) => act.action_type === type)?.value || 0;
      const getCostPerResult = (type) =>
        costPerAction.find((act) => act.action_type === type)?.value || 0;

      const cost_per_message = parseFloat(
        getCostPerResult("onsite_conversion.messaging_conversation_started_7d")
      );
      const spend = parseFloat(item.spend || 0);
      const ctr = parseFloat(item.ctr || 0);
      const cpm = parseFloat(item.cpm || 0);

      const alerts = [];
      //   const rule = userObj.check_rules || {};
      const rule =
        {
          cost_per_message: { enabled: true, value: 10 },
          spend: { enabled: false, value: 100 },
          ctr: { enabled: true, value: 1.5 },
          cpm: { enabled: false, value: 100 },
        } || {};

      if (
        rule.cost_per_message?.enabled &&
        cost_per_message > rule.cost_per_message.value
      ) {
        alerts.push(
          `🔺 Cost per Message สูง: ${cost_per_message} > ${rule.cost_per_message.value}`
        );
      }
      if (rule.spend?.enabled && spend > rule.spend.value) {
        alerts.push(`💸 Spend สูง: ${spend} > ${rule.spend.value}`);
      }
      if (rule.ctr?.enabled && ctr < rule.ctr.value) {
        alerts.push(`📉 CTR ต่ำ: ${ctr}% < ${rule.ctr.value}%`);
      }
      if (rule.cpm?.enabled && cpm > rule.cpm.value) {
        alerts.push(`📈 CPM สูง: ${cpm} > ${rule.cpm.value}`);
      }

      if (alerts.length > 0) {
        const msg = `🔔แจ้งเตือน : ${convertTime(
          userObj._date_preset
        )}\n🕒 เวลา: ${moment().format("DD/MM/YYYY HH:mm:ss")}\n✔️แคมเปญ "${
          item.campaign_name
        }"\n✔️ชื่อโฆษณา: "${item.ad_name}"\n✅${alerts.join("\n")}⚠️`;

        // console.log(`[${userObj.LINE_USER_ID}]`, msg);
        console.log("Ads ---> ", msg);

        // ส่ง Line Notify
        // await axios.post(
        //   "https://api.line.me/v2/bot/message/push",
        //   {
        //     to: userObj.LINE_USER_ID,
        //     messages: [{ type: "text", text: msg }],
        //   },
        //   {
        //     headers: {
        //       Authorization: `Bearer ${userObj.LINE_CHANNEL_ACCESS_TOKEN}`,
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );
      }
    }
  } catch (error) {
    console.error(
      `❌ [${userObj.LINE_USER_ID}] ดึงข้อมูล Insights ไม่สำเร็จ:`,
      error.response?.data || error.message
    );
  }
};

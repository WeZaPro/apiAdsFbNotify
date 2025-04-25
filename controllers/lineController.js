const { storeLineUserId, isLineUserExists } = require("../utils/db");
const { replyMessage } = require("../services/notifyService");
const { getLineProfile } = require("../services/lineService");
const { sendFBdata } = require("../controllers/facebookController");
const cron = require("node-cron");

exports.handleLineEvent = async (event) => {
  const userId = event.source.userId;
  const eventType = event.type;

  if (eventType === "follow") {
    const profile = await getLineProfile(userId);
    await storeLineUserId(userId, profile.displayName);
    await replyMessage(
      event.replyToken,
      "ขอบคุณที่ติดตามค่ะ! กรุณากดลงทะเบียน"
    );
  }

  if (eventType === "message") {
    const userText = event.message.text.trim();
    const exists = await isLineUserExists(userId);

    if (userText === "ลงทะเบียน") {
      if (!exists) {
        const profile = await getLineProfile(userId);
        await storeLineUserId(userId, profile.displayName);
        await replyMessage(event.replyToken, "ลงทะเบียนสำเร็จค่ะ 🎉");
      } else {
        await replyMessage(event.replyToken, "คุณได้ลงทะเบียนไว้แล้วค่ะ");
      }
      return;
    }

    if (!exists) {
      await replyMessage(
        event.replyToken,
        'กรุณาพิมพ์คำว่า "ลงทะเบียน" เพื่อเริ่มใช้งานค่ะ'
      );
    }
  }
};

// ตั้งเวลาให้ทำงานทุกวันเวลา 20:17 โมงเช้า
// cron.schedule("17 20 * * *", async () => {
//   console.log("⏰ เริ่มส่งข้อมูล Facebook ไปที่ LINE OA...");
//   await sendFBdata(); // เรียกใช้งาน controller ที่มีการ push message ไป LINE
// });

// ต้องการให้รันทุกชั่วโมง ระหว่างเวลา 06:00 - 24:00 (จริงๆ คือ 06:00 - 23:59 น. เพราะชั่วโมง 24 ไม่ถูกต้องใน cron format), คุณสามารถตั้งค่า cron expression แบบนี้:
// cron.schedule("0 6-23 * * *", async () => {
//   console.log("⏰ เริ่มส่งข้อมูล Facebook ไปที่ LINE OA...");
//   await sendFBdata();
// });

// cron.schedule("18 14 * * *", async () => {
//   //14:17
//   console.log("📆 รันตอน 08:30 ทุกวัน");
//   await sendFBdata();
// });

// รันทุกชั่วโมง เวลา HH:00 (เช่น 07:00, 08:00, ..., 23:00)
cron.schedule("0 7-23 * * *", async () => {
  console.log("📆 Cron Job: รันทุกชั่วโมงระหว่าง 07:00 ถึง 23:00");
  await sendFBdata();
});

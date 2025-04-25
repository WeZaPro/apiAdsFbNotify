// backend/utils/db.js
const mysql = require("mysql2/promise");
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

exports.storeLineUserId = async (lineUserId, displayName) => {
  await db.query(
    "INSERT IGNORE INTO users (lineUserId, displayName) VALUES (?, ?)",
    [lineUserId, displayName]
  );
};

exports.saveUserConfig = async (lineUserId, fbAccessToken, notifyConfig) => {
  await db.query(
    "UPDATE users SET fbAccessToken = ?, notifyConfig = ? WHERE lineUserId = ?",
    [fbAccessToken, JSON.stringify(notifyConfig), lineUserId]
  );
};

exports.getAllUsersWithConfig = async () => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE fbAccessToken IS NOT NULL"
  );
  return rows;
};

exports.isLineUserExists = async (lineUserId) => {
  const [rows] = await db.query(
    "SELECT 1 FROM users WHERE lineUserId = ? LIMIT 1",
    [lineUserId]
  );
  return rows.length > 0;
};

// exports.getAllLineUserIds = async () => {
//   console.log("getAllLineUserIds");
//   const [rows] = await db.query("SELECT lineUserId FROM users");
//   console.log("rows ", rows);
//   return rows;
// };

exports.getAllLineUserIds = async () => {
  console.log("getAllLineUsers");
  const [rows] = await db.query("SELECT * FROM users");

  const users = rows.map((user) => {
    return {
      ...user,
      notifyConfig: user.notifyConfig ? JSON.parse(user.notifyConfig) : null,
    };
  });

  console.log("Users with parsed notifyConfig:", users);
  return users;
};

exports.getConfigFromDb = async (lineUserId) => {
  console.log("getConfigFromDb ");
  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE lineUserId = ?",
      [lineUserId]
    );

    if (rows.length === 0) {
      console.log("ไม่พบผู้ใช้ที่มี lineUserId นี้");
      return null;
    }
    console.log("rows ", rows);
    const user = rows[0];
    console.log("user data ", user);
    const ads_id = JSON.parse(user.ads_id || "[]");
    const adAccountId = JSON.parse(user.adAccountId || "[]");
    const triggerTime = JSON.parse(user.triggerTime || "[]");

    // return user;
    return {
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      MsgCheck: user.MsgCheck,
      SpendCheck: user.SpendCheck,
      CtrCheck: user.CtrCheck,
      CpmCheck: user.CpmCheck,
      costMsgValue: user.costMsgValue,
      SpendValue: user.SpendValue,
      CtrValue: user.CtrValue,
      CpmValue: user.CpmValue,
      triggerTime,
      ads_id,
      adAccountId,
      // fbAccessToken: user.fbAccessToken,
    };
  } catch (error) {
    console.error(`❌ error: `, error.message);
    return null;
  }
};

exports.getAdsIdDb = async (lineUserId) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE lineUserId = ?",
      [lineUserId]
    );

    if (rows.length === 0) {
      console.log("ไม่พบผู้ใช้ที่มี lineUserId นี้");
      return null;
    }

    const user = rows[0];
    // console.log("user ", user);
    const ads_id = JSON.parse(user.ads_id || "[]");
    const adAccountId = JSON.parse(user.adAccountId || "[]");
    // const fbAccessToken = JSON.parse(user.fbAccessToken || "[]");

    return {
      lineUserId: user.lineUserId,
      ads_id,
      adAccountId,
      fbAccessToken: user.fbAccessToken,
    };
  } catch (error) {
    console.error(`❌ error: `, error.message);
    return null;
  }
};

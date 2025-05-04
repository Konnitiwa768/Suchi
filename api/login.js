import clientPromise from "../lib/mongo.js";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export default async (req, res) => {
  const { username, password } = req.query;
  const client = await clientPromise;
  const db = client.db("hirocoin");
  const users = db.collection("users");

  const user = await users.findOne({ username, password });
  if (!user) return res.status(401).send("Invalid credentials");

  const now = Date.now();
  const today = getToday();
  const yesterday = getYesterday();

  let streak = user.loginStreak || 0;
  if (user.lastLoginDate === yesterday) {
    streak++;
  } else if (user.lastLoginDate !== today) {
    streak = 1; // Reset streak if day is skipped
  }

  // 放置収入
  const delta = Math.floor((now - user.lastLogin) / 1000);
  const earned = delta * user.factory * 0.18;

  // ログインボーナス
  const hiroBonus = streak * 0.5;
  const challeBonus = Math.floor(streak / 3); // 3日ごとに1チャレ

  const updated = {
    hiro: user.hiro + earned + hiroBonus,
    challe: user.challe + challeBonus,
    lastLogin: now,
    lastLoginDate: today,
    loginStreak: streak
  };

  await users.updateOne({ username }, { $set: updated });

  res.status(200).json({
    username,
    ...updated,
    earned: earned.toFixed(2),
    hiroBonus,
    challeBonus
  });
};

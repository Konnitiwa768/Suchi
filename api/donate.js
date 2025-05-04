import clientPromise from "../lib/mongo.js";

export default async (req, res) => {
  const { from, to, amount } = req.query;
  const amt = parseFloat(amount);
  if (!from || !to || isNaN(amt)) return res.status(400).send("Invalid params");

  const client = await clientPromise;
  const db = client.db("hirocoin");
  const users = db.collection("users");

  const sender = await users.findOne({ username: from });
  const receiver = await users.findOne({ username: to });
  if (!sender || !receiver) return res.status(404).send("User not found");
  if (sender.hiro < amt) return res.status(400).send("Insufficient balance");

  await users.updateOne({ username: from }, { $inc: { hiro: -amt } });
  await users.updateOne({ username: to }, { $inc: { hiro: amt } });

  res.status(200).send("Transfer complete");
};

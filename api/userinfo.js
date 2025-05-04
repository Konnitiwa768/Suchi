import clientPromise from "../lib/mongo.js";

export default async (req, res) => {
  const client = await clientPromise;
  const db = client.db("hirocoin");
  const users = db.collection("users");

  const list = await users.find({}, { projection: { password: 0 } }).toArray();
  res.status(200).json(list);
};

/**
 * One-time script: create/update admin users in MongoDB.
 * Run from project root: node create-admin.mjs
 * Uses MONGODB_URI and MONGODB_DB env vars (default: mongodb://localhost:27017, agent_hub).
 */
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB || "agent_hub";

const ADMINS = [
  { email: "admin@local", password: "admin1234", fullName: "Administrateur", nickname: "Admin" },
  { email: "ilyas@local", password: "ilyas123", fullName: "Ilyas", nickname: "Ilyas" },
];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const col = client.db(DB_NAME).collection("users");

  for (const a of ADMINS) {
    const hash = bcrypt.hashSync(a.password, 10);
    const now = new Date().toISOString();
    const existing = await col.findOne({ email: a.email });
    if (existing) {
      await col.updateOne(
        { email: a.email },
        { $set: { role: "admin", nickname: a.nickname, status: "approved", full_name: a.fullName, password_hash: hash } }
      );
      console.log("Updated:", a.email);
    } else {
      await col.insertOne({
        email: a.email,
        full_name: a.fullName,
        password_hash: hash,
        role: "admin",
        nickname: a.nickname,
        status: "approved",
        created_at: now,
      });
      console.log("Created:", a.email, "/", a.password);
    }
  }

  await client.close();
  console.log("Done. Start the server (npm run server) and log in with admin@local / admin1234 or ilyas@local / ilyas123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

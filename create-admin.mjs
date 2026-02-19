/**
 * One-time script: create admin users in data.db.
 * Run from project root: node create-admin.mjs
 */
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

const db = new Database("data.db");

const ADMINS = [
  { email: "admin@local", password: "admin1234", fullName: "Administrateur", nickname: "Admin" },
  { email: "ilyas@local", password: "ilyas123", fullName: "Ilyas", nickname: "Ilyas" },
];

for (const a of ADMINS) {
  const hash = bcrypt.hashSync(a.password, 10);
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(a.email);
  if (existing) {
    db.prepare(
      "UPDATE users SET role = 'admin', nickname = ?, status = 'approved', full_name = ?, password_hash = ? WHERE email = ?"
    ).run(a.nickname, a.fullName, hash, a.email);
    console.log("Updated:", a.email);
  } else {
    const now = new Date().toISOString();
    db.prepare(
      "INSERT INTO users (email, full_name, password_hash, role, nickname, status, created_at) VALUES (?, ?, ?, 'admin', ?, 'approved', ?)"
    ).run(a.email, a.fullName, hash, a.nickname, now);
    console.log("Created:", a.email, "/", a.password);
  }
}

db.close();
console.log("Done. You can start the server (npm run server) and log in with admin@local / admin1234 or ilyas@local / ilyas123");

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

const app = express();
const PORT = 4000;

// ---------- SQLite setup ----------
const db = new Database("data.db");
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'spectate',
  nickname TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS partenariats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  type_partenariat TEXT NOT NULL,
  nature TEXT NOT NULL,
  domaine TEXT NOT NULL,
  entite_cnss TEXT NOT NULL,
  entite_concernee TEXT,
  partenaire TEXT NOT NULL,
  date_debut TEXT,
  date_fin TEXT,
  statut TEXT NOT NULL,
  description TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL
);
`);

// Migrations for existing DBs
try {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'spectate'");
} catch (_e) {}
try {
  db.exec("ALTER TABLE users ADD COLUMN nickname TEXT");
} catch (_e) {}
try {
  db.exec("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'");
} catch (_e) {}
try {
  db.exec("ALTER TABLE users ADD COLUMN created_at TEXT");
} catch (_e) {}
// Ensure existing users are approved
db.prepare("UPDATE users SET status = 'approved' WHERE status IS NULL OR status = ''").run();

app.use(cors());
app.use(express.json());

// Helper to serialize DB rows (convert numeric IDs to strings for frontend)
function serializeUser(row, includeStatus = false) {
  const role = row.role === "admin" ? "admin" : "spectate";
  const u = {
    id: String(row.id),
    email: row.email,
    fullName: row.full_name ?? "",
    role,
    nickname: row.nickname ?? row.full_name ?? row.email ?? "",
  };
  if (includeStatus) u.status = row.status ?? "approved";
  return u;
}

const ADMIN_EMAILS = ["admin@local", "ilyas@local"];

function requireAdmin(req, res, next) {
  const userId = req.headers["x-user-id"] || req.headers["X-User-Id"];
  const userEmail = req.headers["x-user-email"] || req.headers["X-User-Email"];
  if (!userId && !userEmail) {
    return res.status(401).json({ message: "Non autorisé." });
  }
  let user = null;
  if (userId) {
    user = db.prepare("SELECT id, role, email FROM users WHERE id = ? AND status = 'approved'").get(String(userId));
  }
  if (!user && userEmail && ADMIN_EMAILS.includes(userEmail)) {
    user = db.prepare("SELECT id, role, email FROM users WHERE email = ? AND status = 'approved'").get(userEmail);
  }
  if (!user) {
    return res.status(401).json({ message: "Session invalide ou expirée. Déconnectez-vous puis reconnectez-vous." });
  }
  const isAdmin = user.role === "admin" || (user.email && ADMIN_EMAILS.includes(user.email));
  if (!isAdmin) {
    return res.status(403).json({ message: "Accès réservé à l'administrateur." });
  }
  next();
}

function serializePartenariat(row) {
  return {
    id: String(row.id),
    titre: row.titre,
    type_partenariat: row.type_partenariat,
    nature: row.nature,
    domaine: row.domaine,
    entite_cnss: row.entite_cnss,
    entite_concernee: row.entite_concernee || null,
    partenaire: row.partenaire,
    date_debut: row.date_debut,
    date_fin: row.date_fin,
    statut: row.statut,
    description: row.description,
    created_by: row.created_by != null ? String(row.created_by) : null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// Try to add entite_concernee column for existing databases (ignore error if it exists)
try {
  db.exec("ALTER TABLE partenariats ADD COLUMN entite_concernee TEXT");
} catch (_err) {
  // column already exists or migration not needed
}

// ---------- AUTH ----------
app.post("/api/register", async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);
  if (existing) {
    return res.status(400).json({ message: "Cet email est déjà utilisé. Choisissez un autre email." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  db.prepare(
    "INSERT INTO users (email, full_name, password_hash, role, status, created_at) VALUES (?, ?, ?, 'spectate', 'pending', ?)"
  ).run(email, fullName || email, passwordHash, now);

  res.status(201).json({
    message: "Demande envoyée. Un administrateur doit approuver votre compte avant de vous connecter.",
  });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const userRow = db
    .prepare("SELECT id, email, full_name, password_hash, role, nickname, status FROM users WHERE email = ?")
    .get(email);

  if (!userRow) {
    return res.status(400).json({ message: "Identifiants invalides." });
  }

  if (userRow.status !== "approved") {
    return res.status(403).json({
      message: "Votre compte n'est pas encore approuvé. Contactez l'administrateur.",
    });
  }

  const ok = await bcrypt.compare(password, userRow.password_hash);
  if (!ok) {
    return res.status(400).json({ message: "Identifiants invalides." });
  }

  const now = new Date().toISOString();
  try {
    db.prepare("INSERT INTO user_logs (user_id, action, details, created_at) VALUES (?, 'login', ?, ?)")
      .run(userRow.id, email, now);
  } catch (_e) {}

  res.json(serializeUser(userRow));
});

// Current user (refresh session / role from DB)
app.get("/api/me", (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ message: "Non connecté." });
  }
  const row = db.prepare(
    "SELECT id, email, full_name, role, nickname, status FROM users WHERE id = ? AND status = 'approved'"
  ).get(userId);
  if (!row) {
    return res.status(401).json({ message: "Session invalide." });
  }
  res.json(serializeUser(row));
});

// ---------- ADMIN: USERS ----------
app.get("/api/users", requireAdmin, (req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.email, u.full_name, u.role, u.nickname, u.status, u.created_at,
              (SELECT MAX(created_at) FROM user_logs WHERE user_id = u.id AND action = 'login') AS last_login
       FROM users u
       ORDER BY u.status = 'pending' DESC, u.id ASC`
    )
    .all();
  res.json(rows.map((r) => {
    const u = serializeUser(r, true);
    u.lastLogin = (r.last_login != null && r.last_login !== "") ? r.last_login : null;
    u.createdAt = (r.created_at != null && r.created_at !== "") ? r.created_at : null;
    return u;
  }));
});

app.get("/api/users/pending", requireAdmin, (req, res) => {
  const rows = db
    .prepare("SELECT id, email, full_name, role, nickname, status FROM users WHERE status = 'pending' ORDER BY id ASC")
    .all();
  res.json(rows.map((r) => serializeUser(r, true)));
});

app.get("/api/logs", requireAdmin, (req, res) => {
  const rows = db.prepare(
    `SELECT l.id, l.user_id, l.action, l.details, l.created_at,
            u.email, u.nickname, u.full_name
     FROM user_logs l
     LEFT JOIN users u ON u.id = l.user_id
     ORDER BY l.created_at DESC
     LIMIT 500`
  ).all();
  res.json(rows.map((r) => ({
    id: String(r.id),
    userId: String(r.user_id),
    action: r.action,
    details: r.details || null,
    createdAt: r.created_at,
    userEmail: r.email || null,
    userNickname: r.nickname || r.full_name || r.email || null,
  })));
});

app.patch("/api/users/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, role, nickname } = req.body;

  const existing = db.prepare("SELECT id, status FROM users WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ message: "Utilisateur non trouvé." });
  }

  const updates = [];
  const values = [];

  if (status !== undefined && ["pending", "approved", "rejected"].includes(status)) {
    updates.push("status = ?");
    values.push(status);
  }
  if (role !== undefined && ["admin", "spectate"].includes(role)) {
    updates.push("role = ?");
    values.push(role);
  }
  if (nickname !== undefined) {
    updates.push("nickname = ?");
    values.push(String(nickname).trim() || null);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "Aucune modification fournie." });
  }

  values.push(id);
  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  const row = db
    .prepare("SELECT id, email, full_name, role, nickname, status FROM users WHERE id = ?")
    .get(id);
  res.json(serializeUser(row, true));
});

// Ensure these accounts exist and are always admin (fix on every startup, reset password too)
const SEED_ADMINS = [
  { email: "admin@local", password: "admin1234", fullName: "Administrateur", nickname: "Admin" },
  { email: "ilyas@local", password: "ilyas123", fullName: "Ilyas", nickname: "Ilyas" },
];
(function seedAdmins() {
  const updateStmt = db.prepare(
    "UPDATE users SET role = 'admin', nickname = ?, status = 'approved', full_name = ?, password_hash = ? WHERE email = ?"
  );
  const insertStmt = db.prepare(
    "INSERT INTO users (email, full_name, password_hash, role, nickname, status, created_at) VALUES (?, ?, ?, 'admin', ?, 'approved', ?)"
  );
  const now = new Date().toISOString();
  for (const a of SEED_ADMINS) {
    const hash = bcrypt.hashSync(a.password, 10);
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(a.email);
    if (!existing) {
      insertStmt.run(a.email, a.fullName, hash, a.nickname, now);
      console.log(`Admin créé: ${a.email} / ${a.password}`);
    } else {
      updateStmt.run(a.nickname, a.fullName, hash, a.email);
      console.log(`Admin mis à jour: ${a.email} / ${a.password}`);
    }
  }
})();

// ---------- PARTENARIATS ----------
app.get("/api/partenariats", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM partenariats ORDER BY datetime(created_at) DESC")
    .all();
  res.json(rows.map(serializePartenariat));
});

app.post("/api/partenariats", (req, res) => {
  const {
    titre,
    type_partenariat,
    nature,
    domaine,
    entite_cnss,
    entite_concernee = null,
    partenaire,
    date_debut = null,
    date_fin = null,
    statut,
    description = null,
    created_by = null,
  } = req.body;

  if (
    !titre ||
    !type_partenariat ||
    !nature ||
    !domaine ||
    !entite_cnss ||
    !partenaire ||
    !statut
  ) {
    return res.status(400).json({ message: "Champs obligatoires manquants." });
  }

  const existing = db
    .prepare("SELECT id FROM partenariats WHERE titre = ?")
    .get(titre);
  if (existing) {
    return res.status(400).json({ message: "Un partenariat avec ce titre existe déjà." });
  }

  const now = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT INTO partenariats (
        titre, type_partenariat, nature, domaine, entite_cnss, entite_concernee, partenaire,
        date_debut, date_fin, statut, description, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      titre,
      type_partenariat,
      nature,
      domaine,
      entite_cnss,
      entite_concernee,
      partenaire,
      date_debut,
      date_fin,
      statut,
      description,
      created_by ? Number(created_by) : null,
      now,
      now
    );

  const row = db
    .prepare("SELECT * FROM partenariats WHERE id = ?")
    .get(info.lastInsertRowid);

  res.status(201).json(serializePartenariat(row));
});

app.put("/api/partenariats/:id", (req, res) => {
  const { id } = req.params;
  const existing = db
    .prepare("SELECT * FROM partenariats WHERE id = ?")
    .get(id);
  if (!existing) {
    return res.status(404).json({ message: "Non trouvé" });
  }

  const {
    titre = existing.titre,
    type_partenariat = existing.type_partenariat,
    nature = existing.nature,
    domaine = existing.domaine,
    entite_cnss = existing.entite_cnss,
    entite_concernee = existing.entite_concernee,
    partenaire = existing.partenaire,
    date_debut = existing.date_debut,
    date_fin = existing.date_fin,
    statut = existing.statut,
    description = existing.description,
    created_by = existing.created_by,
  } = req.body;

  const duplicate = db
    .prepare("SELECT id FROM partenariats WHERE titre = ? AND id != ?")
    .get(titre, id);
  if (duplicate) {
    return res.status(400).json({ message: "Un partenariat avec ce titre existe déjà." });
  }

  const now = new Date().toISOString();

  db.prepare(
    `UPDATE partenariats SET
      titre = ?, type_partenariat = ?, nature = ?, domaine = ?, entite_cnss = ?, entite_concernee = ?,
      partenaire = ?, date_debut = ?, date_fin = ?, statut = ?, description = ?,
      created_by = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    titre,
    type_partenariat,
    nature,
    domaine,
    entite_cnss,
    entite_concernee,
    partenaire,
    date_debut,
    date_fin,
    statut,
    description,
    created_by ? Number(created_by) : null,
    now,
    id
  );

  const row = db
    .prepare("SELECT * FROM partenariats WHERE id = ?")
    .get(id);

  res.json(serializePartenariat(row));
});

app.delete("/api/partenariats/:id", (req, res) => {
  const { id } = req.params;
  const info = db
    .prepare("DELETE FROM partenariats WHERE id = ?")
    .run(id);

  if (info.changes === 0) {
    return res.status(404).json({ message: "Non trouvé" });
  }

  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Local API running on http://localhost:${PORT}`);
});
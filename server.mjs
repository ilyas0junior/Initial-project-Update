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
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS partenariats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  type_partenariat TEXT NOT NULL,
  nature TEXT NOT NULL,
  domaine TEXT NOT NULL,
  entite_cnss TEXT NOT NULL,
  partenaire TEXT NOT NULL,
  date_debut TEXT,
  date_fin TEXT,
  statut TEXT NOT NULL,
  description TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`);

app.use(cors());
app.use(express.json());

// Helper to serialize DB rows (convert numeric IDs to strings for frontend)
function serializeUser(row) {
  return {
    id: String(row.id),
    email: row.email,
    fullName: row.full_name,
  };
}

function serializePartenariat(row) {
  return {
    id: String(row.id),
    titre: row.titre,
    type_partenariat: row.type_partenariat,
    nature: row.nature,
    domaine: row.domaine,
    entite_cnss: row.entite_cnss,
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
    return res.status(400).json({ message: "Cet email est déjà utilisé." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const info = db
    .prepare(
      "INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?)"
    )
    .run(email, fullName || email, passwordHash);

  const userRow = db
    .prepare("SELECT id, email, full_name FROM users WHERE id = ?")
    .get(info.lastInsertRowid);

  res.status(201).json(serializeUser(userRow));
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const userRow = db
    .prepare("SELECT id, email, full_name, password_hash FROM users WHERE email = ?")
    .get(email);

  if (!userRow) {
    return res.status(400).json({ message: "Identifiants invalides." });
  }

  const ok = await bcrypt.compare(password, userRow.password_hash);
  if (!ok) {
    return res.status(400).json({ message: "Identifiants invalides." });
  }

  res.json(serializeUser(userRow));
});

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

  const now = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT INTO partenariats (
        titre, type_partenariat, nature, domaine, entite_cnss, partenaire,
        date_debut, date_fin, statut, description, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      titre,
      type_partenariat,
      nature,
      domaine,
      entite_cnss,
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
    partenaire = existing.partenaire,
    date_debut = existing.date_debut,
    date_fin = existing.date_fin,
    statut = existing.statut,
    description = existing.description,
    created_by = existing.created_by,
  } = req.body;

  const now = new Date().toISOString();

  db.prepare(
    `UPDATE partenariats SET
      titre = ?, type_partenariat = ?, nature = ?, domaine = ?, entite_cnss = ?,
      partenaire = ?, date_debut = ?, date_fin = ?, statut = ?, description = ?,
      created_by = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    titre,
    type_partenariat,
    nature,
    domaine,
    entite_cnss,
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
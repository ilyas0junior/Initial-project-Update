import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const PORT = 4000;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB || "agent_hub";

/** @type {import("mongodb").Db} */
let db;
/** @type {import("mongodb").Collection} */
let usersCol;
/** @type {import("mongodb").Collection} */
let userLogsCol;
/** @type {import("mongodb").Collection} */
let partenariatsCol;

function serializeUser(doc, includeStatus = false) {
  const role = doc.role === "admin" ? "admin" : "spectate";
  const u = {
    id: String(doc._id),
    email: doc.email,
    fullName: doc.full_name ?? "",
    role,
    nickname: doc.nickname ?? doc.full_name ?? doc.email ?? "",
  };
  if (includeStatus) u.status = doc.status ?? "approved";
  return u;
}

const ADMIN_EMAILS = ["admin@local", "ilyas@local"];

async function requireAdmin(req, res, next) {
  const userId = req.headers["x-user-id"] || req.headers["X-User-Id"];
  const userEmail = req.headers["x-user-email"] || req.headers["X-User-Email"];
  if (!userId && !userEmail) {
    return res.status(401).json({ message: "Non autorisé." });
  }
  let user = null;
  if (userId) {
    try {
      user = await usersCol.findOne(
        { _id: new ObjectId(userId), status: "approved" },
        { projection: { id: 1, role: 1, email: 1 } }
      );
    } catch (_e) {}
  }
  if (!user && userEmail && ADMIN_EMAILS.includes(userEmail)) {
    user = await usersCol.findOne(
      { email: userEmail, status: "approved" },
      { projection: { _id: 1, role: 1, email: 1 } }
    );
  }
  if (!user) {
    return res.status(401).json({
      message: "Session invalide ou expirée. Déconnectez-vous puis reconnectez-vous.",
    });
  }
  const isAdmin =
    user.role === "admin" || (user.email && ADMIN_EMAILS.includes(user.email));
  if (!isAdmin) {
    return res.status(403).json({ message: "Accès réservé à l'administrateur." });
  }
  next();
}

function serializePartenariat(doc) {
  return {
    id: String(doc._id),
    titre: doc.titre,
    type_partenariat: doc.type_partenariat,
    nature: doc.nature,
    domaine: doc.domaine,
    entite_cnss: doc.entite_cnss,
    entite_concernee: doc.entite_concernee || null,
    partenaire: doc.partenaire,
    date_debut: doc.date_debut,
    date_fin: doc.date_fin,
    statut: doc.statut,
    description: doc.description,
    created_by: doc.created_by != null ? String(doc.created_by) : null,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  };
}

function toObjectId(id, res) {
  try {
    return new ObjectId(id);
  } catch (_e) {
    res.status(400).json({ message: "Identifiant invalide." });
    return null;
  }
}

app.use(cors());
app.use(express.json());

// ---------- AUTH ----------
app.post("/api/register", async (req, res) => {
  const { email, password, fullName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." });
  }

  const existing = await usersCol.findOne({ email });
  if (existing) {
    return res
      .status(400)
      .json({ message: "Cet email est déjà utilisé. Choisissez un autre email." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  await usersCol.insertOne({
    email,
    full_name: fullName || email,
    password_hash: passwordHash,
    role: "spectate",
    nickname: null,
    status: "pending",
    created_at: now,
  });

  res.status(201).json({
    message:
      "Demande envoyée. Un administrateur doit approuver votre compte avant de vous connecter.",
  });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await usersCol.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Identifiants invalides." });
  }

  if (user.status !== "approved") {
    return res.status(403).json({
      message: "Votre compte n'est pas encore approuvé. Contactez l'administrateur.",
    });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(400).json({ message: "Identifiants invalides." });
  }

  const now = new Date().toISOString();
  await userLogsCol.insertOne({
    user_id: String(user._id),
    action: "login",
    details: email,
    created_at: now,
  }).catch(() => {});

  res.json(serializeUser(user));
});

app.get("/api/me", async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res.status(401).json({ message: "Non connecté." });
  }
  let user = null;
  try {
    user = await usersCol.findOne(
      { _id: new ObjectId(userId), status: "approved" },
      { projection: { password_hash: 0 } }
    );
  } catch (_e) {}
  if (!user) {
    return res.status(401).json({ message: "Session invalide." });
  }
  res.json(serializeUser(user));
});

// ---------- ADMIN: USERS ----------
app.get("/api/users", requireAdmin, async (req, res) => {
  const cursor = usersCol.aggregate([
    {
      $lookup: {
        from: "user_logs",
        let: { uid: { $toString: "$_id" } },
        pipeline: [
          { $match: { $expr: { $eq: ["$user_id", "$$uid"] }, action: "login" } },
          { $sort: { created_at: -1 } },
          { $limit: 1 },
          { $project: { created_at: 1 } },
        ],
        as: "last_login_doc",
      },
    },
    {
      $addFields: {
        last_login: { $arrayElemAt: ["$last_login_doc.created_at", 0] },
      },
    },
    { $sort: { status: -1, _id: 1 } },
  ]);
  const rows = await cursor.toArray();
  res.json(
    rows.map((r) => {
      const u = serializeUser(r, true);
      u.lastLogin = r.last_login || null;
      u.createdAt = r.created_at || null;
      return u;
    })
  );
});

app.get("/api/users/pending", requireAdmin, async (req, res) => {
  const rows = await usersCol
    .find({ status: "pending" })
    .sort({ _id: 1 })
    .toArray();
  res.json(rows.map((r) => serializeUser(r, true)));
});

app.get("/api/logs", requireAdmin, async (req, res) => {
  const logs = await userLogsCol
    .aggregate([
      {
        $lookup: {
          from: "users",
          let: { uid: { $toObjectId: "$user_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
            { $project: { email: 1, nickname: 1, full_name: 1 } },
          ],
          as: "u",
        },
      },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
      { $sort: { created_at: -1 } },
      { $limit: 500 },
      {
        $project: {
          id: { $toString: "$_id" },
          userId: "$user_id",
          action: 1,
          details: 1,
          createdAt: "$created_at",
          userEmail: "$u.email",
          userNickname: { $ifNull: ["$u.nickname", "$u.full_name", "$u.email"] },
        },
      },
    ])
    .toArray();
  res.json(logs);
});

app.patch("/api/users/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const oid = toObjectId(id, res);
  if (!oid) return;
  const { status, role, nickname } = req.body;

  const existing = await usersCol.findOne({ _id: oid }, { projection: { _id: 1, status: 1 } });
  if (!existing) {
    return res.status(404).json({ message: "Utilisateur non trouvé." });
  }

  const update = {};
  if (status !== undefined && ["pending", "approved", "rejected"].includes(status)) update.status = status;
  if (role !== undefined && ["admin", "spectate"].includes(role)) update.role = role;
  if (nickname !== undefined) update.nickname = String(nickname).trim() || null;

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ message: "Aucune modification fournie." });
  }

  await usersCol.updateOne({ _id: oid }, { $set: update });
  const row = await usersCol.findOne({ _id: oid }, { projection: { password_hash: 0 } });
  res.json(serializeUser(row, true));
});

const SEED_ADMINS = [
  { email: "admin@local", password: "admin1234", fullName: "Administrateur", nickname: "Admin" },
  { email: "ilyas@local", password: "ilyas123", fullName: "Ilyas", nickname: "Ilyas" },
];

async function seedAdmins() {
  const now = new Date().toISOString();
  for (const a of SEED_ADMINS) {
    const hash = bcrypt.hashSync(a.password, 10);
    const existing = await usersCol.findOne({ email: a.email });
    if (!existing) {
      await usersCol.insertOne({
        email: a.email,
        full_name: a.fullName,
        password_hash: hash,
        role: "admin",
        nickname: a.nickname,
        status: "approved",
        created_at: now,
      });
      console.log(`Admin créé: ${a.email} / ${a.password}`);
    } else {
      await usersCol.updateOne(
        { email: a.email },
        { $set: { role: "admin", nickname: a.nickname, status: "approved", full_name: a.fullName, password_hash: hash } }
      );
      console.log(`Admin mis à jour: ${a.email} / ${a.password}`);
    }
  }
}

// ---------- PARTENARIATS ----------
app.get("/api/partenariats", async (req, res) => {
  const rows = await partenariatsCol.find({}).sort({ created_at: -1 }).toArray();
  res.json(rows.map(serializePartenariat));
});

app.post("/api/partenariats", async (req, res) => {
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

  if (!titre || !type_partenariat || !nature || !domaine || !entite_cnss || !partenaire || !statut) {
    return res.status(400).json({ message: "Champs obligatoires manquants." });
  }

  const existing = await partenariatsCol.findOne({ titre });
  if (existing) {
    return res.status(400).json({ message: "Un partenariat avec ce titre existe déjà." });
  }

  const now = new Date().toISOString();
  const doc = {
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
    created_by: created_by ? String(created_by) : null,
    created_at: now,
    updated_at: now,
  };
  const result = await partenariatsCol.insertOne(doc);
  const row = await partenariatsCol.findOne({ _id: result.insertedId });
  res.status(201).json(serializePartenariat(row));
});

app.put("/api/partenariats/:id", async (req, res) => {
  const { id } = req.params;
  const oid = toObjectId(id, res);
  if (!oid) return;
  const existing = await partenariatsCol.findOne({ _id: oid });
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

  const duplicate = await partenariatsCol.findOne({ titre, _id: { $ne: oid } });
  if (duplicate) {
    return res.status(400).json({ message: "Un partenariat avec ce titre existe déjà." });
  }

  const now = new Date().toISOString();
  await partenariatsCol.updateOne(
    { _id: oid },
    {
      $set: {
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
        created_by: created_by ? String(created_by) : null,
        updated_at: now,
      },
    }
  );
  const row = await partenariatsCol.findOne({ _id: oid });
  res.json(serializePartenariat(row));
});

app.delete("/api/partenariats/:id", async (req, res) => {
  const { id } = req.params;
  const oid = toObjectId(id, res);
  if (!oid) return;
  const result = await partenariatsCol.deleteOne({ _id: oid });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: "Non trouvé" });
  }
  res.status(204).end();
});

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  usersCol = db.collection("users");
  userLogsCol = db.collection("user_logs");
  partenariatsCol = db.collection("partenariats");

  await usersCol.createIndex({ email: 1 }, { unique: true });
  await usersCol.updateMany(
    { status: { $in: [null, ""] } },
    { $set: { status: "approved" } }
  );
  await seedAdmins();

  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT} (MongoDB: ${DB_NAME})`);
  });
}

main().catch((err) => {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
});

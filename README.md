## Partenariats CNSS (Agent Hub)

Application de **gestion des partenariats**.

- **Backend**: Node.js (Express) + MongoDB (`server.mjs`)
- **Frontend**: React + TypeScript + Vite (`agent-hub-main/`)
- **Docker**: `docker-compose.yml` (Mongo + API + Web)

---

## Architecture (dossiers)

- **Backend**
  - `server.mjs`: API Express (port **4000**)
  - `create-admin.mjs`: script pour créer/mettre à jour des comptes admin
  - `Dockerfile.server`: image Docker de l’API
- **Frontend**
  - `agent-hub-main/`: app Vite (port **8080**)
  - `agent-hub-main/Dockerfile`: build + serveur web (nginx)
  - `agent-hub-main/nginx.conf`: config nginx (SPA fallback)

---

## Prérequis

- Node.js **20+**
- npm
- MongoDB **7+** (local ou Docker)
- (Optionnel) Docker + Docker Compose

---

## Lancer en local (sans Docker full stack)

### 1) Démarrer MongoDB

Option Docker:

```bash
docker run -d --name mongo-local -p 27017:27017 mongo:7
```

### 2) Démarrer le backend (API)

Depuis la racine du projet:

```bash
npm install
npm run server
```

Par défaut:
- API: `http://localhost:4000`
- Mongo: `mongodb://localhost:27017`
- DB: `agent_hub`

Variables utiles:
- `MONGODB_URI`
- `MONGODB_DB`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### 3) Démarrer le frontend (Vite)

Dans un autre terminal:

```bash
cd agent-hub-main
npm install
npm run dev
```

Ouvrir `http://localhost:8080`.

---

## Lancer avec Docker Compose (recommandé)

```bash
docker compose up -d --build
```

Services / ports:
- `mongo`: `localhost:27017`
- `server`: `localhost:4000`
- `web`: `localhost:8080`

Arrêter:

```bash
docker compose down
```

---

## Comptes admin (seed)

Le script `create-admin.mjs` crée / met à jour des comptes admin dans MongoDB:

```bash
node create-admin.mjs
```

Il utilise `MONGODB_URI` et `MONGODB_DB` (valeurs par défaut: `mongodb://localhost:27017` / `agent_hub`).

---

## Rôles & permissions (résumé)

Le backend définit les rôles suivants (voir `server.mjs`):
- **admin**: création / modification / suppression (toutes entreprises)
- **editor**: création / modification / suppression (son entreprise)
- **spectate**: lecture seule (son entreprise)
- **ajouter**: création uniquement
- **modifier**: modification uniquement
- **suppression**: suppression uniquement

---

## Notes

- Le frontend appelle l’API via `/api` en dev (proxy Vite) et via l’URL configurée par variables Vite si nécessaire.
- Le conteneur `web` sert une SPA (fallback `index.html`) via la config nginx (`agent-hub-main/nginx.conf`).


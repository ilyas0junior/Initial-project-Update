# Agent Hub – How to Run & Project Structure

## How to Run

You need **two terminals**: one for the backend, one for the frontend.

### 1. Backend (API + SQLite)

From the **project root** (`agent-hub-main/`):

```bash
npm run server
```

- Runs Express on **http://localhost:4000**
- Uses SQLite database **`data.db`** in the same folder (created automatically)

### 2. Frontend (React app)

From the **frontend folder** (`agent-hub-main/agent-hub-main/`):

```bash
cd agent-hub-main
npm run dev
```

- Runs Vite dev server (usually **http://localhost:5173**)
- The app calls the API at `http://localhost:4000` (or `VITE_API_URL` if set)

### 3. Use the app

1. Open **http://localhost:5173** in the browser.
2. Go to **/auth** to **register** or **login** (local accounts, stored in SQLite).
3. After login you are redirected to the **Dashboard** where you can manage **Partenariats** (create, edit, delete, search, export CSV).

---

## Project Structure

```
agent-hub-main/
├── server.mjs              # Backend: Express API, SQLite, auth + partenariats CRUD
├── data.db                 # SQLite database (created on first run)
├── package.json            # Root deps: express, cors, bcryptjs, better-sqlite3
├── PROJECT.md              # This file
│
└── agent-hub-main/         # Frontend (Vite + React + TypeScript)
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── package.json        # Frontend deps: react, react-router-dom, @tanstack/react-query, shadcn, etc.
    │
    └── src/
        ├── main.tsx        # Entry: renders App into #root
        ├── App.tsx         # Routes, AuthProvider, QueryClient; / = Dashboard, /auth = Auth
        ├── index.css       # Global styles, Tailwind
        │
        ├── pages/
        │   ├── Auth.tsx    # Login / Register form; calls POST /auth/login, /auth/register
        │   ├── Dashboard.tsx  # Partenariats list, stats, create/edit modal, table, filters
        │   ├── Index.tsx   # Landing (if used)
        │   └── NotFound.tsx
        │
        ├── hooks/
        │   ├── useAuth.ts       # Auth context: login, register, logout, session (from localStorage)
        │   ├── usePartenariats.ts  # TanStack Query: fetch/create/update/delete partenariats (API)
        │   ├── useAgents.ts     # (Legacy/optional agents feature)
        │   ├── use-mobile.tsx
        │   └── use-toast.ts
        │
        └── components/
            ├── AppHeader.tsx       # Top bar, logout
            ├── PartenariatForm.tsx # Create/Edit form (titre, type, statut, dates, etc.)
            ├── PartenariatDetail.tsx # View one partenariat
            ├── PartenariatTable.tsx # Table + search + "Exporter en Excel" (CSV)
            ├── PartenariatStats.tsx # Cards: Total, Opérationnels, Échus, etc.
            ├── StatusBadge.tsx     # Badge for statut (e.g. Opérationnel, Échu)
            ├── NavLink.tsx
            ├── StatsCards.tsx
            ├── AgentForm.tsx / AgentTable.tsx / AgentDetail.tsx  # Optional agents UI
            └── ui/                 # shadcn/ui components (Button, Dialog, Input, etc.)
```

---

## What Each Part Does

| Part | Role |
|------|------|
| **server.mjs** | Express server. Auth: register, login (JWT not used; session is managed by frontend with token/user in localStorage). Partenariats: CRUD, titre uniqueness. SQLite: `users`, `partenariats` (with `entite_concernee`, etc.). |
| **data.db** | SQLite file. Tables: `users` (email, password_hash, full_name), `partenariats` (titre, type_partenariat, nature, domaine, entite_cnss, entite_concernee, partenaire, dates, statut, description, created_by, timestamps). |
| **useAuth** | Provides `session`, `login`, `register`, `logout`. Persists user in localStorage; frontend sends auth header to API where needed. |
| **usePartenariats** | Fetches partenariats from `GET /partenariats`, creates/updates/deletes via API. Uses TanStack Query for cache and refetch. |
| **Auth.tsx** | Login/register form; on success stores user and redirects to `/`. |
| **Dashboard.tsx** | Shows PartenariatStats, filters, PartenariatTable, create/edit dialog (PartenariatForm), delete, and PartenariatDetail. |
| **PartenariatForm** | Form fields aligned with backend (type, statut, entité concernée, etc.). |
| **PartenariatTable** | List, search (titre, partenaire, domaine), export filtered list to CSV ("Exporter en Excel"). |
| **PartenariatStats** | Counts by statut: Total, Opérationnels, Non opérationnels, Échus, À renouveler, En cours. |

---

## Optional: Single-command run

From project root, in one terminal you can run both (backend in background):

```bash
npm run server &
cd agent-hub-main && npm run dev
```

Then open **http://localhost:5173** and use **/auth** to log in.

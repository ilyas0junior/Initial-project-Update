# Diagrammes Mermaid – Projet Partenariats CNSS

Copiez chaque bloc de code dans un visualiseur Mermaid (ex: [mermaid.live](https://mermaid.live)) ou dans un README pour les voir rendus.

---

## 1. Architecture globale

```mermaid
flowchart TB
  subgraph Frontend["Frontend (Vite + React)"]
    App[App.tsx]
    Auth[Auth.tsx]
    Dashboard[Dashboard.tsx]
    AdminUsers[AdminUsers.tsx]
    App --> Auth
    App --> Dashboard
    App --> AdminUsers
  end

  subgraph Hooks["Hooks"]
    useAuth[useAuth]
    usePartenariats[usePartenariats]
    useAdminUsers[useAdminUsers]
  end

  subgraph Backend["Backend (Express :4000)"]
    API[API REST]
    API --> AuthAPI["/api/login, /api/register, /api/me"]
    API --> UsersAPI["/api/users, /api/users/pending, /api/logs"]
    API --> PartenariatsAPI["/api/partenariats"]
  end

  subgraph DB["SQLite (data.db)"]
    users[(users)]
    partenariats[(partenariats)]
    user_logs[(user_logs)]
  end

  Frontend --> Hooks
  Hooks --> Backend
  Backend --> DB
```

---

## 2. Routes et navigation

```mermaid
flowchart LR
  subgraph Public["Public"]
    A["/auth\n(Login / Register)"]
  end

  subgraph Protected["Protection login"]
    B["/\nDashboard\nPartenariats"]
    C["/admin/users\nGestion utilisateurs\n+ Logs"]
  end

  A -->|"session + isAdmin"| C
  A -->|"session + spectate"| B
  B -->|"Lien Utilisateurs (admin)"| C
  C -->|"Lien Partenariats CNSS"| B
  B -->|"Déconnexion"| A
  C -->|"Déconnexion"| A
```

---

## 3. Base de données (tables)

```mermaid
erDiagram
  users {
    int id PK
    string email UK
    string full_name
    string password_hash
    string role "admin | spectate"
    string nickname
    string status "pending | approved | rejected"
  }

  user_logs {
    int id PK
    int user_id FK
    string action "login"
    string details
    string created_at
  }

  partenariats {
    int id PK
    string titre UK
    string type_partenariat
    string nature
    string domaine
    string entite_cnss
    string entite_concernee
    string partenaire
    string date_debut
    string date_fin
    string statut
    string description
    int created_by FK
    string created_at
    string updated_at
  }

  users ||--o{ user_logs : "user_id"
  users ||--o{ partenariats : "created_by"
```

---

## 4. Flux Auth (inscription → approbation → connexion)

```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant F as Frontend
  participant API as Backend API
  participant DB as SQLite

  U->>F: S'inscrire (email, password)
  F->>API: POST /api/register
  API->>DB: INSERT users (status=pending)
  API-->>F: "Demande envoyée"
  F-->>U: "Attendre approbation admin"

  Note over U,DB: Admin approuve dans /admin/users

  U->>F: Se connecter (email, password)
  F->>API: POST /api/login
  API->>DB: SELECT user, check status
  alt status !== approved
    API-->>F: 403 "Compte non approuvé"
  else status = approved
    API->>DB: INSERT user_logs (login)
    API-->>F: { id, email, role, nickname }
    F-->>U: Redirection Dashboard ou /admin/users
  end
```

---

## 5. Structure des pages et composants (frontend)

```mermaid
flowchart TB
  subgraph App["App.tsx"]
    QueryClient[QueryClientProvider]
    AuthProvider[AuthProvider]
    Router[BrowserRouter]
    QueryClient --> AuthProvider
    AuthProvider --> Router
  end

  subgraph Routes["Routes"]
    R1["/ → Dashboard"]
    R2["/admin/users → AdminUsers"]
    R3["/auth → Auth"]
    R4["* → NotFound"]
  end

  subgraph Dashboard["Dashboard"]
    AppHeader1[AppHeader]
    PartenariatStats[PartenariatStats]
    PartenariatTable[PartenariatTable]
    PartenariatForm[PartenariatForm]
    PartenariatDetail[PartenariatDetail]
  end

  subgraph AdminUsers["AdminUsers"]
    AppHeader2[AppHeader]
    Tabs[Tabs]
    Tabs --> Pending["Demandes en attente"]
    Tabs --> Users["Utilisateurs\n(role, pseudonyme, dernière connexion)"]
    Tabs --> Logs["Logs\n(liste users + historique connexions)"]
  end

  subgraph Auth["Auth"]
    LoginForm[Formulaire Login/Register]
  end

  Router --> Routes
  R1 --> Dashboard
  R2 --> AdminUsers
  R3 --> Auth
  R4 --> NotFound
```

---

## 6. API Backend (résumé)

```mermaid
flowchart LR
  subgraph Auth["Auth"]
    POST_register["POST /api/register"]
    POST_login["POST /api/login"]
    GET_me["GET /api/me\nX-User-Id"]
  end

  subgraph Admin["Admin (X-User-Id + role=admin)"]
    GET_users["GET /api/users\n+ lastLogin"]
    GET_pending["GET /api/users/pending"]
    GET_logs["GET /api/logs"]
    PATCH_user["PATCH /api/users/:id"]
  end

  subgraph Partenariats["Partenariats"]
    GET_p["GET /api/partenariats"]
    POST_p["POST /api/partenariats"]
    PUT_p["PUT /api/partenariats/:id"]
    DELETE_p["DELETE /api/partenariats/:id"]
  end

  Auth --> users[(users)]
  Auth --> user_logs[(user_logs)]
  Admin --> users
  Admin --> user_logs
  Partenariats --> partenariats[(partenariats)]
```

Vous pouvez coller n’importe quel bloc dans [mermaid.live](https://mermaid.live) pour obtenir le diagramme.

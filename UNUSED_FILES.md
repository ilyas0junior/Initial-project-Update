# Fichiers inutiles ou peu utilisés

Fichiers que vous pouvez supprimer ou ignorer si vous voulez alléger le projet.  
**Ne pas supprimer** sans vérifier si vous utilisez des tests ou des composants UI plus tard.

---

## Racine du projet

| Fichier | Raison |
|---------|--------|
| `create-admin.mjs` | **Utile** – à garder. Script pour recréer les comptes admin (admin@local, ilyas@local) après un reset de la base. |

---

## Frontend `agent-hub-main/`

### Tests (optionnel)

| Fichier | Raison |
|---------|--------|
| `src/test/example.test.ts` | Test d’exemple, pas utilisé par l’app. |
| `src/test/setup.ts` | Config des tests. Inutile si vous ne lancez pas les tests. |

### Hooks

| Fichier | Raison |
|---------|--------|
| `src/hooks/use-mobile.tsx` | Utilisé uniquement par `components/ui/sidebar.tsx`. Si vous n’utilisez pas la sidebar, ce hook est inutile. |

### Composants UI (shadcn) non utilisés par l’app

L’app n’importe pas directement ces composants. Ils viennent du template shadcn et peuvent servir plus tard.

- `src/components/ui/accordion.tsx`
- `src/components/ui/alert.tsx`
- `src/components/ui/aspect-ratio.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/breadcrumb.tsx`
- `src/components/ui/calendar.tsx`
- `src/components/ui/carousel.tsx`
- `src/components/ui/chart.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/collapsible.tsx`
- `src/components/ui/command.tsx`
- `src/components/ui/context-menu.tsx`
- `src/components/ui/drawer.tsx`
- `src/components/ui/form.tsx`
- `src/components/ui/hover-card.tsx`
- `src/components/ui/input-otp.tsx`
- `src/components/ui/menubar.tsx`
- `src/components/ui/navigation-menu.tsx`
- `src/components/ui/pagination.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/radio-group.tsx`
- `src/components/ui/resizable.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/sidebar.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/slider.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/toggle-group.tsx`
- `src/components/ui/toggle.tsx`
- `src/components/ui/use-toast.ts` (réexport, le vrai est dans `src/hooks/use-toast.ts`)

### Composants UI réellement utilisés (ne pas supprimer)

- button, input, label, card, select, dialog, tabs, table, dropdown-menu, alert-dialog, separator, textarea, badge, toast, toaster, sonner, tooltip

---

## Résumé

- **À garder** : tout ce qui est dans `src/pages/`, `src/components/` (hors ui listés ci‑dessus), `src/hooks/useAuth.ts`, `usePartenariats.ts`, `useAdminUsers.ts`, `use-toast.ts`, `server.mjs`, `create-admin.mjs`.
- **Optionnel à supprimer** : `src/test/*`, `src/hooks/use-mobile.tsx`, et les composants ui listés si vous voulez un projet minimal (en sachant que vous devrez peut‑être réinstaller des composants shadcn plus tard).

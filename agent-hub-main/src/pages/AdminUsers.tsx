import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Pencil, UserCheck, Users, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import {
  useUsersList,
  usePendingUsers,
  useUpdateUser,
  useLogs,
  type AdminUser,
  type UserRole,
} from "@/hooks/useAdminUsers";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  spectate: "Spectateur (lecture seule)",
};

const ADMIN_EMAILS = ["admin@local", "ilyas@local"];

export default function AdminUsers() {
  const { session, signOut, isAdmin } = useAuth();
  const userId = session?.id;
  const userEmail = session?.email && ADMIN_EMAILS.includes(session.email) ? session.email : undefined;
  const displayName = session?.nickname || session?.fullName || session?.email || "";

  const { data: users = [], isLoading: loadingUsers, isError: errorUsers } = useUsersList(userId, userEmail);
  const { data: pending = [], isLoading: loadingPending } = usePendingUsers(userId, userEmail);
  const { data: logs = [], isLoading: loadingLogs, isError: errorLogs } = useLogs(userId, userEmail);
  const updateUser = useUpdateUser(userId, userEmail);
  const { toast } = useToast();

  const [approveUser, setApproveUser] = useState<AdminUser | null>(null);
  const [approveNickname, setApproveNickname] = useState("");
  const [approveRole, setApproveRole] = useState<UserRole>("spectate");
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editNickname, setEditNickname] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("spectate");

  const handleApprove = () => {
    if (!approveUser) return;
    updateUser.mutate(
      {
        id: approveUser.id,
        status: "approved",
        nickname: approveNickname.trim() || approveUser.fullName || approveUser.email,
        role: approveRole,
      },
      {
        onSuccess: () => {
          toast({ title: "Utilisateur approuvé" });
          setApproveUser(null);
          setApproveNickname("");
          setApproveRole("spectate");
        },
        onError: (e: Error) =>
          toast({ title: "Erreur", description: e.message, variant: "destructive" }),
      }
    );
  };

  const handleReject = (user: AdminUser) => {
    updateUser.mutate(
      { id: user.id, status: "rejected" },
      {
        onSuccess: () => toast({ title: "Demande refusée" }),
        onError: (e: Error) =>
          toast({ title: "Erreur", description: e.message, variant: "destructive" }),
      }
    );
  };

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setEditNickname(u.nickname || u.fullName || "");
    setEditRole(u.role);
  };

  const handleSaveEdit = () => {
    if (!editUser) return;
    updateUser.mutate(
      { id: editUser.id, nickname: editNickname.trim() || editUser.email, role: editRole },
      {
        onSuccess: () => {
          toast({ title: "Utilisateur mis à jour" });
          setEditUser(null);
        },
        onError: (e: Error) =>
          toast({ title: "Erreur", description: e.message, variant: "destructive" }),
      }
    );
  };

  const handleRoleChange = (u: AdminUser, newRole: UserRole) => {
    if (u.role === newRole) return;
    updateUser.mutate(
      { id: u.id, role: newRole },
      {
        onSuccess: () => toast({ title: "Rôle mis à jour" }),
        onError: (e: Error) =>
          toast({ title: "Erreur", description: e.message, variant: "destructive" }),
      }
    );
  };

  if (!isAdmin || !session) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader userName={displayName} isAdmin={false} onSignOut={signOut} />
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          <p className="text-muted-foreground">Accès réservé aux administrateurs.</p>
          <Button asChild variant="link" className="mt-2">
            <Link to="/">Retour au tableau de bord</Link>
          </Button>
        </main>
      </div>
    );
  }

  const approvedUsers = users.filter((u) => u.status === "approved" || !u.status);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader userName={displayName} isAdmin onSignOut={signOut} />

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h2>
            <p className="text-sm text-muted-foreground">
              Approuver les demandes et gérer les autorités et pseudos
            </p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Demandes en attente
              {pending.length > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {pending.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <ScrollText className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Demandes d&apos;inscription</CardTitle>
                <CardDescription>
                  Approuvez ou refusez les demandes. Lors de l&apos;approbation, définissez un
                  pseudonyme et le rôle (spectateur ou admin).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPending ? (
                  <p className="text-muted-foreground">Chargement...</p>
                ) : pending.length === 0 ? (
                  <p className="text-muted-foreground">Aucune demande en attente.</p>
                ) : (
                  <ul className="space-y-3">
                    {pending.map((u) => (
                      <li
                        key={u.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3"
                      >
                        <div>
                          <p className="font-medium">{u.email}</p>
                          <p className="text-sm text-muted-foreground">{u.fullName || "—"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setApproveUser(u);
                              setApproveNickname(u.fullName || u.email || "");
                              setApproveRole("spectate");
                            }}
                          >
                            <Check className="mr-1 h-4 w-4" /> Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(u)}
                            disabled={updateUser.isPending}
                          >
                            <X className="mr-1 h-4 w-4" /> Refuser
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs approuvés</CardTitle>
                <CardDescription>
                  Modifiez le pseudonyme (affiché dans le profil) et le rôle de chaque utilisateur.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <p className="text-muted-foreground">Chargement...</p>
                ) : errorUsers ? (
                  <p className="text-destructive">Erreur lors du chargement des utilisateurs.</p>
                ) : approvedUsers.length === 0 ? (
                  <p className="text-muted-foreground">Aucun utilisateur approuvé.</p>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="p-3 text-left font-medium">Email</th>
                          <th className="p-3 text-left font-medium">Pseudonyme</th>
                          <th className="p-3 text-left font-medium">Rôle</th>
                          <th className="p-3 text-left font-medium">Créé le</th>
                          <th className="p-3 text-left font-medium">Dernière connexion</th>
                          <th className="p-3 w-24"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedUsers.map((u) => (
                          <tr key={u.id} className="border-b border-border last:border-0">
                            <td className="p-3">{u.email}</td>
                            <td className="p-3">{u.nickname || u.fullName || "—"}</td>
                            <td className="p-3">
                              <Select
                                value={u.role}
                                onValueChange={(v) => handleRoleChange(u, v as UserRole)}
                                disabled={updateUser.isPending}
                              >
                                <SelectTrigger className="h-8 w-[180px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="spectate">{ROLE_LABELS.spectate}</SelectItem>
                                  <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {u.createdAt
                                ? new Date(u.createdAt).toLocaleString("fr-FR")
                                : "—"}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {u.lastLogin
                                ? new Date(u.lastLogin).toLocaleString("fr-FR")
                                : "Jamais"}
                            </td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(u)}
                                title="Modifier le pseudonyme"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Liste des utilisateurs et dernière connexion</CardTitle>
                <CardDescription>
                  Tous les comptes avec la date de leur dernière connexion.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <p className="text-muted-foreground">Chargement...</p>
                ) : errorUsers ? (
                  <p className="text-destructive">Erreur lors du chargement. Vérifiez que le serveur tourne et que vous êtes connecté en tant qu&apos;admin. En cas de doute, déconnectez-vous puis reconnectez-vous.</p>
                ) : users.length === 0 ? (
                  <p className="text-muted-foreground">Aucun utilisateur.</p>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="p-3 text-left font-medium">Email</th>
                          <th className="p-3 text-left font-medium">Pseudonyme</th>
                          <th className="p-3 text-left font-medium">Admin</th>
                          <th className="p-3 text-left font-medium">Créé le</th>
                          <th className="p-3 text-left font-medium">Dernière connexion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => {
                          const createdStr = u.createdAt ? (() => { try { return new Date(u.createdAt).toLocaleString("fr-FR"); } catch { return "—"; } })() : "—";
                          const lastStr = u.lastLogin ? (() => { try { return new Date(u.lastLogin).toLocaleString("fr-FR"); } catch { return "Jamais"; } })() : "Jamais";
                          return (
                          <tr key={u.id} className="border-b border-border last:border-0">
                            <td className="p-3">{u.email}</td>
                            <td className="p-3">{u.nickname || u.fullName || "—"}</td>
                            <td className="p-3">{u.role === "admin" ? "Oui" : "Non"}</td>
                            <td className="p-3 text-muted-foreground">{createdStr}</td>
                            <td className="p-3 text-muted-foreground">{lastStr}</td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historique des connexions</CardTitle>
                <CardDescription>
                  Chronologie des connexions (dernières 500 entrées).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLogs ? (
                  <p className="text-muted-foreground">Chargement...</p>
                ) : errorLogs ? (
                  <p className="text-destructive">Erreur lors du chargement. Vérifiez que le serveur tourne et que vous êtes connecté en tant qu&apos;admin. En cas de doute, déconnectez-vous puis reconnectez-vous.</p>
                ) : logs.length === 0 ? (
                  <p className="text-muted-foreground">Aucune connexion enregistrée.</p>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="p-3 text-left font-medium">Date / Heure</th>
                          <th className="p-3 text-left font-medium">Utilisateur</th>
                          <th className="p-3 text-left font-medium">Action</th>
                          <th className="p-3 text-left font-medium">Détails</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b border-border last:border-0">
                            <td className="p-3 text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString("fr-FR")}
                            </td>
                            <td className="p-3">
                              {log.userNickname || log.userEmail || log.userId}
                            </td>
                            <td className="p-3">{log.action}</td>
                            <td className="p-3 text-muted-foreground">{log.details || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Approve dialog */}
      <Dialog
        open={!!approveUser}
        onOpenChange={(open) => !open && setApproveUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver l&apos;utilisateur</DialogTitle>
          </DialogHeader>
          {approveUser && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                {approveUser.email} — {approveUser.fullName || "—"}
              </p>
              <div className="space-y-2">
                <Label>Pseudonyme (affiché dans le profil)</Label>
                <Input
                  value={approveNickname}
                  onChange={(e) => setApproveNickname(e.target.value)}
                  placeholder="Ex: Jean D."
                />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select
                  value={approveRole}
                  onValueChange={(v) => setApproveRole(v as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spectate">{ROLE_LABELS.spectate}</SelectItem>
                    <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveUser(null)}>
              Annuler
            </Button>
            <Button
              onClick={handleApprove}
              disabled={updateUser.isPending}
            >
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">{editUser.email}</p>
              <div className="space-y-2">
                <Label>Pseudonyme (affiché dans le profil)</Label>
                <Input
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  placeholder="Ex: Jean D."
                />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select
                  value={editRole}
                  onValueChange={(v) => setEditRole(v as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spectate">{ROLE_LABELS.spectate}</SelectItem>
                    <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateUser.isPending}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

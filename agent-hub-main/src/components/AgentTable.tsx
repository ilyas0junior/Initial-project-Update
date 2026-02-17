import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import type { Agent } from "@/hooks/useAgents";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AgentTableProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onDelete: (id: string) => void;
  onView: (agent: Agent) => void;
}

const AgentTable = ({ agents, onEdit, onDelete, onView }: AgentTableProps) => {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = agents.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.nom.toLowerCase().includes(q) ||
      a.prenom.toLowerCase().includes(q) ||
      a.matricule.toLowerCase().includes(q) ||
      (a.email?.toLowerCase().includes(q) ?? false) ||
      (a.poste?.toLowerCase().includes(q) ?? false)
    );
  });

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return format(new Date(date), "dd MMM yyyy", { locale: fr });
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un agent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Matricule</TableHead>
              <TableHead className="font-semibold">Nom & Prénom</TableHead>
              <TableHead className="font-semibold">Poste</TableHead>
              <TableHead className="font-semibold">Département</TableHead>
              <TableHead className="font-semibold">Statut</TableHead>
              <TableHead className="font-semibold">Date d'embauche</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {search ? "Aucun résultat trouvé" : "Aucun agent enregistré"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-sm font-medium">{agent.matricule}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{agent.nom} {agent.prenom}</p>
                      {agent.email && <p className="text-xs text-muted-foreground">{agent.email}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{agent.poste || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{agent.departement || "—"}</TableCell>
                  <TableCell><StatusBadge statut={agent.statut} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(agent.date_embauche)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(agent)}>
                          <Eye className="mr-2 h-4 w-4" /> Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(agent)}>
                          <Pencil className="mr-2 h-4 w-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(agent.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet agent ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'agent sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgentTable;

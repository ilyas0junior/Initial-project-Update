import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import type { Partenariat } from "@/hooks/usePartenariats";
import { TYPES_PARTENARIAT, ENTITES_CNSS } from "@/hooks/usePartenariats";

interface Props {
  partenariats: Partenariat[];
  onEdit: (p: Partenariat) => void;
  onDelete: (id: string) => void;
  onView: (p: Partenariat) => void;
}

const getLabel = (list: { value: string; label: string }[], value: string) =>
  list.find((i) => i.value === value)?.label || value;

const PartenariatTable = ({ partenariats, onEdit, onDelete, onView }: Props) => {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = partenariats.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.titre.toLowerCase().includes(q) ||
      p.partenaire.toLowerCase().includes(q) ||
      p.domaine.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher un partenariat..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Titre</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Partenaire</TableHead>
              <TableHead className="font-semibold">Entité CNSS</TableHead>
              <TableHead className="font-semibold">Statut</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {search ? "Aucun résultat trouvé" : "Aucun partenariat enregistré"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <p className="font-medium text-foreground">{p.titre}</p>
                    <p className="text-xs text-muted-foreground">{p.domaine}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{getLabel(TYPES_PARTENARIAT, p.type_partenariat)}</TableCell>
                  <TableCell className="text-muted-foreground">{p.partenaire}</TableCell>
                  <TableCell className="text-muted-foreground">{getLabel(ENTITES_CNSS, p.entite_cnss)}</TableCell>
                  <TableCell><StatusBadge statut={p.statut} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(p)}><Eye className="mr-2 h-4 w-4" /> Voir</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(p)}><Pencil className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(p.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
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
            <AlertDialogTitle>Supprimer ce partenariat ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { onDelete(deleteId); setDeleteId(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PartenariatTable;

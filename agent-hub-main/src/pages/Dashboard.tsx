import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePartenariats, useCreatePartenariat, useUpdatePartenariat, useDeletePartenariat } from "@/hooks/usePartenariats";
import type { Partenariat } from "@/hooks/usePartenariats";
import AppHeader from "@/components/AppHeader";
import PartenariatStats from "@/components/PartenariatStats";
import PartenariatTable from "@/components/PartenariatTable";
import PartenariatForm from "@/components/PartenariatForm";
import PartenariatDetail from "@/components/PartenariatDetail";

const Dashboard = () => {
  const { session, signOut } = useAuth();
  const { data: partenariats = [], isLoading } = usePartenariats();
  const createP = useCreatePartenariat();
  const updateP = useUpdatePartenariat();
  const deleteP = useDeletePartenariat();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partenariat | null>(null);
  const [viewItem, setViewItem] = useState<Partenariat | null>(null);

  const handleCreate = (data: any) => {
    createP.mutate(
      { ...data, created_by: session?.id },
      {
        onSuccess: () => { toast({ title: "Partenariat créé avec succès" }); setFormOpen(false); },
        onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleUpdate = (data: any) => {
    if (!editItem) return;
    updateP.mutate(
      { id: editItem.id, ...data },
      {
        onSuccess: () => { toast({ title: "Partenariat mis à jour" }); setEditItem(null); },
        onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteP.mutate(id, {
      onSuccess: () => toast({ title: "Partenariat supprimé" }),
      onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
    });
  };

  const userName = session?.fullName || session?.email || "";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader userName={userName} onSignOut={signOut} />

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">Gestion des Partenariats</h2>
            <p className="text-sm text-muted-foreground">Suivez et gérez vos projets de partenariat</p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" /> Nouveau partenariat
          </Button>
        </div>

        <div className="animate-fade-in">
          <PartenariatStats partenariats={partenariats} />
        </div>

        <div className="animate-fade-in animate-delay-100">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">Chargement...</div>
          ) : (
            <PartenariatTable partenariats={partenariats} onEdit={setEditItem} onDelete={handleDelete} onView={setViewItem} />
          )}
        </div>
      </main>

      <PartenariatForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} loading={createP.isPending} />
      <PartenariatForm open={!!editItem} onClose={() => setEditItem(null)} onSubmit={handleUpdate} partenariat={editItem} loading={updateP.isPending} />
      <PartenariatDetail partenariat={viewItem} open={!!viewItem} onClose={() => setViewItem(null)} />
    </div>
  );
};

export default Dashboard;

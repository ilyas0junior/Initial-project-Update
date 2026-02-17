import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Agent } from "@/hooks/useAgents";

interface AgentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  agent?: Agent | null;
  loading?: boolean;
}

const AgentForm = ({ open, onClose, onSubmit, agent, loading }: AgentFormProps) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      matricule: agent?.matricule || "",
      nom: agent?.nom || "",
      prenom: agent?.prenom || "",
      date_naissance: agent?.date_naissance || "",
      email: agent?.email || "",
      telephone: agent?.telephone || "",
      poste: agent?.poste || "",
      departement: agent?.departement || "",
      statut: agent?.statut || "actif",
      date_embauche: agent?.date_embauche || new Date().toISOString().split("T")[0],
      adresse: agent?.adresse || "",
    },
  });

  const statut = watch("statut");

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{agent ? "Modifier l'agent" : "Ajouter un agent"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="matricule">Matricule *</Label>
              <Input id="matricule" {...register("matricule", { required: true })} placeholder="AGT-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select value={statut} onValueChange={(v) => setValue("statut", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                  <SelectItem value="en_conge">En congé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" {...register("nom", { required: true })} placeholder="Dupont" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" {...register("prenom", { required: true })} placeholder="Jean" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_naissance">Date de naissance</Label>
              <Input id="date_naissance" type="date" {...register("date_naissance")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_embauche">Date d'embauche</Label>
              <Input id="date_embauche" type="date" {...register("date_embauche")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="jean@exemple.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" {...register("telephone")} placeholder="+33 6 12 34 56 78" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="poste">Poste</Label>
              <Input id="poste" {...register("poste")} placeholder="Développeur" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departement">Département</Label>
              <Input id="departement" {...register("departement")} placeholder="Informatique" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Textarea id="adresse" {...register("adresse")} placeholder="123 Rue Example, 75001 Paris" rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="gradient-primary" disabled={loading}>
              {loading ? "Enregistrement..." : agent ? "Mettre à jour" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgentForm;

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Partenariat } from "@/hooks/usePartenariats";
import { TYPES_PARTENARIAT, NATURES, DOMAINES, ENTITES_CNSS, STATUTS } from "@/hooks/usePartenariats";

interface PartenariatFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  partenariat?: Partenariat | null;
  loading?: boolean;
}

const PartenariatForm = ({ open, onClose, onSubmit, partenariat, loading }: PartenariatFormProps) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      titre: partenariat?.titre || "",
      type_partenariat: partenariat?.type_partenariat || "convention",
      nature: partenariat?.nature || "public",
      domaine: partenariat?.domaine || "sante",
      entite_cnss: partenariat?.entite_cnss || "entite_centrale",
      entite_concernee: partenariat?.entite_concernee || "entite_centrale",
      partenaire: partenariat?.partenaire || "",
      date_debut: partenariat?.date_debut || "",
      date_fin: partenariat?.date_fin || "",
      statut: partenariat?.statut || "en_cours",
      description: partenariat?.description || "",
    },
  });

  const type_partenariat = watch("type_partenariat");
  const nature = watch("nature");
  const domaine = watch("domaine");
  const entite_cnss = watch("entite_cnss");
  const entite_concernee = watch("entite_concernee");
  const statut = watch("statut");

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{partenariat ? "Modifier le partenariat" : "Nouveau partenariat"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="titre">Titre du partenariat *</Label>
              <Input id="titre" {...register("titre", { required: true })} placeholder="Titre du projet de partenariat" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_partenariat">Type *</Label>
              <Select value={type_partenariat} onValueChange={(v) => setValue("type_partenariat", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES_PARTENARIAT.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nature">Nature *</Label>
              <Select value={nature} onValueChange={(v) => setValue("nature", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NATURES.map((n) => (
                    <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domaine">Domaine *</Label>
              <Select value={domaine} onValueChange={(v) => setValue("domaine", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOMAINES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entite_cnss">Entité CNSS responsable *</Label>
              <Select value={entite_cnss} onValueChange={(v) => setValue("entite_cnss", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTITES_CNSS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entite_concernee">Entité concernée *</Label>
              <Select value={entite_concernee} onValueChange={(v) => setValue("entite_concernee", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTITES_CNSS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="partenaire">Partenaire *</Label>
              <Input id="partenaire" {...register("partenaire", { required: true })} placeholder="Nom de l'organisme partenaire" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_debut">Date de signature</Label>
              <Input id="date_debut" type="date" {...register("date_debut")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_fin">Date de fin</Label>
              <Input id="date_fin" type="date" {...register("date_fin")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">État du partenariat</Label>
              <Select value={statut} onValueChange={(v) => setValue("statut", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Objet du partenariat</Label>
            <Textarea id="description" {...register("description")} placeholder="Objet ou résumé du partenariat..." rows={3} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" className="gradient-primary" disabled={loading}>
              {loading ? "Enregistrement..." : partenariat ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PartenariatForm;

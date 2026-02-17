import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/StatusBadge";
import type { Agent } from "@/hooks/useAgents";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mail, Phone, MapPin, Briefcase, Building, Calendar, Hash } from "lucide-react";

interface AgentDetailProps {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
}

const AgentDetail = ({ agent, open, onClose }: AgentDetailProps) => {
  if (!agent) return null;

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return format(new Date(date), "dd MMMM yyyy", { locale: fr });
  };

  const fields = [
    { icon: Hash, label: "Matricule", value: agent.matricule },
    { icon: Mail, label: "Email", value: agent.email },
    { icon: Phone, label: "Téléphone", value: agent.telephone },
    { icon: Briefcase, label: "Poste", value: agent.poste },
    { icon: Building, label: "Département", value: agent.departement },
    { icon: Calendar, label: "Date de naissance", value: formatDate(agent.date_naissance) },
    { icon: Calendar, label: "Date d'embauche", value: formatDate(agent.date_embauche) },
    { icon: MapPin, label: "Adresse", value: agent.adresse },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold text-sm">
              {agent.prenom[0]}{agent.nom[0]}
            </div>
            <div>
              <p>{agent.prenom} {agent.nom}</p>
              <div className="mt-1"><StatusBadge statut={agent.statut} /></div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.label} className="flex items-start gap-3">
              <field.icon className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm text-foreground">{field.value || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentDetail;

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  statut: string;
}

const StatusBadge = ({ statut }: StatusBadgeProps) => {
  const config: Record<string, { label: string; className: string }> = {
    operationnel: {
      label: "Opérationnel",
      className: "bg-success/15 text-success border-success/30",
    },
    non_operationnel: {
      label: "Non opérationnel",
      className: "bg-muted text-muted-foreground border-border",
    },
    echu: {
      label: "Échu",
      className: "bg-destructive/10 text-destructive border-destructive/30",
    },
    a_renouveler: {
      label: "À renouveler",
      className: "bg-warning/15 text-warning border-warning/30",
    },
    en_cours: {
      label: "En cours",
      className: "bg-info/15 text-info border-info/30",
    },
  };

  const { label, className } = config[statut] || { label: statut, className: "" };

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;

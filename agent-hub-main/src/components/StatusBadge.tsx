import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  statut: string;
}

const StatusBadge = ({ statut }: StatusBadgeProps) => {
  const config: Record<string, { label: string; className: string }> = {
    actif: { label: "Actif", className: "bg-success/15 text-success border-success/30" },
    en_cours: { label: "En cours", className: "bg-info/15 text-info border-info/30" },
    suspendu: { label: "Suspendu", className: "bg-warning/15 text-warning border-warning/30" },
    termine: { label: "Terminé", className: "bg-muted text-muted-foreground border-border" },
  };

  const { label, className } = config[statut] || { label: statut, className: "" };

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;

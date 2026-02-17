import { Handshake, CheckCircle, PauseCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Partenariat } from "@/hooks/usePartenariats";

interface Props {
  partenariats: Partenariat[];
}

const PartenariatStats = ({ partenariats }: Props) => {
  const total = partenariats.length;
  const actifs = partenariats.filter((p) => p.statut === "actif" || p.statut === "en_cours").length;
  const suspendus = partenariats.filter((p) => p.statut === "suspendu").length;
  const termines = partenariats.filter((p) => p.statut === "termine").length;

  const stats = [
    { label: "Total", value: total, icon: Handshake, color: "text-primary" },
    { label: "Actifs / En cours", value: actifs, icon: CheckCircle, color: "text-success" },
    { label: "Suspendus", value: suspendus, icon: PauseCircle, color: "text-warning" },
    { label: "Terminés", value: termines, icon: XCircle, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-card border-border hover:shadow-elevated transition-shadow">
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PartenariatStats;

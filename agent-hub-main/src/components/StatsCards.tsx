import { Users, UserCheck, UserX, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Agent } from "@/hooks/useAgents";

interface StatsCardsProps {
  agents: Agent[];
}

const StatsCards = ({ agents }: StatsCardsProps) => {
  const total = agents.length;
  const actifs = agents.filter((a) => a.statut === "actif").length;
  const inactifs = agents.filter((a) => a.statut === "inactif").length;
  const enConge = agents.filter((a) => a.statut === "en_conge").length;

  const stats = [
    { label: "Total Agents", value: total, icon: Users, color: "text-primary" },
    { label: "Actifs", value: actifs, icon: UserCheck, color: "text-success" },
    { label: "Inactifs", value: inactifs, icon: UserX, color: "text-destructive" },
    { label: "En congé", value: enConge, icon: Clock, color: "text-warning" },
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

export default StatsCards;

import { AlertTriangle, Bot, CalendarClock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAiInsights } from "@/hooks/useAi";

interface Props {
  userId?: string;
}

const AiInsightsCard = ({ userId }: Props) => {
  const { data, isLoading, isError } = useAiInsights(userId);

  if (isLoading) {
    return (
      <Card className="border-border shadow-card">
        <CardContent className="p-5 text-sm text-muted-foreground">Analyse IA en cours...</CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-border shadow-card">
        <CardContent className="p-5 text-sm text-muted-foreground">Insights IA indisponibles pour le moment.</CardContent>
      </Card>
    );
  }

  const highlights = [
    { label: "Actifs", value: data.summary.active, icon: CheckCircle2, className: "text-success" },
    { label: "À surveiller", value: data.summary.renewSoon, icon: CalendarClock, className: "text-warning" },
    { label: "Échus", value: data.summary.expired, icon: AlertTriangle, className: "text-destructive" },
  ];

  return (
    <Card className="overflow-hidden border-border shadow-card">
      <CardHeader className="border-b bg-muted/30 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              Insights IA
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Synthèse intelligente de vos partenariats</p>
          </div>
          <Badge variant="secondary">{data.summary.total} dossiers</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.label} className="rounded-lg border bg-background p-3">
              <div className={`mb-2 flex items-center gap-2 text-sm ${item.className}`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Actions recommandées</h3>
          <div className="space-y-2">
            {data.recommendations.map((recommendation) => (
              <div key={recommendation} className="rounded-lg bg-muted/40 p-3 text-sm text-foreground">
                {recommendation}
              </div>
            ))}
          </div>
        </div>

        {data.urgentPartenariats.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Échéances prioritaires</h3>
            <div className="space-y-2">
              {data.urgentPartenariats.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{p.titre}</p>
                    <p className="text-xs text-muted-foreground">{p.partenaire}</p>
                  </div>
                  <Badge variant="outline">
                    {p.daysRemaining == null ? "À renouveler" : `${p.daysRemaining} j`}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiInsightsCard;

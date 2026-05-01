import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAskAiAssistant, type AiAssistantResponse } from "@/hooks/useAi";
import { useToast } from "@/hooks/use-toast";

interface Props {
  userId?: string;
}

const DEFAULT_QUESTIONS = [
  "Quels partenariats expirent bientôt ?",
  "Quels partenariats sont opérationnels ?",
  "Quels dossiers ont des informations manquantes ?",
];

const AiAssistantPanel = ({ userId }: Props) => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<AiAssistantResponse | null>(null);
  const askAssistant = useAskAiAssistant(userId);
  const { toast } = useToast();

  const ask = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    askAssistant.mutate(clean, {
      onSuccess: (data) => {
        setResponse(data);
        setQuestion("");
      },
      onError: (err: Error) => {
        toast({
          title: "Assistant IA indisponible",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="border-b bg-muted/30 p-5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          Assistant IA Partenariats
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Posez une question en langage naturel sur les partenariats visibles pour votre compte.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {(response?.suggestedQuestions ?? DEFAULT_QUESTIONS).map((item) => (
            <Button
              key={item}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => ask(item)}
              disabled={askAssistant.isPending}
            >
              {item}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ex: Quels partenariats expirent bientôt ?"
            className="min-h-24"
            maxLength={500}
          />
          <div className="flex justify-end">
            <Button onClick={() => ask(question)} disabled={!question.trim() || askAssistant.isPending}>
              <Send className="mr-2 h-4 w-4" />
              {askAssistant.isPending ? "Analyse..." : "Demander"}
            </Button>
          </div>
        </div>

        {response && (
          <div className="rounded-lg border bg-background p-4">
            <p className="whitespace-pre-line text-sm leading-6 text-foreground">{response.answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiAssistantPanel;

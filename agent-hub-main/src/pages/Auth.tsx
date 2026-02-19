import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type LocalUser, ADMIN_EMAILS } from "@/hooks/useAuth";
import { Users, Mail, Lock, User } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const payload: Record<string, unknown> = { email, password };
      if (!isLogin) {
        payload.fullName = fullName;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (data &&
            typeof data === "object" &&
            "message" in data &&
            (data as any).message) ||
          (isLogin
            ? "Erreur lors de la connexion."
            : "Erreur lors de l'inscription.");
        throw new Error(String(message));
      }

      if (isLogin) {
        // Normalize to LocalUser so role is always set (backend returns fullName, role, nickname)
        const user: LocalUser = {
          id: String(data.id),
          email: data.email,
          fullName: data.fullName ?? data.full_name ?? "",
          role: data.role === "admin" ? "admin" : "spectate",
          nickname: data.nickname ?? data.fullName ?? data.email ?? "",
        };
        setSession(user);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${user.nickname || user.fullName || user.email} !`,
        });
        const goToAdmin = user.role === "admin" || (user.email && ADMIN_EMAILS.includes(user.email));
        navigate(goToAdmin ? "/admin/users" : "/", { replace: true });
      } else {
        // Register: server returns { message } only; no session
        toast({
          title: "Demande envoyée",
          description: data.message || "Un administrateur doit approuver votre compte.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-primary shadow-elevated">
            <Users className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Gestion des Partenariats
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </p>
        </div>

        <Card className="shadow-elevated border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">
              {isLogin ? "Connexion" : "Inscription"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Entrez vos identifiants pour accéder au tableau de bord"
                : "Remplissez le formulaire pour créer un compte"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Jean Dupont"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary"
                disabled={loading}
              >
                {loading
                  ? "Chargement..."
                  : isLogin
                    ? "Se connecter"
                    : "S'inscrire"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin
                  ? "Pas encore de compte ? S'inscrire"
                  : "Déjà un compte ? Se connecter"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;

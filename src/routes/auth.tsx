import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Logga in — Sales Tools" },
      { name: "description", content: "Logga in för att komma åt Sales Tools." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, isReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && user) {
      navigate({ to: "/" });
    }
  }, [isReady, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/15 text-lg">
            <span role="img" aria-label="tools">🧰</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Platform</span>
            <span className="text-base font-semibold tracking-tight">Sales Tools</span>
          </div>
        </div>

        <h1 className="text-lg font-semibold tracking-tight">Logga in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Använd ditt team-konto för att komma åt plattformen.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="namn@företag.se"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loggar in…" : "Logga in"}
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Inget konto? Kontakta din administratör — registrering sker inte här.
        </p>
      </div>
    </div>
  );
}

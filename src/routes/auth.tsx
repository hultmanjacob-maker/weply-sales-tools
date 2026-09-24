import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin-inloggning — Sales Tools" },
      { name: "description", content: "Logga in som administratör för att se statistik." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const onMicrosoftSignIn = async () => {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: { redirectTo: window.location.origin + "/auth" },
    });
    setBusy(false);
    if (error) {
      setError(error.message ?? "Microsoft-inloggning misslyckades.");
      return;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-primary">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Admin-inloggning</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bara administratörer kan se statistiken.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-border bg-card/40 p-5">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={onMicrosoftSignIn}
            disabled={busy}
          >
            <svg viewBox="0 0 23 23" className="h-4 w-4" aria-hidden>
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Logga in med Microsoft
          </Button>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            eller
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Loggar in…" : "Logga in"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Konton skapas manuellt i backend.{" "}
            <Link to="/" className="underline hover:text-foreground">
              Tillbaka
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

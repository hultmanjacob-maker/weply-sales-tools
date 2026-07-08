import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, LogOut, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getProjectStats, type StatsRow } from "@/lib/stats.functions";

export const Route = createFileRoute("/_authenticated/stats")({
  head: () => ({
    meta: [
      { title: "Statistik — Sales Tools" },
      { name: "description", content: "Topplista över mest visade projekt." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StatsPage,
  errorComponent: ({ error, reset }) => (
    <div className="p-8">
      <p className="text-sm text-destructive">Kunde inte läsa statistik: {error.message}</p>
      <Button onClick={reset} variant="outline" className="mt-3">
        Försök igen
      </Button>
    </div>
  ),
  notFoundComponent: () => <div className="p-8 text-sm">Sidan hittades inte.</div>,
});

type Range = "7d" | "30d" | "all";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  const isYesterday = d.toDateString() === y.toDateString();
  const hhmm = d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `idag ${hhmm}`;
  if (isYesterday) return `igår ${hhmm}`;
  return d.toLocaleDateString("sv-SE", { day: "2-digit", month: "short" }) + " " + hhmm;
}

function StatsPage() {
  const fetchStats = useServerFn(getProjectStats);
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("30d");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["project-stats"],
    queryFn: () => fetchStats(),
  });

  const rows = useMemo<StatsRow[]>(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const key = range === "7d" ? "last7d" : range === "30d" ? "last30d" : "total";
      return b[key] - a[key];
    });
  }, [data, range]);

  const totalViews = rows.reduce((s, r) => s + r.total, 0);

  const onSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight">Statistik</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="hidden sm:inline">Admin</span>
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card/40 px-2.5 py-1 hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logga ut
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6 sm:p-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Topplista över projekt</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Räknar varje gång ett projekt visats. Ingen personuppgift lagras.
              {totalViews > 0 && (
                <span className="ml-2 text-foreground">Totalt {totalViews.toLocaleString("sv-SE")} visningar.</span>
              )}
            </p>
          </div>
          <div className="inline-flex rounded-md border border-border bg-card/40 p-1 text-[11px] font-medium">
            {(["7d", "30d", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-sm px-3 py-1 transition-colors ${
                  range === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "7d" ? "7 dagar" : r === "30d" ? "30 dagar" : "Allt"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card/40">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-white/[0.02] text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Land</th>
                <th className="px-4 py-3 font-semibold">Projekt</th>
                <th className="px-4 py-3 text-right font-semibold">Totalt</th>
                <th className="px-4 py-3 text-right font-semibold">7d</th>
                <th className="px-4 py-3 text-right font-semibold">30d</th>
                <th className="px-4 py-3 text-right font-semibold">Senast visad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    Laddar…
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-destructive">
                    {error.message}
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-3">
                      Försök igen
                    </Button>
                  </td>
                </tr>
              )}
              {!isLoading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">
                    Inga visningar loggade än.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.projectId} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-sm border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground">
                      {row.country}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.total.toLocaleString("sv-SE")}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.last7d}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.last30d}</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {formatDate(row.lastViewedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

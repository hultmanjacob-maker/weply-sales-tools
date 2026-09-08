import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type StatsRow = {
  projectId: string;
  name: string;
  country: string;
  total: number;
  last7d: number;
  last30d: number;
  lastViewedAt: string | null;
};

export const getProjectStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StatsRow[]> => {
    const { supabase, userId } = context;

    // Verify caller is admin. RLS on user_roles allows reading own rows.
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) {
      throw new Response("Forbidden: admin only", { status: 403 });
    }

    const { data: projects, error: pErr } = await supabase
      .from("projects")
      .select("id, name, country");
    if (pErr) throw pErr;

    // Page through all views — a single select is capped at 1000 rows.
    const PAGE = 1000;
    const views: { project_id: string; viewed_at: string }[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("project_views")
        .select("project_id, viewed_at")
        .order("viewed_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      views.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
    }


    const now = Date.now();
    const DAY = 86_400_000;
    const map = new Map<string, StatsRow>();
    for (const p of projects ?? []) {
      map.set(p.id, {
        projectId: p.id,
        name: p.name,
        country: p.country,
        total: 0,
        last7d: 0,
        last30d: 0,
        lastViewedAt: null,
      });
    }
    for (const v of views ?? []) {
      const row = map.get(v.project_id);
      if (!row) continue;
      const t = new Date(v.viewed_at).getTime();
      row.total += 1;
      if (now - t <= 7 * DAY) row.last7d += 1;
      if (now - t <= 30 * DAY) row.last30d += 1;
      if (!row.lastViewedAt || new Date(row.lastViewedAt).getTime() < t) {
        row.lastViewedAt = v.viewed_at;
      }
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  });

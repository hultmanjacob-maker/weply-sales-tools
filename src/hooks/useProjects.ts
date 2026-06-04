import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Country = "SE" | "NO" | "DK";

export type Project = {
  id: string;
  name: string;
  url: string;
  country: Country;
  createdAt: number;
};

const SELECTED_KEY_PREFIX = "sales-platform.selectedProjectId.v2.";
const LEGACY_STORAGE_KEY = "sales-platform.projects.v1";

type Row = { id: string; name: string; url: string; country: string; created_at: string };

function rowToProject(r: Row): Project {
  return {
    id: r.id,
    name: r.name,
    url: r.url,
    country: (r.country as Country) ?? "SE",
    createdAt: new Date(r.created_at).getTime(),
  };
}

export function useProjects(country: Country) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async (c: Country) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("country", c)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Failed to load projects", error);
      return [] as Project[];
    }
    const list = (data as Row[] | null)?.map(rowToProject) ?? [];
    setProjects(list);
    return list;
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setHydrated(false);
      const list = await load(country);
      if (!active) return;

      // One-time legacy migration (only when loading SE, since legacy had no country)
      if (country === "SE" && typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
          if (raw) {
            const legacy = JSON.parse(raw) as Project[] | null;
            if (Array.isArray(legacy) && legacy.length > 0 && list.length === 0) {
              const payload = legacy.map((p) => ({ name: p.name, url: p.url, country: "SE" }));
              const { error } = await supabase.from("projects").insert(payload);
              if (!error) await load("SE");
            }
            window.localStorage.removeItem(LEGACY_STORAGE_KEY);
          }
        } catch (e) {
          console.warn("Legacy migration skipped", e);
        }
      }

      const selKey = SELECTED_KEY_PREFIX + country;
      const sel = typeof window !== "undefined" ? window.localStorage.getItem(selKey) : null;
      const current = await load(country);
      if (!active) return;
      if (sel && current.some((p) => p.id === sel)) {
        setSelectedIdState(sel);
      } else {
        setSelectedIdState(current[0]?.id ?? null);
      }
      setHydrated(true);
    })();

    const channel = supabase
      .channel(`projects-changes-${country}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects", filter: `country=eq.${country}` },
        () => {
          load(country);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [country, load]);

  const setSelectedId = useCallback(
    (id: string | null) => {
      setSelectedIdState(id);
      if (typeof window !== "undefined") {
        const selKey = SELECTED_KEY_PREFIX + country;
        if (id) window.localStorage.setItem(selKey, id);
        else window.localStorage.removeItem(selKey);
      }
    },
    [country],
  );

  const addProject = useCallback(
    async (name: string, url: string) => {
      const { data, error } = await supabase
        .from("projects")
        .insert({ name: name.trim(), url: url.trim(), country })
        .select()
        .single();
      if (error || !data) {
        console.error("Failed to add project", error);
        return null;
      }
      const project = rowToProject(data as Row);
      setProjects((prev) => [...prev, project]);
      setSelectedId(project.id);
      return project;
    },
    [country, setSelectedId],
  );

  const removeProject = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) {
        console.error("Failed to remove project", error);
        return;
      }
      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (selectedId === id) {
          setSelectedId(next[0]?.id ?? null);
        }
        return next;
      });
    },
    [selectedId, setSelectedId],
  );

  const selected = projects.find((p) => p.id === selectedId) ?? null;

  return {
    projects,
    selected,
    selectedId,
    setSelectedId,
    addProject,
    removeProject,
    hydrated,
  };
}

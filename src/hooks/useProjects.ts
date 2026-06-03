import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Project = {
  id: string;
  name: string;
  url: string;
  createdAt: number;
};

const SELECTED_KEY = "sales-platform.selectedProjectId.v1";
const LEGACY_STORAGE_KEY = "sales-platform.projects.v1";

type Row = { id: string; name: string; url: string; created_at: string };

function rowToProject(r: Row): Project {
  return { id: r.id, name: r.name, url: r.url, createdAt: new Date(r.created_at).getTime() };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
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
    (async () => {
      let list = await load();

      // One-time migration from localStorage -> DB
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
          if (raw) {
            const legacy = JSON.parse(raw) as Project[] | null;
            if (Array.isArray(legacy) && legacy.length > 0 && list.length === 0) {
              const payload = legacy.map((p) => ({ name: p.name, url: p.url }));
              const { error } = await supabase.from("projects").insert(payload);
              if (!error) {
                list = await load();
              }
            }
            window.localStorage.removeItem(LEGACY_STORAGE_KEY);
          }
        } catch (e) {
          console.warn("Legacy migration skipped", e);
        }
      }

      const sel = typeof window !== "undefined" ? window.localStorage.getItem(SELECTED_KEY) : null;
      if (sel && list.some((p) => p.id === sel)) {
        setSelectedIdState(sel);
      } else if (list.length > 0) {
        setSelectedIdState(list[0].id);
      }
      setHydrated(true);
    })();

    // Realtime sync across browsers
    const channel = supabase
      .channel("projects-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const setSelectedId = useCallback((id: string | null) => {
    setSelectedIdState(id);
    if (typeof window !== "undefined") {
      if (id) window.localStorage.setItem(SELECTED_KEY, id);
      else window.localStorage.removeItem(SELECTED_KEY);
    }
  }, []);

  const addProject = useCallback(
    async (name: string, url: string) => {
      const { data, error } = await supabase
        .from("projects")
        .insert({ name: name.trim(), url: url.trim() })
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
    [setSelectedId],
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

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Country = "SE" | "NO" | "DK" | "NL";

export type Project = {
  id: string;
  name: string;
  url: string | null;
  imagePath: string | null;
  country: Country;
  createdAt: number;
  isFavorite: boolean;
};

export const PROJECT_IMAGE_BUCKET = "project-images";

export async function getProjectImageUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(PROJECT_IMAGE_BUCKET)
    .createSignedUrl(path, 60 * 60 * 8);
  if (error) {
    console.error("Failed to sign image url", error);
    return null;
  }
  return data?.signedUrl ?? null;
}

export async function uploadProjectImage(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PROJECT_IMAGE_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) {
    console.error("Failed to upload image", error);
    return null;
  }
  return path;
}

const SELECTED_KEY_PREFIX = "sales-platform.selectedProjectId.v2.";
const LEGACY_STORAGE_KEY = "sales-platform.projects.v1";

type Row = {
  id: string;
  name: string;
  url: string | null;
  image_url: string | null;
  country: string;
  created_at: string;
  position: number;
  is_favorite: boolean;
};

function rowToProject(r: Row): Project {
  return {
    id: r.id,
    name: r.name,
    url: r.url ?? null,
    imagePath: r.image_url ?? null,
    country: (r.country as Country) ?? "SE",
    createdAt: new Date(r.created_at).getTime(),
    isFavorite: !!r.is_favorite,
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
      .order("position", { ascending: true })
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
    async (name: string, url: string | null, imagePath?: string | null) => {
      const nextPos = projects.length;
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: name.trim(),
          url: url ? url.trim() : null,
          image_url: imagePath ?? null,
          country,
          position: nextPos,
        })
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
    [country, projects.length, setSelectedId],
  );

  const updateProject = useCallback(
    async (
      id: string,
      patch: { name?: string; url?: string | null; imagePath?: string | null },
    ) => {
      const payload: Record<string, unknown> = {};
      if (patch.name !== undefined) payload.name = patch.name.trim();
      if (patch.url !== undefined) payload.url = patch.url ? patch.url.trim() : null;
      if (patch.imagePath !== undefined) payload.image_url = patch.imagePath;
      const { error } = await supabase.from("projects").update(payload).eq("id", id);
      if (error) {
        console.error("Failed to update project", error);
        return false;
      }
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                name: patch.name !== undefined ? patch.name.trim() : p.name,
                url: patch.url !== undefined ? (patch.url ? patch.url.trim() : null) : p.url,
                imagePath: patch.imagePath !== undefined ? patch.imagePath : p.imagePath,
              }
            : p,
        ),
      );
      return true;
    },
    [],
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

  const moveProject = useCallback(
    async (id: string, direction: "up" | "down") => {
      const idx = projects.findIndex((p) => p.id === id);
      if (idx === -1) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= projects.length) return;
      const next = [...projects];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      setProjects(next);
      const results = await Promise.all(
        next.map((p, i) => supabase.from("projects").update({ position: i }).eq("id", p.id)),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        console.error("Failed to reorder", failed.error);
        load(country);
      }
    },
    [projects, country, load],
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const current = projects.find((p) => p.id === id);
      if (!current) return;
      const next = !current.isFavorite;
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: next } : p)));
      const { error } = await supabase.from("projects").update({ is_favorite: next }).eq("id", id);
      if (error) {
        console.error("Failed to toggle favorite", error);
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !next } : p)));
      }
    },
    [projects],
  );

  const selected = projects.find((p) => p.id === selectedId) ?? null;

  return {
    projects,
    selected,
    selectedId,
    setSelectedId,
    addProject,
    updateProject,
    removeProject,
    moveProject,
    toggleFavorite,
    hydrated,
  };
}

// Cross-country favorites hook — powers the "Snabbstart / Favoriter" section.
export function useFavorites() {
  const [favorites, setFavorites] = useState<Project[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_favorite", true)
      .order("country", { ascending: true })
      .order("position", { ascending: true });
    if (error) {
      console.error("Failed to load favorites", error);
      return;
    }
    setFavorites((data as Row[] | null)?.map(rowToProject) ?? []);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("favorites-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return favorites;
}

import { useEffect, useState, useCallback } from "react";

export type Project = {
  id: string;
  name: string;
  url: string;
  createdAt: number;
};

const STORAGE_KEY = "sales-platform.projects.v1";
const SELECTED_KEY = "sales-platform.selectedProjectId.v1";

function readProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const list = readProjects();
    setProjects(list);
    const sel = window.localStorage.getItem(SELECTED_KEY);
    if (sel && list.some((p) => p.id === sel)) {
      setSelectedIdState(sel);
    } else if (list.length > 0) {
      setSelectedIdState(list[0].id);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((list: Project[]) => {
    setProjects(list);
    writeProjects(list);
  }, []);

  const setSelectedId = useCallback((id: string | null) => {
    setSelectedIdState(id);
    if (typeof window !== "undefined") {
      if (id) window.localStorage.setItem(SELECTED_KEY, id);
      else window.localStorage.removeItem(SELECTED_KEY);
    }
  }, []);

  const addProject = useCallback(
    (name: string, url: string) => {
      const project: Project = {
        id: crypto.randomUUID(),
        name: name.trim(),
        url: url.trim(),
        createdAt: Date.now(),
      };
      const next = [...projects, project];
      persist(next);
      setSelectedId(project.id);
      return project;
    },
    [projects, persist, setSelectedId],
  );

  const removeProject = useCallback(
    (id: string) => {
      const next = projects.filter((p) => p.id !== id);
      persist(next);
      if (selectedId === id) {
        setSelectedId(next[0]?.id ?? null);
      }
    },
    [projects, persist, selectedId, setSelectedId],
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

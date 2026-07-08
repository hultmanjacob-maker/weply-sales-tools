import { useEffect, useRef, useState } from "react";
import { ExternalLink, LayoutGrid, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/hooks/useProjects";

type Props = {
  project: Project | null;
  onAddClick: () => void;
};

const LOAD_TIMEOUT_MS = 6000;

export function ProjectViewer({ project, onAddClick }: Props) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!project) return;
    setStatus("loading");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "error" : s));
    }, LOAD_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [project?.id, project?.url]);

  const handleLoad = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus("ready");
  };

  const handleError = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus("error");
  };

  if (!project) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-10">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-sm border border-border bg-card text-primary">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <h2 className="text-2xl tracking-tight">Välkommen till din säljplattform</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Samla alla dina Lovable-säljprojekt på ett ställe. Lägg till ditt
            första projekt så visas det här i full storlek — redo att demonstreras.
          </p>
          <Button onClick={onAddClick} className="mt-6">
            Lägg till första projektet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <iframe
        key={project.id}
        src={project.url}
        title={project.name}
        onLoad={handleLoad}
        onError={handleError}
        className="h-full w-full border-0 bg-background"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
        allow="clipboard-read *; clipboard-write *; fullscreen *"
      />

      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 p-6 backdrop-blur-sm">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              Kunde inte läsa in projektet i den här vyn
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Projektet kan blockera inbäddning eller ta för lång tid att svara. Öppna det i en ny flik för att visa det i full storlek.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Öppna i ny flik
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("loading");
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  timeoutRef.current = setTimeout(() => {
                    setStatus((s) => (s === "loading" ? "error" : s));
                  }, LOAD_TIMEOUT_MS);
                  // force iframe reload by remounting via key change trick
                  const el = document.querySelector<HTMLIFrameElement>(
                    `iframe[title="${CSS.escape(project.name)}"]`,
                  );
                  if (el) el.src = project.url;
                }}
              >
                Försök igen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OpenInNewTabButton({ project }: { project: Project }) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-border bg-background/40 px-2.5 py-1 text-xs text-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      Öppna i ny flik
    </a>
  );
}

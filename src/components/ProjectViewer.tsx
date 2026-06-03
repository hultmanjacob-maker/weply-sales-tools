import { ExternalLink, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "@/hooks/useProjects";

type Props = {
  project: Project | null;
  onAddClick: () => void;
};

export function ProjectViewer({ project, onAddClick }: Props) {
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
    <div className="flex h-full flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card/40 px-4 py-2.5">
        <div className="min-w-0">
          <h1 className="truncate text-base tracking-tight">{project.name}</h1>
          <p className="truncate text-xs text-muted-foreground">{project.url}</p>
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-border bg-background/40 px-3 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Öppna i ny flik
        </a>
      </div>
      <div className="flex-1 bg-background">
        <iframe
          key={project.id}
          src={project.url}
          title={project.name}
          className="h-full w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
        />
      </div>
    </div>
  );
}

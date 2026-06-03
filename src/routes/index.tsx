import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProjectViewer, OpenInNewTabButton } from "@/components/ProjectViewer";
import { AddProjectDialog } from "@/components/AddProjectDialog";
import { useProjects } from "@/hooks/useProjects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Säljplattform — Dina projekt" },
      { name: "description", content: "Samla och visa alla dina Lovable-säljprojekt på ett ställe." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { projects, selected, selectedId, setSelectedId, addProject, removeProject, hydrated } =
    useProjects();
  const [addOpen, setAddOpen] = useState(false);

  if (!hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "12rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          projects={projects}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={addProject}
          onRemove={removeProject}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-card/30 px-2">
            <SidebarTrigger />
            <div className="min-w-0 flex-1 truncate text-xs tracking-tight text-muted-foreground">
              {selected ? selected.name : "Säljplattform"}
            </div>
            {selected && <OpenInNewTabButton project={selected} />}
          </header>
          <main className="flex-1 overflow-hidden">
            <ProjectViewer project={selected} onAddClick={() => setAddOpen(true)} />
          </main>
        </div>
      </div>
      <AddProjectDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addProject} />
    </SidebarProvider>
  );
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProjectViewer } from "@/components/ProjectViewer";
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          projects={projects}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={addProject}
          onRemove={removeProject}
        />
        <div className="flex flex-1 flex-col">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card/30 px-3">
            <SidebarTrigger />
            <div className="ml-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Säljplattform
            </div>
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

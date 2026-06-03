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
          "--sidebar-width": "14rem",
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
        <main className="relative flex min-w-0 flex-1">
          <SidebarTrigger className="absolute left-2 top-2 z-10 bg-card/70 backdrop-blur hover:bg-card" />
          {selected && (
            <div className="absolute right-2 top-2 z-10">
              <OpenInNewTabButton project={selected} />
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <ProjectViewer project={selected} onAddClick={() => setAddOpen(true)} />
          </div>
        </main>
      </div>
      <AddProjectDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addProject} />
    </SidebarProvider>
  );
}

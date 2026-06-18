import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProjectViewer, OpenInNewTabButton } from "@/components/ProjectViewer";
import { AddProjectDialog } from "@/components/AddProjectDialog";
import { useProjects, type Country } from "@/hooks/useProjects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sales Tools — Dina projekt" },
      { name: "description", content: "Samla och visa alla dina Lovable-säljprojekt på ett ställe." },
    ],
  }),
  component: Dashboard,
});

const COUNTRIES: { code: Country; label: string; flag: string }[] = [
  { code: "SE", label: "Sweden", flag: "🇸🇪" },
  { code: "NO", label: "Norway", flag: "🇳🇴" },
  { code: "DK", label: "Denmark", flag: "🇩🇰" },
  { code: "NL", label: "Netherlands", flag: "🇳🇱" },
];

function Dashboard() {
  const [country, setCountry] = useState<Country>("NO");
  const { projects, selected, selectedId, setSelectedId, addProject, removeProject, moveProject, hydrated } =
    useProjects(country);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          country={country}
          onCountryChange={setCountry}
          projects={projects}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={addProject}
          onRemove={removeProject}
          onMove={moveProject}
        />
        <main className="relative flex min-w-0 flex-1 flex-col">
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border bg-card/40 px-2 backdrop-blur">
            <SidebarTrigger className="hover:bg-card" />
            <div className="ml-auto">{selected && <OpenInNewTabButton project={selected} />}</div>
          </div>
          <div className="relative flex-1 overflow-hidden">
            {!hydrated ? (
              <div className="h-full w-full" />
            ) : (
              <ProjectViewer project={selected} onAddClick={() => setAddOpen(true)} />
            )}
          </div>
        </main>
      </div>
      <AddProjectDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addProject} />
    </SidebarProvider>
  );
}


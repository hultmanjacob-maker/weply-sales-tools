import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProjectViewer, OpenInNewTabButton } from "@/components/ProjectViewer";
import { AddProjectDialog } from "@/components/AddProjectDialog";
import { useProjects, type Country } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sales Tools — Dina projekt" },
      { name: "description", content: "Samla och visa alla dina Lovable-säljprojekt på ett ställe." },
    ],
  }),
  component: DashboardGate,
});

function DashboardGate() {
  const navigate = useNavigate();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (isReady && !user) {
      navigate({ to: "/auth" });
    }
  }, [isReady, user, navigate]);

  if (!isReady) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Laddar…</div>;
  }
  if (!user) return null;
  return <Dashboard />;
}

function Dashboard() {
  const [country, setCountry] = useState<Country>("NO");
  const { projects, selected, selectedId, setSelectedId, addProject, removeProject, moveProject, hydrated } =
    useProjects(country);
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

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
            <div className="ml-auto flex items-center gap-2">
              {selected && <OpenInNewTabButton project={selected} />}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                title="Logga ut"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logga ut
              </Button>
            </div>
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


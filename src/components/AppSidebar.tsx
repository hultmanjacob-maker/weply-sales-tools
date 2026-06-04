import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AddProjectDialog } from "./AddProjectDialog";
import type { Project, Country } from "@/hooks/useProjects";

const COUNTRIES: { code: Country; label: string; flag: string }[] = [
  { code: "NO", label: "NO", flag: "🇳🇴" },
  { code: "SE", label: "SE", flag: "🇸🇪" },
  { code: "DK", label: "DK", flag: "🇩🇰" },
];

type Props = {
  country: Country;
  onCountryChange: (c: Country) => void;
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string, url: string) => void;
  onRemove: (id: string) => void;
};


export function AppSidebar({ country, onCountryChange, projects, selectedId, onSelect, onAdd, onRemove }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary/15 text-lg">
            <span role="img" aria-label="tools">🧰</span>
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Platform
            </span>
            <span className="text-base font-semibold tracking-tight">Sales Tools</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex gap-1 rounded-md border border-sidebar-border bg-sidebar-accent/30 p-0.5 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-0.5 group-data-[collapsible=icon]:p-0.5">
              {COUNTRIES.map((c) => {
                const active = country === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => onCountryChange(c.code)}
                    title={c.label}
                    aria-pressed={active}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium transition-colors group-data-[collapsible=icon]:px-0 ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <span aria-hidden>{c.flag}</span>
                    <span className="group-data-[collapsible=icon]:hidden">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            Projekt
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length === 0 && (
                <p className="px-2 py-3 text-xs italic text-muted-foreground group-data-[collapsible=icon]:hidden">
                  Inga projekt än.
                </p>
              )}
              {projects.map((p) => (
                <SidebarMenuItem key={p.id} className="group/item relative">
                  <SidebarMenuButton
                    isActive={selectedId === p.id}
                    onClick={() => onSelect(p.id)}
                    tooltip={p.name}
                    className="pr-8"
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        selectedId === p.id ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                    />
                    <span className="truncate">{p.name}</span>
                  </SidebarMenuButton>
                  <button
                    aria-label={`Ta bort ${p.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Ta bort "${p.name}"?`)) onRemove(p.id);
                    }}
                    className="absolute right-1 top-1/2 hidden -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive group-hover/item:block group-data-[collapsible=icon]:!hidden"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <Button
          onClick={() => setOpen(true)}
          className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          variant="default"
        >
          <Plus className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Nytt projekt</span>
        </Button>
      </SidebarFooter>

      <AddProjectDialog open={open} onOpenChange={setOpen} onAdd={onAdd} />
    </Sidebar>
  );
}

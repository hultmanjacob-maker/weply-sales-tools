import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
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
  { code: "NL", label: "NL", flag: "🇳🇱" },
];

type Props = {
  country: Country;
  onCountryChange: (c: Country) => void;
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string, url: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
};


export function AppSidebar({ country, onCountryChange, projects, selectedId, onSelect, onAdd, onRemove, onMove }: Props) {
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
        <SidebarGroup className="px-2">
          <SidebarGroupContent>
            <div className="grid grid-cols-4 gap-0.5 rounded-md border border-sidebar-border bg-sidebar-accent/30 p-0.5 group-data-[collapsible=icon]:grid-cols-1">
              {COUNTRIES.map((c) => {
                const active = country === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => onCountryChange(c.code)}
                    title={c.label}
                    aria-pressed={active}
                    className={`flex min-w-0 items-center justify-center gap-1 rounded-sm px-1 py-1 text-[11px] font-medium leading-none transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <span aria-hidden className="text-sm">{c.flag}</span>
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
              {projects.map((p, i) => (
                <SidebarMenuItem key={p.id} className="group/item relative">
                  <SidebarMenuButton
                    isActive={selectedId === p.id}
                    onClick={() => onSelect(p.id)}
                    tooltip={p.name}
                    className="pr-20"
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        selectedId === p.id ? "bg-primary" : "bg-muted-foreground/40"
                      }`}
                    />
                    <span className="truncate">{p.name}</span>
                  </SidebarMenuButton>
                  <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 group-hover/item:flex group-data-[collapsible=icon]:!hidden">
                    <button
                      aria-label={`Flytta upp ${p.name}`}
                      disabled={i === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(p.id, "up");
                      }}
                      className="rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      aria-label={`Flytta ner ${p.name}`}
                      disabled={i === projects.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(p.id, "down");
                      }}
                      className="rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      aria-label={`Ta bort ${p.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Ta bort "${p.name}"?`)) onRemove(p.id);
                      }}
                      className="rounded-sm p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
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

import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
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
import { getProjectPalette, getProjectEmoji } from "@/lib/projectVisual";

const COUNTRIES: { code: Country; label: string; flag: string }[] = [
  { code: "NO", label: "Norway", flag: "🇳🇴" },
  { code: "SE", label: "Sweden", flag: "🇸🇪" },
  { code: "DK", label: "Denmark", flag: "🇩🇰" },
  { code: "NL", label: "Netherlands", flag: "🇳🇱" },
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
  const [addExpanded, setAddExpanded] = useState(false);

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
            <div className="grid grid-cols-2 gap-1 rounded-md border border-sidebar-border bg-sidebar-accent/30 p-1 group-data-[collapsible=icon]:grid-cols-1">
              {COUNTRIES.map((c) => {
                const active = country === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => onCountryChange(c.code)}
                    title={c.label}
                    aria-pressed={active}
                    className={`flex min-w-0 items-center justify-center gap-1.5 rounded-sm px-2 py-1.5 text-[11px] font-medium leading-none transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <span aria-hidden className="text-sm">{c.flag}</span>
                    <span className="truncate group-data-[collapsible=icon]:hidden">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Projekt</span>
            {projects.length > 0 && (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
                {projects.length}
              </span>
            )}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length === 0 && (
                <p className="px-2 py-3 text-xs italic text-muted-foreground group-data-[collapsible=icon]:hidden">
                  Inga projekt än.
                </p>
              )}
              {projects.map((p, i) => {
                const palette = getProjectPalette(p.name);
                const emoji = getProjectEmoji(p.name);
                const isActive = selectedId === p.id;
                return (
                  <SidebarMenuItem key={p.id} className="group/item relative">
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onSelect(p.id)}
                      tooltip={p.name}
                      className={`h-auto items-start gap-3 rounded-lg py-2 pr-20 transition-all ${
                        isActive
                          ? "border border-white/10 bg-white/[0.06] shadow-sm"
                          : "border border-transparent hover:bg-white/[0.04]"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-base shadow-sm ${palette.bg} ${palette.border} ${palette.text} ${palette.glow}`}
                      >
                        {emoji}
                      </span>
                      <span className="min-w-0 whitespace-normal break-words text-sm leading-tight">
                        {p.name}
                      </span>
                    </SidebarMenuButton>
                    <div className="absolute right-1 top-1.5 hidden items-center gap-0.5 group-hover/item:flex group-data-[collapsible=icon]:!hidden">
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
                );
              })}
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

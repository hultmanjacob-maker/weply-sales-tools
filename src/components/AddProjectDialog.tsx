import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, url: string) => void;
};

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withScheme);
    return u.toString();
  } catch {
    return null;
  }
}

export function AddProjectDialog({ open, onOpenChange, onAdd }: Props) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setUrl("");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ange ett namn.");
      return;
    }
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError("Ange en giltig URL.");
      return;
    }
    onAdd(name, normalized);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">Lägg till säljprojekt</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Klistra in publik URL till ditt Lovable-projekt.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Namn</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="t.ex. Pitch — Acme Corp"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-url">URL</Label>
            <Input
              id="project-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ditt-projekt.lovable.app"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Avbryt
            </Button>
            <Button type="submit">Lägg till</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

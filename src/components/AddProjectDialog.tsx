import { useEffect, useState } from "react";
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
import { Trash2, Upload } from "lucide-react";
import {
  getProjectImageUrl,
  uploadProjectImage,
  type Project,
} from "@/hooks/useProjects";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, url: string | null, imagePath?: string | null) => void;
  /** When set, the dialog edits this project instead of creating a new one. */
  project?: Project | null;
  onUpdate?: (
    id: string,
    patch: { name?: string; url?: string | null; imagePath?: string | null },
  ) => void;
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

export function AddProjectDialog({ open, onOpenChange, onAdd, project, onUpdate }: Props) {
  const isEdit = !!project;
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? "");
    setUrl(project?.url ?? "");
    setImagePath(project?.imagePath ?? null);
    setError(null);
  }, [open, project?.id, project?.name, project?.url, project?.imagePath]);

  useEffect(() => {
    let active = true;
    setPreview(null);
    if (!imagePath) return;
    getProjectImageUrl(imagePath).then((u) => {
      if (active) setPreview(u);
    });
    return () => {
      active = false;
    };
  }, [imagePath]);

  function reset() {
    setName("");
    setUrl("");
    setImagePath(null);
    setPreview(null);
    setError(null);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    const path = await uploadProjectImage(file);
    setUploading(false);
    if (!path) {
      setError("Kunde inte ladda upp bilden. Försök igen.");
      return;
    }
    setImagePath(path);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Ange ett namn.");
      return;
    }
    let normalized: string | null = null;
    if (url.trim()) {
      normalized = normalizeUrl(url);
      if (!normalized) {
        setError("Ange en giltig URL.");
        return;
      }
    }
    if (!normalized && !imagePath) {
      setError("Ange en URL eller ladda upp en bild.");
      return;
    }
    if (isEdit && project && onUpdate) {
      onUpdate(project.id, { name, url: normalized, imagePath });
    } else {
      onAdd(name, normalized, imagePath);
    }
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
          <DialogTitle className="text-xl tracking-tight">
            {isEdit ? "Redigera projekt" : "Lägg till säljprojekt"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ange en publik URL, en bild — eller båda. Är bara ett fält ifyllt används det.
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
            <Label htmlFor="project-url">URL (valfri)</Label>
            <Input
              id="project-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ditt-projekt.lovable.app"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-image">Bild / skärmdump (valfri)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="project-image"
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="cursor-pointer"
              />
              {imagePath && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Ta bort bild"
                  onClick={() => setImagePath(null)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            {uploading && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Upload className="h-3 w-3" /> Laddar upp…
              </p>
            )}
            {preview && (
              <img
                src={preview}
                alt="Förhandsvisning"
                className="max-h-40 w-full rounded-sm border border-border object-contain"
              />
            )}
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
            <Button type="submit" disabled={uploading}>
              {isEdit ? "Spara" : "Lägg till"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

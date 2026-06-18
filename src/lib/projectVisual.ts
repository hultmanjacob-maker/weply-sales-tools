// Deterministic visual styling for projects, derived from the project name.
// No DB changes — same name always yields the same color + emoji.

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type ProjectPalette = {
  bg: string;
  border: string;
  text: string;
  glow: string;
};

const PALETTES: ProjectPalette[] = [
  { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-300", glow: "shadow-emerald-500/10" },
  { bg: "bg-amber-500/20",   border: "border-amber-500/30",   text: "text-amber-300",   glow: "shadow-amber-500/10" },
  { bg: "bg-violet-500/20",  border: "border-violet-500/30",  text: "text-violet-300",  glow: "shadow-violet-500/10" },
  { bg: "bg-sky-500/20",     border: "border-sky-500/30",     text: "text-sky-300",     glow: "shadow-sky-500/10" },
  { bg: "bg-rose-500/20",    border: "border-rose-500/30",    text: "text-rose-300",    glow: "shadow-rose-500/10" },
  { bg: "bg-indigo-500/20",  border: "border-indigo-500/30",  text: "text-indigo-300",  glow: "shadow-indigo-500/10" },
  { bg: "bg-cyan-500/20",    border: "border-cyan-500/30",    text: "text-cyan-300",    glow: "shadow-cyan-500/10" },
  { bg: "bg-lime-500/20",    border: "border-lime-500/30",    text: "text-lime-300",    glow: "shadow-lime-500/10" },
  { bg: "bg-fuchsia-500/20", border: "border-fuchsia-500/30", text: "text-fuchsia-300", glow: "shadow-fuchsia-500/10" },
  { bg: "bg-teal-500/20",    border: "border-teal-500/30",    text: "text-teal-300",    glow: "shadow-teal-500/10" },
];

const EMOJIS = [
  "📊", "📈", "💼", "🚀", "🎯", "🛠️", "💡", "📞", "🗂️", "🧭",
  "💎", "🔑", "📬", "🧩", "⚡", "🌟", "🏆", "🔥", "📌", "🧮",
];

export function getProjectPalette(name: string): ProjectPalette {
  const h = hashString(name.toLowerCase().trim() || "x");
  return PALETTES[h % PALETTES.length];
}

export function getProjectEmoji(name: string): string {
  const h = hashString(name.toLowerCase().trim() || "x");
  // Offset so emoji/palette aren't perfectly correlated
  return EMOJIS[(h >>> 3) % EMOJIS.length];
}

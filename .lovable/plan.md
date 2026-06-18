## Mål
Gör projektraderna i vänstra spalten mer visuella enligt valda direction "Glas + färgad ram" (v3): varje projekt får en färgad emoji-kvadrat (rounded), subtil glas-bakgrund på aktiv rad, hover-tonad bakgrund på övriga. Antal-badge bredvid "Projekt"-rubriken.

## Tillvägagångssätt
Färg och emoji **härleds dynamiskt** från projektnamnet — inga databasändringar behövs. Det betyder att samma namn alltid får samma färg/emoji, men det sparas inte separat.

### Ändringar
1. **Ny hjälpfil `src/lib/projectVisual.ts`**
   - `hashString(name)` → stabilt heltal
   - `getProjectColor(name)` → väljer en av ~8 färgpaletter (emerald, amber, violet, sky, rose, indigo, cyan, lime) med matchande `bg/20`, `border/30`, `text-400` Tailwind-klasser
   - `getProjectEmoji(name)` → väljer en emoji från en kuraterad lista (📊 📈 💼 🚀 🎯 🛠️ 💡 📞 🗂️ 🧭 …) baserat på hash

2. **`src/components/AppSidebar.tsx`**
   - Ersätt nuvarande lilla prick + textspan med:
     - 8×8 rounded-md färgad emoji-tile (bg/border/text från palett)
     - Projektnamnet (wrap, leading-tight)
   - Aktiv rad: `bg-white/[0.06] border border-white/10` (glas-känsla)
   - Inaktiv rad: `hover:bg-white/[0.05]`
   - Lägg till liten antals-badge bredvid "Projekt"-rubriken: `{projects.length}` i pill
   - Hover-knappar (upp/ner/ta bort) behålls oförändrade

### Vad ändras inte
- Inga databasmigreringar
- Landflikar, header och footer-knapp orörda
- Layouten i huvudvyn orörd
- Ingen ny props på `useProjects`
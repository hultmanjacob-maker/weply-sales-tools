# Redigera projekt: byt URL eller ladda upp en bild

## Vad du får

- **Redigera-knapp** på varje projekt i sidopanelen (vid pilarna/stjärnan). Öppnar en dialog med **Namn**, **URL** och **Bild**.
- **URL kan ändras** i efterhand — inget behov av att ta bort och lägga till projektet igen.
- **Bilduppladdning** (t.ex. en skärmdump). Bilden visas i högra vyn i stället för den inbäddade sidan.
- **Regeln du bad om:** är bara ett av fälten ifyllt används det ifyllda. Är båda ifyllda visas den inbäddade sidan (URL), och om den inte kan laddas visas bilden automatiskt som reserv i stället för dagens felmeddelande.
- Minst ett av fälten måste vara ifyllt när man sparar (annars finns inget att visa).
- Bilden kan tas bort igen i samma dialog.

## Så visas det

```text
URL ifylld, bild tom      -> inbäddad sida (som idag)
URL tom, bild ifylld      -> bilden i full storlek
båda ifyllda              -> inbäddad sida; faller tillbaka till bilden om den blockeras
```

"Öppna i ny flik"-knappen visas bara när projektet har en URL.

## Teknisk del

1. **Databas (migration):**
   - `projects.image_url text` (nullable).
   - `projects.url` görs nullable så bild-bara-projekt kan sparas.
2. **Lagring:** publik bucket `project-images` med policyer som tillåter uppladdning/läsning i linje med appens nuvarande öppna läge (ingen inloggning).
3. **`useProjects`:** nytt `imageUrl`-fält i `Project`, ny `updateProject(id, { name, url, imageUrl })`, `url` blir `string | null`.
4. **Ny komponent `EditProjectDialog.tsx`:** återanvänder URL-normaliseringen från `AddProjectDialog`, filväljare som laddar upp till bucketen och sparar publik URL. Validering: minst namn + (URL eller bild).
5. **`AppSidebar.tsx`:** redigera-ikon per projektrad, kopplad till dialogen.
6. **`ProjectViewer.tsx`:** väljer iframe eller `<img>` enligt regeln ovan; vid iframe-fel/timeout visas bilden om den finns, annars nuvarande fallback.
7. **`AddProjectDialog.tsx`:** samma valfria bildfält vid skapande.

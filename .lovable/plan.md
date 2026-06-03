## Vad vi bygger

En intern säljplattform där du samlar dina Lovable-säljprojekt på ett ställe. Vänster sidebar listar projekten, klick laddar valt projekt i en iframe till höger som fyller resten av skärmen.

```text
┌──────────────┬─────────────────────────────┐
│ SÄLJPLATTFORM│                             │
│              │                             │
│ + Nytt projekt│   <iframe> visar           │
│              │   valt säljprojekt          │
│ • Projekt A  │                             │
│ • Projekt B  │                             │
│ • Projekt C  │                             │
└──────────────┴─────────────────────────────┘
```

## Designriktning

- **Tema**: mörkt, marinblå bakgrund — känns som en pålitlig B2B/sales-cockpit.
- **Palett (Navy Trust, mörk)**:
  - Bakgrund: `#0f1b3d` (djup navy)
  - Surface/sidebar: `#1e3a5f`
  - Accent (aktiv rad, knappar): `#3b6fa0`
  - Text: `#e8edf3`
- **Typografi**: Times New Roman genomgående. Ger en klassisk, auktoritär, nästan finansiell-rapport-känsla — passar sälj/förtroende. Rubriker tunga, brödtext luftig.
- **Stil**: rena linjer, tunna borders, inga lekfulla animationer. Sidebar-rader med subtil hover och tydlig "aktiv"-indikator. Logo/wordmark "Säljplattform" högst upp i sidebaren.

## Funktioner

- **Lägg till projekt**: knapp i sidebaren → dialog med `Namn` + `URL` (din `*.lovable.app`-länk).
- **Lista projekt**: lagras i `localStorage`, sorterade efter när de lades till.
- **Välj projekt**: klick → laddas i iframen, raden markeras som aktiv.
- **Ta bort projekt**: papperskorg-ikon vid hover på raden, med bekräftelse.
- **Öppna i ny flik**: ikon i toppen av höger panel (fallback om ett projekt blockerar iframe-inbäddning).
- **Tom-state**: när inga projekt finns, centrerat meddelande "Lägg till ditt första säljprojekt" + knapp.
- **Kollapsbar sidebar**: trigger-knapp så iframen kan ta nästan hela skärmen vid demo.

## Filstruktur

- `src/styles.css` — uppdatera tokens (navy-palett, Times New Roman som `--font-sans`, default dark).
- `src/routes/index.tsx` — dashboard-layout (SidebarProvider + AppSidebar + huvudpanel med iframe).
- `src/components/AppSidebar.tsx` — sidebar med logo, lista, lägg-till-knapp.
- `src/components/ProjectViewer.tsx` — högerpanel med toolbar (titel + "öppna i ny flik") och iframe, hanterar tomt läge.
- `src/components/AddProjectDialog.tsx` — dialog för namn + URL, enkel URL-validering.
- `src/hooks/useProjects.ts` — läs/skriv projektlista och valt projekt mot `localStorage`.

## Begränsningar att känna till

- Projekten måste vara **publicerade** (eller ha aktiv preview-URL) för att laddas i iframen.
- Vissa sajter sätter headers som blockerar iframe-inbäddning → då är "öppna i ny flik"-knappen reservutgången.
- Listan ligger i `localStorage` — bara din webbläsare på denna enhet. (Vill du senare synka mellan datorer byter vi till Lovable Cloud.)

## Teknik

- shadcn `Sidebar`, `Dialog`, `Input`, `Button` (redan installerade).
- Inga nya dependencies, inget backend, ingen auth.

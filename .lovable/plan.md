# Plan: Favoriter + Statistik

Bygger enligt design-riktning **"Minimalistisk admin"** (v2) — passar den nuvarande mörka, täta sidebaren utan att rita om chrome.

## 1. Favoriter (delat, publikt)

- Migration: `projects.is_favorite boolean not null default false`.
- `useProjects`: lägg till `toggleFavorite(id)` och en query som hämtar alla favoriter oavsett land (utan `.eq("country", …)`). Realtime-kanalen som redan finns täcker uppdateringar.
- Sidebar (`AppSidebar`): ny sektion **⭐ Favoriter** överst, ovanför landstabbarna. Varje rad = emoji-tile + projektnamn + liten landchip (NO/SE/DK/NL). Klick väljer projektet och byter automatiskt aktivt land vid behov.
- I den vanliga projektlistan: liten stjärnikon som visas vid hover och togglar favorit.

## 2. Statistik (admin-only)

- Migration: `project_views (project_id fk cascade, viewed_at timestamptz default now())`.
  - RLS: `INSERT` tillåten för `anon`+`authenticated` (för fire-and-forget-loggning). `SELECT` endast för inloggade admins via `has_role(auth.uid(),'admin')`.
  - Standardtabeller för `app_role` enum, `user_roles` och `has_role`-funktionen (security definer) enligt best practice.
- Loggning: `ProjectViewer` skickar en insert när ett projekt visats > ~2 s. Ingen IP/UA/session sparas.
- Ny publik route `/auth`: enkel e-post + lösenord (signup avstängt — admins skapas manuellt i backend). Ingen sidebar/dashboard-inloggning krävs för vanliga användare.
- Ny skyddad route `_authenticated/stats.tsx`:
  - Använder integration-managed `_authenticated/route.tsx` (redirect till `/auth` om ej inloggad).
  - Extra check i loadern: om användaren ej har `admin`-roll → visa "Ingen åtkomst".
  - Server function (`requireSupabaseAuth`) aggregerar `project_views` joinat mot `projects`: Land, Projekt, Visningar totalt, 7d, Senast visad. Sorterbar tabell, filterchips (7d / 30d / Allt).
- Sidebar-footer: när inloggad admin → visa "📊 Statistik" + "Logga ut". Annars inget (håller UI:t rent för säljare).

## 3. Ingen retention (för nu)

Behåller alla views tills vidare — kan läggas till senare som cron om volymen blir stor.

## Tekniska detaljer

- Två migrationer (favorit-kolumn, sedan roles + views + policies).
- Nya filer: `src/hooks/useAuth.ts`, `src/routes/auth.tsx`, `src/routes/_authenticated/stats.tsx`, `src/lib/stats.functions.ts`, `src/lib/favorites.functions.ts` (eller utökar `useProjects`).
- Uppdaterar: `AppSidebar.tsx`, `ProjectViewer.tsx`, `src/start.ts` (bearer-middleware om ej redan aktiv).
- Admin-konto: skapas manuellt i backend efteråt (Authentication → Users → Add user + insert i `user_roles`).

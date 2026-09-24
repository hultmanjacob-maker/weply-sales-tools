# Microsoft sign-in via direct Supabase OAuth on /auth

## Background

The `/auth` page already has a "Logga in med Microsoft" button above the email
form with an "eller" divider. Today it calls Lovable's managed OAuth wrapper,
which only works on Lovable-hosted domains. The user wants the button to use
`supabase.auth.signInWithOAuth` with provider `"azure"` and
`options.redirectTo = window.location.origin`, so the same code also works on
the Azure-hosted copy of the dashboard.

## Changes — src/routes/auth.tsx only

1. Replace the body of `onMicrosoftSignIn` with:

```ts
const { error } = await supabase.auth.signInWithOAuth({
  provider: "azure",
  options: { redirectTo: window.location.origin },
});
```

- On error: show the existing error banner (`setError`).
- On success: the browser full-page redirects to Microsoft; after sign-in it
  returns to `window.location.origin` (the projects page at `/`), where the
  Supabase client picks up the session from the URL automatically.
- Keep the `busy` state so the button disables during the call.

2. Remove the now-unused `lovable` import from the file.

3. Leave everything else untouched:
   - Button position above the email form, Microsoft logo, divider.
   - Email/password form and its behavior.
   - Existing `useEffect` that redirects signed-in users to `/stats`.

## Backend / provider

- Microsoft provider is already enabled via managed social login (done in the
  previous change); no provider reconfiguration needed.
- Supabase's provider key for Microsoft sign-in is `azure`, which is what the
  user requested.

## Verification

- Build passes.
- Playwright against the preview: open `/auth`, click "Logga in med
  Microsoft", confirm the browser navigates away to the Microsoft/Azure login
  page (proves the OAuth call succeeded and the redirect target is accepted).
- Confirm the email form still submits as before (no regression).
- Note for the user: for the Azure-hosted copy, that domain must be present in
  the backend's allowed redirect URLs; if sign-in there fails with a redirect
  error, the domain needs to be allowlisted.

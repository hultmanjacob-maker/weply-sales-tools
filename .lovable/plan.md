# Instruktioner till ägaren av MRR-September (Azure Static Web Apps)

## Vad som behöver ändras

Dashboarden (`weply-sales-tools.lovable.app`) visar era säljverktyg i en iframe. För närvarande blockerar MRR-September-sidan detta genom att skicka två säkerhetsheaders:

```text
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: ... frame-ancestors 'self'
```

Dessa headers måste uppdateras så att dashboarden får bädda in sidan.

## Teknisk lösning för Azure Static Web Apps

I Azure Static Web Apps styrs headers via filen `staticwebapp.config.json` i projektets rot.

### Steg 1: Lägg till följande konfiguration

```json
{
  "globalHeaders": {
    "X-Frame-Options": "ALLOW-FROM https://weply-sales-tools.lovable.app"
  },
  "routes": [
    {
      "route": "/*",
      "headers": {
        "Content-Security-Policy": "frame-ancestors 'self' https://weply-sales-tools.lovable.app https://id-preview--05a1a3e0-45d2-4757-a882-b112a9ef65bc.lovable.app;"
      }
    }
  ]
}
```

### Steg 2: Notera följande

- Om `X-Frame-Options` fortfarande stör kan den tas bort helt — då styrs allt av `Content-Security-Policy`.
- Om ni vill att det även ska fungera i preview-läget, behåll den andra Lovable-domänen i listan.
- Om andra underdomäner används i framtiden läggs de till i samma lista.
- Ändra inte `default-src 'none'` eller andra CSP-direktiv om de behövs för sidans funktion — lägg bara till `frame-ancestors`.

## Hur vi vet att det fungerar

Efter ändringen ska ett anrop till sidan returnera något av följande:

```text
X-Frame-Options: ALLOW-FROM https://weply-sales-tools.lovable.app
```

eller att headern saknas helt, och:

```text
Content-Security-Policy: ... frame-ancestors 'self' https://weply-sales-tools.lovable.app ...
```

Då kommer dashboarden att kunna visa MRR-September direkt i fönstret istället för att visa "Kunde inte läsa in projektet".

## Säkerhetsaspekt

Att tillåta inbäddning endast för `weply-sales-tools.lovable.app` är säkert — det begränsar vilka webbplatser som får visa sidan i en iframe. Det är inte samma sak som att göra datan publik; endast den angivna dashboarden kan bädda in vyn.

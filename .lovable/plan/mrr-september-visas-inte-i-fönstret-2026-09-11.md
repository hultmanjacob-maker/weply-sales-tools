# MRR-September visas inte i fönstret

## Vad jag hittade

Länken är inte trasig. Sidan svarar helt normalt (den heter "Sales Dashboard"), men den är inställd på att **inte tillåta visning inuti en annan sida**. Samma inställning som "Call time" har. Därför blir rutan tom, och först efter 6 sekunder dyker meddelandet "Kunde inte läsa in projektet" upp.

Det går inte att kringgå från vår sida — det är projektets egen säkerhetsinställning. Två saker kan vi göra: göra upplevelsen snabb och tydlig hos oss, och (om du vill) ändra inställningen i själva MRR-projektet så att inbäddning tillåts.

## Vad jag föreslår att vi bygger

1. **Snabb upptäckt istället för 6 sekunders tomt fönster**
   Innan vi försöker visa projektet frågar vi sidan om den tillåter visning. Blockerar den, visar vi direkt kortet med knappen "Öppna i ny flik" — ingen väntan, ingen tom ruta.

2. **Tydligare text när ett projekt blockerar visning**
   Meddelandet säger att projektet inte tillåter att visas här och att det öppnas i ny flik istället, med knappen direkt under.

3. **Automatisk öppning-knapp kvar i toppen**
   Ingen ändring behövs, men knappen blir det naturliga valet för dessa projekt.

## Om du vill se det direkt i fönstret

Då behöver MRR-projektet självt tillåta inbäddning (ta bort spärren mot att visas i andra sidor). Säg till om det projektet också ligger hos oss, så fixar jag det där istället — då syns det direkt i dashboarden utan ny flik.

## Teknisk detalj

- `https://wonderful-plant-04e64c903.3.azurestaticapps.net/` svarar `200` men skickar `x-frame-options: SAMEORIGIN` och `content-security-policy: ... frame-ancestors 'self'` — iframen blockeras av webbläsaren.
- Ny server function (`src/lib/embed.functions.ts`): tar en URL, gör ett `HEAD`/`GET`-anrop och returnerar `embeddable: boolean` genom att läsa `x-frame-options` och `frame-ancestors` i CSP. Resultatet cachas i TanStack Query per URL.
- `ProjectViewer.tsx`: kör kontrollen när ett projekt med URL väljs. Vid `embeddable: false` hoppar vi rakt till felläget (som redan faller tillbaka på uppladdad bild om en sådan finns). Vid okänt/timeout behålls dagens 6-sekundersbeteende.
- Ingen databas- eller schemaändring.

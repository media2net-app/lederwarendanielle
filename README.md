# Lederwaren Daniëlle – Maatwerk applicatie

Maatwerk applicatie voor **bedrijfsprocessen automatiseren met AI**, in huisstijl van [Lederwaren Daniëlle](https://www.lederwaren-danielle.nl/).

## Tech stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

## Starten

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Via de startpagina kom je op **Inloggen B2B** (`/login`).

## Pagina’s

- **/** – Startpagina met link naar B2B-login
- **/login** – Dummy B2B-login (e-mail + wachtwoord). Er is nog geen echte authenticatie; na “Inloggen” krijg je een bevestigingstekst.

## Volgende stappen

- Echte authenticatie (bijv. NextAuth, Supabase of eigen API) koppelen
- Dashboard/portaal voor ingelogde gebruikers
- AI-ondersteuning voor bedrijfsprocessen uitbouwen

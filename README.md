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

## Supabase todo testflow

1. Open Supabase SQL Editor.
2. Voer het script uit uit `SUPABASE_TODOS_SETUP.sql`.
3. Start de app met `npm run dev`.
4. Open `http://localhost:3000`.
5. Voeg een todo toe in het formulier; de lijst ververst direct na submit.

## Supabase orders testflow

1. Voer `SUPABASE_ORDERS_SETUP.sql` uit in Supabase SQL Editor.
2. Voer daarna `SUPABASE_ORDERS_SEED.sql` uit voor voorbeeldorders.
3. Open `http://localhost:3000/supabase-orders` voor de UI test.
4. API test:
   - `GET /api/supabase-orders`
   - `POST /api/supabase-orders` met JSON:
     `{ "klant_naam": "Test", "klant_email": "test@example.nl", "totaal": 99.95 }`

## Supabase tasks testflow

1. Voer `SUPABASE_TASKS_SETUP.sql` uit in Supabase SQL Editor.
2. Voer daarna `SUPABASE_TASKS_SEED.sql` uit voor voorbeeldtaken.
3. Open `http://localhost:3000/dashboard/taken`.
4. Test:
   - takenlijst laadt uit `GET /api/tasks`
   - nieuwe taak via `http://localhost:3000/dashboard/taken/nieuw`
   - status/subtaken aanpassen op taakdetail (`/dashboard/taken/[id]`)

## Supabase klantenservice basis (omnichannel)

1. Voer `SUPABASE_SUPPORT_SETUP.sql` uit in Supabase SQL Editor.
2. Voer daarna `SUPABASE_SUPPORT_SEED.sql` uit voor voorbeelddata.
3. API basis:
   - `GET /api/support/tickets`
   - `POST /api/support/tickets`
   - `GET /api/support/tickets/[id]`
   - `PATCH /api/support/tickets/[id]`
   - `POST /api/support/tickets/[id]/messages`
4. Kanaal webhooks (inbound):
   - `POST /api/webhooks/whatsapp`
   - `POST /api/webhooks/email`
   - `POST /api/webhooks/webchat`

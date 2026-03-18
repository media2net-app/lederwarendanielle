# Plan 2.0 – Lederwaren Daniëlle Hoofdportaal

Uitbreidingen en nieuwe functies voor de demo, gebaseerd op de huidige app en de context van Lederwaren Daniëlle (merken: Orange Fire, Shelby Brothers, Ratpack, Leather Design, GAZ; groothandel; AI Headquarters voor bedrijfsprocessen).

---

## 1. Bestaande functies uitbreiden

### 1.1 Bestellingen
| Uitbreiding | Beschrijving | Complexiteit |
|-------------|--------------|--------------|
| **Bestelling-detailpagina** | Klik op een bestelling → detail met regels, klantgegevens, verzendstatus, notities | Laag |
| **Status wijzigen** | Dropdown of knoppen om status te zetten (open → verwerkt → verzonden → afgeleverd) | Laag |
| **Filter op status/datum** | Naast merk ook filter op status en datumreeks | Laag |
| **Export** | Bestellingen exporteren naar CSV/Excel voor boekhouding of verzending | Medium |
| **Zoeken** | Zoek op ordernummer, klantnaam of e-mail | Laag |

### 1.2 Klantenservice
| Uitbreiding | Beschrijving | Complexiteit |
|-------------|--------------|--------------|
| **Antwoord toevoegen** | Op ticket-detail: veld om als support een antwoord toe te voegen (mock: wordt in lijst opgenomen) | Laag |
| **Status wijzigen** | Op detail: open → beantwoord → afgehandeld zetten | Laag |
| **Filter op kanaal** | Filter: alleen Chat, WhatsApp of E-mail | Laag |
| **Filter op status** | Alleen open / beantwoord / afgehandeld | Laag |
| **Toewijzen aan medewerker** | Veld "Behandelaar" (mock gebruiker) voor verdeling | Medium |

### 1.3 Producten
| Uitbreiding | Beschrijving | Complexiteit |
|-------------|--------------|--------------|
| **Meer merken scrapen** | Producten van andere merken (Orange Fire, GAZ, etc.) toevoegen uit webshops | Medium |
| **Voorraad bijwerken** | Op productdetail: voorraad aanpasbaar (lokaal/mock) | Laag |
| **Zoeken** | Zoek op naam, SKU of merk | Laag |
| **Sorteren** | Sorteer op naam, prijs, merk | Laag |
| **Product koppelen aan bestelling** | In bestelling-detail: welke producten zaten in de order (mock regels) | Medium |

### 1.4 Merken & webshops
| Uitbreiding | Beschrijving | Complexiteit |
|-------------|--------------|--------------|
| **Merken-detail** | Klik op merk → pagina met korte info, webshop-link, (later) API-status | Laag |
| **API-koppeling placeholder** | Per merk: velden "API-type", "Status" (niet gekoppeld / gekoppeld) + knop "Sync" (nog geen echte sync) | Laag |
| **Statistiek per merk** | Aantal bestellingen, open tickets, producten per merk op merken-pagina of dashboard | Medium |

### 1.5 Dashboard (home)
| Uitbreiding | Beschrijving | Complexiteit |
|-------------|--------------|--------------|
| **Grafiek bestellingen** | Simpele lijn- of staafgrafiek: bestellingen per dag/week (mock data) | Medium |
| **Laatste activiteit** | Blok "Laatste bestellingen" en "Laatste tickets" met link naar detail | Laag |
| **Snelle acties** | Knoppen: "Nieuwe bestelling bekijken", "Open tickets", "Product toevoegen" (navigatie of modal) | Laag |

### 1.6 Instellingen
| Uitbreiding | Beschrijving | Complexiteit |
|-------------|--------------|--------------|
| **Profiel/account** | Naam, e-mail, wachtwoord wijzigen (mock of lokaal state) | Laag |
| **Notificaties** | Toggle: e-mail bij nieuwe bestelling / nieuw ticket (alleen voorkeur opslaan, geen echte mail) | Laag |
| **Merken beheren** | Lijst merken met naam, webshop-URL aanpasbaar (mock) | Medium |

### 1.7 Overzicht & Processen
| Uitbreiding | Beschrijving | Complexiteit |
|-------------|--------------|--------------|
| **Overzicht** | Eén "Overzicht"-pagina: KPI’s over alle merken (totaal orders, omzet, tickets, voorraad) + links naar de modules | Medium |
| **Processen** | Placeholder vervangen door "Geautomatiseerde processen": lijst met processen (bijv. "Bestelling sync", "Voorraad update") met status (actief/uit) en korte uitleg; later koppeling naar AI/workflows | Medium |

---

## 2. Nieuwe functies toevoegen

### 2.1 Rapportages & inzicht
| Functie | Beschrijving | Complexiteit |
|---------|--------------|--------------|
| **Rapportages-pagina** | Nieuw menu-item "Rapportages": omzet per merk, per periode; aantal bestellingen/tickets; eenvoudige tabellen en evt. grafieken (mock data) | Medium |
| **Export rapport** | Rapportage exporteren als PDF of CSV | Medium |

### 2.2 Voorraad
| Functie | Beschrijving | Complexiteit |
|---------|--------------|--------------|
| **Voorraad-overzicht** | Pagina "Voorraad": alle producten met voorraad, filter op merk, waarschuwing bij lage voorraad (drempel instelbaar) | Medium |
| **Voorraadbewegingen** | Log van in/uit (mock): datum, product, hoeveelheid, type (inkoop/verkoop/correctie) | Medium |

### 2.3 AI & automatisering (demo)
| Functie | Beschrijving | Complexiteit |
|---------|--------------|--------------|
| **AI-suggesties** | Op bestelling- of ticket-detail: knop "AI-suggestie" → mock antwoord (bijv. voorgestelde reactie of voorgestelde status) | Laag |
| **Slimme samenvatting** | Op dashboard: "AI-samenvatting van vandaag" (vaste tekst of eenvoudige mock) | Laag |
| **Processen-dashboard** | Uitbreiding Processen: per "proces" (sync bestellingen, sync voorraad, ticket-routing) een kaart met status en laatste run (mock) | Medium |

### 2.4 Gebruikers & rechten (demo)
| Functie | Beschrijving | Complexiteit |
|---------|--------------|--------------|
| **Meerdere gebruikers** | Mock: lijst gebruikers (naam, e-mail, rol) op Instellingen; geen echte login per user | Laag |
| **Rollen** | Rollen "Beheerder" en "Medewerker" met korte omschrijving; in UI alleen tonen (geen echte rechten) | Laag |

### 2.5 Integraties (placeholder)
| Functie | Beschrijving | Complexiteit |
|---------|--------------|--------------|
| **Webshop-koppelingen** | Pagina of sectie "Integraties": per merk/webshop een kaart met type (Shopify/WooCommerce/custom), status, laatste sync (alleen UI) | Laag |
| **Notificatiekanaal** | Instelling: "Notificaties naar Slack/Teams/Email" (alleen dropdown + opslaan voorkeur) | Laag |

### 2.6 Communicatie
| Functie | Beschrijving | Complexiteit |
|---------|--------------|--------------|
| **E-mailtemplate** | Bij ticket: keuze uit templates (bijv. "Retour instructie", "Levertijd") en voorvertoning (mock inhoud) | Medium |
| **Snel antwoord** | Bij ticket-detail: knoppen met korte standaardteksten die in het antwoordveld geplakt worden | Laag |

---

## 3. Prioritering (suggestie)

**Fase A – Snel zichtbaar (demo)**  
- Bestelling-detailpagina + status wijzigen  
- Antwoord toevoegen op ticket + status wijzigen  
- Filter op status (bestellingen + klantenservice)  
- Dashboard: laatste activiteit + snelle acties  
- AI-suggestie (mock) op ticket of bestelling  
- Instellingen: profiel/account (mock)  

**Fase B – Meer compleet**  
- Rapportages-pagina (mock data)  
- Voorraad-overzicht + lage-voorraad waarschuwing  
- Overzicht-pagina met KPI’s  
- Processen-pagina met proceskaarten  
- Merken-detail + API-placeholder  

**Fase C – Uitbreiding**  
- Export (bestellingen, rapportages)  
- Voorraadbewegingen  
- E-mailtemplates / snel antwoord  
- Gebruikers & rollen (mock)  
- Integraties-pagina  

---

## 4. Technische aantekeningen

- **Data**: Alles blijft mock/state tot er een backend of API is; nieuwe pagina’s gebruiken dezelfde patronen (bijv. `getTicketById`, `getBestellingById`).
- **Routing**: Detailpagina’s volgen het bestaande patroon: `/dashboard/[module]/[id]`.
- **UI**: Blijf de huidige sidebar, layout en Tailwind-styling gebruiken voor consistentie.
- **AI**: Voor demo volstaan vaste teksten of een eenvoudige "suggestie"-response; later te vervangen door echte API.

Dit plan kan per fase of per item worden opgepakt; de volgorde is flexibel aan te passen aan wat voor de demo het meest nodig is.

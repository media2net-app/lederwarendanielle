import type { MerkId } from "./merken";

export type TicketStatus = "open" | "beantwoord" | "afgehandeld";
export type TicketKanaal = "chat" | "whatsapp" | "email";

export interface GesprekBericht {
  datum: string; // ISO
  afzender: "klant" | "support";
  tekst: string;
}

export interface KlantenserviceTicket {
  id: string;
  merkId: MerkId;
  onderwerp: string;
  klantNaam: string;
  klantEmail: string;
  status: TicketStatus;
  datum: string;
  kanaal: TicketKanaal;
  berichten: GesprekBericht[];
}

export const MOCK_KLANTENSERVICE: KlantenserviceTicket[] = [
  {
    id: "t1",
    merkId: "orange-fire",
    onderwerp: "Vraag over levertijd",
    klantNaam: "Jan de Vries",
    klantEmail: "jan@example.nl",
    status: "afgehandeld",
    datum: "2024-02-22T09:00:00Z",
    kanaal: "email",
    berichten: [
      { datum: "2024-02-22T09:00:00Z", afzender: "klant", tekst: "Hallo, wanneer wordt mijn bestelling OF-2024-001 verzonden? Ik heb hem gisteren geplaatst." },
      { datum: "2024-02-22T10:15:00Z", afzender: "support", tekst: "Beste Jan, uw bestelling wordt vandaag verzonden. U ontvangt vanavond een track & trace mail." },
      { datum: "2024-02-22T18:30:00Z", afzender: "klant", tekst: "Track & trace ontvangen, bedankt!" },
    ],
  },
  {
    id: "t2",
    merkId: "leather-design",
    onderwerp: "Retour aanvraag",
    klantNaam: "Maria van Berg",
    klantEmail: "maria@example.nl",
    status: "open",
    datum: "2024-02-25T10:30:00Z",
    kanaal: "whatsapp",
    berichten: [
      { datum: "2024-02-25T10:30:00Z", afzender: "klant", tekst: "Ik wil graag de Boodschappen tas Effen retourneren – maat past niet. Hoe doe ik dat?" },
      { datum: "2024-02-25T11:00:00Z", afzender: "support", tekst: "Dag Maria, we sturen u zo ons retourformulier en een voorgefrankeerd label. Binnen 14 dagen kunt u het pakket aanbieden." },
    ],
  },
  {
    id: "t3",
    merkId: "ratpack",
    onderwerp: "Bestelling wijzigen",
    klantNaam: "Piet Jansen",
    klantEmail: "piet@example.nl",
    status: "beantwoord",
    datum: "2024-02-24T14:00:00Z",
    kanaal: "chat",
    berichten: [
      { datum: "2024-02-24T14:00:00Z", afzender: "klant", tekst: "Kan ik mijn bestelling RP-2024-018 nog wijzigen? Ik wil een andere kleur." },
      { datum: "2024-02-24T14:22:00Z", afzender: "support", tekst: "We hebben uw bestelling al in verwerking. Ik kijk of we de kleur nog kunnen aanpassen – geef even door welke kleur u wilt." },
      { datum: "2024-02-24T14:45:00Z", afzender: "klant", tekst: "Graag zwart in plaats van bruin." },
      { datum: "2024-02-24T15:10:00Z", afzender: "support", tekst: "Aangepast. U ontvangt een bevestigingsmail. Verzending blijft zoals gepland." },
    ],
  },
  {
    id: "t4",
    merkId: "gaz",
    onderwerp: "Product beschikbaarheid",
    klantNaam: "Lisa Bakker",
    klantEmail: "lisa@example.nl",
    status: "open",
    datum: "2024-02-25T08:15:00Z",
    kanaal: "email",
    berichten: [
      { datum: "2024-02-25T08:15:00Z", afzender: "klant", tekst: "Is de Riem Heren (GZ-RH-002) in maat 100 nog op voorraad? Ik zie op de site 'op aanvraag'." },
      { datum: "2024-02-25T09:30:00Z", afzender: "support", tekst: "Beste Lisa, we controleren de voorraad en laten u vandaag nog iets weten." },
    ],
  },
  {
    id: "t5",
    merkId: "shelby-brothers",
    onderwerp: "Kortingcode",
    klantNaam: "Tom Smit",
    klantEmail: "tom@example.nl",
    status: "afgehandeld",
    datum: "2024-02-20T11:00:00Z",
    kanaal: "chat",
    berichten: [
      { datum: "2024-02-20T11:00:00Z", afzender: "klant", tekst: "Mijn kortingcode WELKOM10 werkt niet bij afrekenen." },
      { datum: "2024-02-20T11:18:00Z", afzender: "support", tekst: "Die code is verlopen. U kunt WINTER25 gebruiken voor 25% korting tot eind februari." },
      { datum: "2024-02-20T11:25:00Z", afzender: "klant", tekst: "WINTER25 werkt, bedankt!" },
    ],
  },
  {
    id: "t6",
    merkId: "orange-fire",
    onderwerp: "Verkeerd artikel ontvangen",
    klantNaam: "Robin de Groot",
    klantEmail: "robin@example.nl",
    status: "open",
    datum: "2026-02-24T09:00:00Z",
    kanaal: "email",
    berichten: [
      { datum: "2026-02-24T09:00:00Z", afzender: "klant", tekst: "Ik heb bestelling OF-2026-101 ontvangen maar er zit een ander model tas in dan besteld. Graag omruilen." },
      { datum: "2026-02-24T11:30:00Z", afzender: "support", tekst: "Beste Robin, excuses voor het ongemak. We sturen u vandaag nog een retourlabel en het juiste artikel wordt direct meegestuurd." },
    ],
  },
  {
    id: "t7",
    merkId: "leather-design",
    onderwerp: "Maatadvies schoudertas",
    klantNaam: "Sophie van Dam",
    klantEmail: "sophie@example.nl",
    status: "beantwoord",
    datum: "2026-02-23T14:20:00Z",
    kanaal: "whatsapp",
    berichten: [
      { datum: "2026-02-23T14:20:00Z", afzender: "klant", tekst: "Welke maat schoudertas past bij een 13 inch laptop?" },
      { datum: "2026-02-23T14:45:00Z", afzender: "support", tekst: "Voor 13 inch raden we de medium (M) aan. Die heeft een speciaal laptopvak tot 13 inch." },
      { datum: "2026-02-23T15:00:00Z", afzender: "klant", tekst: "Top, die ga ik bestellen." },
    ],
  },
  {
    id: "t8",
    merkId: "gaz",
    onderwerp: "Levertijd riem",
    klantNaam: "Luuk Hendriks",
    klantEmail: "luuk@example.nl",
    status: "afgehandeld",
    datum: "2026-02-20T10:00:00Z",
    kanaal: "chat",
    berichten: [
      { datum: "2026-02-20T10:00:00Z", afzender: "klant", tekst: "Hoe lang duurt levering van GZ-2026-012?" },
      { datum: "2026-02-20T10:12:00Z", afzender: "support", tekst: "Normaal 2–3 werkdagen. Uw bestelling gaat vandaag mee." },
      { datum: "2026-02-22T09:00:00Z", afzender: "klant", tekst: "Ontvangen, dank!" },
    ],
  },
  {
    id: "t9",
    merkId: "ratpack",
    onderwerp: "Bulkbestelling groothandel",
    klantNaam: "Nina Vink",
    klantEmail: "nina@example.nl",
    status: "open",
    datum: "2026-02-25T08:30:00Z",
    kanaal: "email",
    berichten: [
      { datum: "2026-02-25T08:30:00Z", afzender: "klant", tekst: "Wij willen 50 stuks Ratpack messengertassen bestellen voor onze winkel. Kunnen jullie een offerte sturen?" },
      { datum: "2026-02-25T09:00:00Z", afzender: "support", tekst: "Dag Nina, we nemen contact op met onze B2B-afdeling. U ontvangt binnen 1 werkdag een offerte." },
    ],
  },
  {
    id: "t10",
    merkId: "shelby-brothers",
    onderwerp: "Personaliseer optie",
    klantNaam: "Daan Mulder",
    klantEmail: "daan@example.nl",
    status: "beantwoord",
    datum: "2026-02-22T16:00:00Z",
    kanaal: "whatsapp",
    berichten: [
      { datum: "2026-02-22T16:00:00Z", afzender: "klant", tekst: "Kan ik mijn bestelling SB-2026-015 laten graveren met bedrijfsnaam?" },
      { datum: "2026-02-22T16:30:00Z", afzender: "support", tekst: "Ja, dat kan. Stuur ons de gewenste tekst en we geven door aan de productie. Meerprijs €15." },
      { datum: "2026-02-22T17:00:00Z", afzender: "klant", tekst: "Prima, ik mail de tekst door." },
    ],
  },
  {
    id: "t11",
    merkId: "leather-design",
    onderwerp: "Voorraad Doctor's bag",
    klantNaam: "Eva Dekker",
    klantEmail: "eva@example.nl",
    status: "open",
    datum: "2026-02-25T11:15:00Z",
    kanaal: "chat",
    berichten: [
      { datum: "2026-02-25T11:15:00Z", afzender: "klant", tekst: "Wanneer komt de Doctor's bag Hunter weer op voorraad?" },
      { datum: "2026-02-25T11:45:00Z", afzender: "support", tekst: "We verwachten nieuwe voorraad eind volgende week. Ik zet u op de notificatielijst." },
    ],
  },
  {
    id: "t12",
    merkId: "orange-fire",
    onderwerp: "Factuur wijziging",
    klantNaam: "Ruben Visser",
    klantEmail: "ruben@example.nl",
    status: "afgehandeld",
    datum: "2026-02-21T09:00:00Z",
    kanaal: "email",
    berichten: [
      { datum: "2026-02-21T09:00:00Z", afzender: "klant", tekst: "Op onze factuur staat een verkeerd BTW-nummer. Kunnen jullie een creditnota sturen?" },
      { datum: "2026-02-21T10:00:00Z", afzender: "support", tekst: "We passen het aan en sturen een gecorrigeerde factuur. Creditnota volgt per mail." },
      { datum: "2026-02-21T14:00:00Z", afzender: "klant", tekst: "Ontvangen, dank u wel." },
    ],
  },
];

export function getKlantenserviceTickets(merkId?: MerkId, status?: TicketStatus): KlantenserviceTicket[] {
  let list = [...MOCK_KLANTENSERVICE];
  if (merkId) list = list.filter((t) => t.merkId === merkId);
  if (status) list = list.filter((t) => t.status === status);
  return list;
}

export function getTicketById(id: string): KlantenserviceTicket | undefined {
  return MOCK_KLANTENSERVICE.find((t) => t.id === id);
}

export function getOpenTicketsCount(): number {
  return MOCK_KLANTENSERVICE.filter((t) => t.status === "open").length;
}

export function getKanaalLabel(kanaal: TicketKanaal): string {
  switch (kanaal) {
    case "chat": return "Chat webshop";
    case "whatsapp": return "WhatsApp";
    case "email": return "E-mail";
    default: return kanaal;
  }
}

export function getLaatsteTickets(limit: number): KlantenserviceTicket[] {
  return [...MOCK_KLANTENSERVICE]
    .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())
    .slice(0, limit);
}

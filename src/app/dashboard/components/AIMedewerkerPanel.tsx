"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AIAction, AIChatResponse } from "@/lib/ai-actions";

type Message = { role: "user" | "assistant"; content: string };
type SpeechRecognitionEvent = Event & {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
const VOICE_DEBUG = true;

type OperatorSnapshot = {
  bestellingenVandaag: number;
  bestellingenDezeWeek: number;
  openTickets: number;
  openTaken: number;
  taken: Array<{
    id: string;
    titel: string;
    status: string;
    prioriteit: string;
    toegewezen_aan: string;
    deadline: string;
  }>;
  laatsteOrder: { ordernummer: string; klantNaam: string; status: string } | null;
  laatsteTicket: { onderwerp: string; status: string } | null;
  recenteOrders: Array<{ id: string; ordernummer: string; status: string }>;
  recenteTickets: Array<{ id: string; onderwerp: string; status: string }>;
};

function orderStatusLabel(status: string) {
  switch (status) {
    case "te_plukken":
      return "klaargezet";
    case "gepicked":
      return "verzameld";
    default:
      return String(status).replaceAll("_", " ");
  }
}

function ticketStatusLabel(status: string) {
  switch (status) {
    case "in_behandeling":
      return "in behandeling";
    case "wacht_op_klant":
      return "wacht op klant";
    case "opgelost":
      return "opgelost";
    default:
      return "open";
  }
}

function taskStatusLabel(status: string) {
  switch (status) {
    case "afgerond":
      return "afgerond";
    case "bezig":
      return "bezig";
    default:
      return "open";
  }
}

function isVoiceConfirm(text: string) {
  const normalized = text.toLowerCase().trim();
  return [
    "ja",
    "ja graag",
    "jazeker",
    "bevestig",
    "bevestigen",
    "voer uit",
    "doen",
    "ok",
    "oke",
    "akkoord",
  ].includes(normalized);
}

function isVoiceCancel(text: string) {
  const normalized = text.toLowerCase().trim();
  return [
    "nee",
    "nee dankje",
    "annuleer",
    "annuleren",
    "stop",
    "toch niet",
    "laat maar",
  ].includes(normalized);
}

function isVoiceHelp(text: string) {
  const normalized = text.toLowerCase().trim();
  return [
    "help",
    "wat kun je doen",
    "wat kan je doen",
    "wat kun jij doen",
    "welke commando's zijn er",
    "welke opdrachten zijn er",
    "hulp",
  ].includes(normalized);
}

function isVoiceRepeat(text: string) {
  const normalized = text.toLowerCase().trim();
  return [
    "herhaal",
    "zeg dat nog eens",
    "kun je dat herhalen",
    "nog een keer",
    "herhaal dat",
  ].includes(normalized);
}

function getVoiceHelpMessage() {
  return [
    "Ik kan je helpen met bestellingen, tickets, taken, notities, navigatie en dagrapportages.",
    "Zeg bijvoorbeeld: open bestellingen, lees de dagrapportage voor, zet deze order op verzonden, voeg een interne notitie toe aan dit ticket, of maak een taak aan voor Sanne.",
    "Als ik een actie voorstel, kun je daarna ja of nee zeggen om te bevestigen.",
  ].join(" ");
}

function isOperatorBriefingIntent(text: string) {
  const normalized = text.toLowerCase().trim();
  return [
    "dagstart",
    "operator update",
    "operator briefing",
    "prioriteiten",
    "wat moet ik vandaag doen",
    "waar moet ik op letten",
    "geef prioriteiten",
  ].includes(normalized);
}

function getOperatorQueueIntent(text: string): "support" | "operations" | "commercie" | null {
  const normalized = text.toLowerCase().trim();
  if (["werkqueue support", "support queue", "support update"].includes(normalized)) return "support";
  if (["werkqueue operations", "operations queue", "operations update", "werkqueue operatie"].includes(normalized)) return "operations";
  if (["werkqueue commercie", "commercie queue", "sales update"].includes(normalized)) return "commercie";
  return null;
}

function getDepartmentDashboardIntent(text: string): { label: string; path: string } | null {
  const normalized = text.toLowerCase().trim();
  if (["open support dashboard", "open support", "ga naar support"].includes(normalized)) {
    return { label: "support dashboard", path: "/dashboard/klantenservice" };
  }
  if (["open operations dashboard", "open operations", "ga naar operations"].includes(normalized)) {
    return { label: "operations dashboard", path: "/dashboard/magazijn/pick-pack" };
  }
  if (["open commercie dashboard", "open commercie", "ga naar commercie"].includes(normalized)) {
    return { label: "commercie dashboard", path: "/dashboard/rapportage" };
  }
  return null;
}

function isOperatorModeOn(text: string) {
  const normalized = text.toLowerCase().trim();
  return ["operator mode aan", "zet operator mode aan", "schakel operator mode aan"].includes(normalized);
}

function isOperatorModeOff(text: string) {
  const normalized = text.toLowerCase().trim();
  return ["operator mode uit", "zet operator mode uit", "schakel operator mode uit"].includes(normalized);
}

function getOperatorBriefing(pathname: string, snapshot: OperatorSnapshot | null) {
  if (!snapshot) {
    return "Operator update: ik haal de live werkqueue nu op. Probeer het over een paar seconden opnieuw.";
  }

  const urgenteTaken = snapshot.taken
    .filter((taak) => taak.prioriteit === "hoog" && taak.status !== "afgerond")
    .slice(0, 3);
  const laatsteOrder = snapshot.laatsteOrder;
  const laatsteTicket = snapshot.laatsteTicket;

  const focusArea = pathname.startsWith("/dashboard/bestellingen")
    ? "Je zit in bestellingen, dus focus op open orders en verzending."
    : pathname.startsWith("/dashboard/klantenservice")
      ? "Je zit in klantenservice, dus focus op open tickets en reacties."
      : pathname.startsWith("/dashboard/taken")
        ? "Je zit in taken, dus focus op afronden en prioriteren."
        : "Focus op de open acties in het platform.";

  const urgentSummary =
    urgenteTaken.length > 0
      ? `Top prioriteiten: ${urgenteTaken.map((taak) => taak.titel).join(", ")}.`
      : "Er staan nu geen hoge prioriteitstaken open.";

  return [
    `Operator update. Vandaag zijn er ${snapshot.bestellingenVandaag} bestellingen binnengekomen en deze week ${snapshot.bestellingenDezeWeek}.`,
    `Er staan ${snapshot.openTickets} open tickets en ${snapshot.openTaken} open taken.`,
    urgentSummary,
    laatsteOrder ? `Laatste order: ${laatsteOrder.ordernummer} voor ${laatsteOrder.klantNaam}.` : "",
    laatsteTicket ? `Laatste ticket: ${laatsteTicket.onderwerp}.` : "",
    focusArea,
  ]
    .filter(Boolean)
    .join(" ");
}

function getOperatorQueueBriefing(queue: "support" | "operations" | "commercie", snapshot: OperatorSnapshot | null) {
  if (!snapshot) {
    return "Werkqueue wordt geladen. Probeer het direct opnieuw.";
  }

  const tickets = snapshot.recenteTickets;
  const taken = snapshot.taken;
  const orders = snapshot.recenteOrders;

  if (queue === "support") {
    const openSupportTickets = tickets.filter(
      (ticket) => ticket.status === "open" || ticket.status === "in_behandeling" || ticket.status === "wacht_op_klant"
    );
    return [
      `Support werkqueue. Er zijn ${snapshot.openTickets} open tickets.`,
      openSupportTickets.length > 0
        ? `Recente focuspunten: ${openSupportTickets.map((ticket) => ticket.onderwerp).join(", ")}.`
        : "Er zijn geen directe support-escalaties in de recente tickets.",
      "Advies: werk eerst open klantvragen af en controleer daarna tickets die wachten op klantreactie.",
    ].join(" ");
  }

  if (queue === "operations") {
    const operationTasks = taken.filter((task) => task.status !== "afgerond").slice(0, 4);
    const openOrders = orders.filter((order) => order.status === "open" || order.status === "te_plukken").slice(0, 4);
    return [
      `Operations werkqueue. Er zijn ${operationTasks.length} directe operationele taken en ${openOrders.length} orders die aandacht vragen.`,
      operationTasks.length > 0 ? `Taken in focus: ${operationTasks.map((task) => task.titel).join(", ")}.` : "",
      openOrders.length > 0 ? `Orders in focus: ${openOrders.map((order) => order.ordernummer).join(", ")}.` : "",
      "Advies: stuur eerst op pick, pack en vervangingen met hoge prioriteit.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  const commercialTasks = taken.filter((task) => task.titel.toLowerCase().includes("offerte") || task.titel.toLowerCase().includes("rapport")).slice(0, 4);
  return [
    "Commercie werkqueue.",
    commercialTasks.length > 0
      ? `Acties in focus: ${commercialTasks.map((task) => task.titel).join(", ")}.`
      : "Er staan nu geen directe commerciële topacties in de open taken.",
    "Advies: focus op offertes, omzetkansen en opvolging van klanten met open vragen.",
  ].join(" ");
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export default function AIMedewerkerPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hallo, ik ben de AI Medewerker. Stel vragen over bestellingen, tickets, statussen of overzichten.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [pendingAction, setPendingAction] = useState<AIAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [operatorMode, setOperatorMode] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [operatorSnapshot, setOperatorSnapshot] = useState<OperatorSnapshot | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceModeRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingVoiceSendRef = useRef(false);
  const preventRestartRef = useRef(false);
  const loadingRef = useRef(false);
  const speakingRef = useRef(false);
  const voiceWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTranscriptRef = useRef("");
  const lastVoiceSubmissionRef = useRef<{ text: string; timestamp: number } | null>(null);
  const lastAssistantReplyRef = useRef("Hallo, ik ben de AI Medewerker. Stel vragen over bestellingen, tickets, statussen of overzichten.");

  const logVoice = (...args: unknown[]) => {
    if (!VOICE_DEBUG) return;
    console.log("[voice-debug]", ...args);
  };

  const speakIfNeeded = (text: string, fromVoice = false) => {
    if (fromVoice && voiceModeRef.current && text) {
      speakReply(text);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, pendingAction]);

  useEffect(() => {
    const lastAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant");
    if (lastAssistantMessage?.content) {
      lastAssistantReplyRef.current = lastAssistantMessage.content;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (voiceWatchdogRef.current) clearTimeout(voiceWatchdogRef.current);
    };
  }, []);

  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    speakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/operator/snapshot")
      .then(async (res) => {
        const payload = (await res.json()) as OperatorSnapshot;
        if (mounted) setOperatorSnapshot(payload);
      })
      .catch(() => {
        if (mounted) setOperatorSnapshot(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const sortedVoices = voices
        .filter((voice) => voice.lang.toLowerCase().startsWith("nl"))
        .sort((a, b) => a.name.localeCompare(b.name));

      setAvailableVoices(sortedVoices);
      setSelectedVoiceURI((current) => {
        if (current && sortedVoices.some((voice) => voice.voiceURI === current)) {
          return current;
        }
        const preferredGoogleDutchVoice = sortedVoices.find(
          (voice) => voice.name === "Google Nederlands" && voice.lang === "nl-NL"
        );
        if (preferredGoogleDutchVoice) {
          return preferredGoogleDutchVoice.voiceURI;
        }
        return sortedVoices[0]?.voiceURI ?? "";
      });
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const stopRecognition = () => {
    logVoice("stopRecognition called", {
      hasRecognition: Boolean(recognitionRef.current),
      pendingVoiceSend: pendingVoiceSendRef.current,
      preventRestart: preventRestartRef.current,
    });
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    preventRestartRef.current = true;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    if (voiceWatchdogRef.current) {
      clearTimeout(voiceWatchdogRef.current);
      voiceWatchdogRef.current = null;
    }
  };

  const speakReply = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    logVoice("speakReply", { textLength: text.length });
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = availableVoices.find((voice) => voice.voiceURI === selectedVoiceURI);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = "nl-NL";
    }
    utterance.rate = 1;
    utterance.onstart = () => {
      logVoice("tts onstart");
      setIsSpeaking(true);
      stopRecognition();
    };
    utterance.onend = () => {
      logVoice("tts onend", { voiceMode: voiceModeRef.current });
      setIsSpeaking(false);
      setLiveTranscript("");
    };
    utterance.onerror = () => {
      logVoice("tts onerror", { voiceMode: voiceModeRef.current });
      setIsSpeaking(false);
      setLiveTranscript("");
    };
    window.speechSynthesis.speak(utterance);
  };

  const executePendingAction = async (options?: { fromVoice?: boolean }) => {
    if (!pendingAction || actionLoading) return false;
    const fromVoice = options?.fromVoice ?? false;
    setActionLoading(true);

    try {
      let confirmationMessage = "";

      if (pendingAction.type === "update_order_status") {
        const statusRes = await fetch(`/api/orders/${pendingAction.orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: pendingAction.newStatus }),
        });
        if (!statusRes.ok) throw new Error("Orderstatus bijwerken mislukt.");
        await fetch(`/api/orders/${pendingAction.orderId}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actor: "AI Medewerker",
            action: `Status gewijzigd via AI naar ${orderStatusLabel(pendingAction.newStatus)}`,
          }),
        });
        confirmationMessage = `Uitgevoerd: ${pendingAction.orderNumber} is nu ${orderStatusLabel(pendingAction.newStatus)}.`;
        setSuggestedFollowUps(["open bestellingen", "prioriteiten", "voeg een interne notitie toe aan deze order"]);
      } else if (pendingAction.type === "update_ticket_status") {
        const statusRes = await fetch(`/api/support/tickets/${pendingAction.ticketId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: pendingAction.newStatus }),
        });
        if (!statusRes.ok) throw new Error("Ticketstatus bijwerken mislukt.");
        confirmationMessage = `Uitgevoerd: ticket "${pendingAction.subject}" staat nu op ${ticketStatusLabel(pendingAction.newStatus)}.`;
        setSuggestedFollowUps(["werkqueue support", "open support dashboard", "voeg een interne notitie toe aan dit ticket"]);
      } else if (pendingAction.type === "update_task_status") {
        const statusRes = await fetch(`/api/tasks/${pendingAction.taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: pendingAction.newStatus }),
        });
        if (!statusRes.ok) throw new Error("Taakstatus bijwerken mislukt.");
        confirmationMessage = `Uitgevoerd: taak "${pendingAction.title}" staat nu op ${taskStatusLabel(pendingAction.newStatus)}.`;
        setSuggestedFollowUps(["prioriteiten", "open taken", "werkqueue operations"]);
      } else if (pendingAction.type === "create_task") {
        const createRes = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titel: pendingAction.title,
            status: "open",
            merkId: pendingAction.merkId,
            toegewezenAan: pendingAction.assignedTo,
            deadline: pendingAction.deadline,
            prioriteit: pendingAction.priority,
          }),
        });
        if (!createRes.ok) throw new Error("Taak aanmaken mislukt.");
        confirmationMessage = `Uitgevoerd: taak "${pendingAction.title}" is aangemaakt voor ${pendingAction.assignedTo}.`;
        setSuggestedFollowUps(["open taken", "prioriteiten", "werkqueue operations"]);
      } else if (pendingAction.type === "add_internal_note") {
        if (pendingAction.targetType === "order") {
          const noteRes = await fetch(`/api/orders/${pendingAction.targetId}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              actor: "AI Medewerker",
              action: `Interne notitie: ${pendingAction.note}`,
            }),
          });
          if (!noteRes.ok) throw new Error("Ordernotitie opslaan mislukt.");
        } else {
          const noteRes = await fetch(`/api/support/tickets/${pendingAction.targetId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              afzender: "support",
              tekst: `Interne notitie: ${pendingAction.note}`,
            }),
          });
          if (!noteRes.ok) throw new Error("Ticketnotitie opslaan mislukt.");
        }
        confirmationMessage = `Uitgevoerd: interne notitie toegevoegd aan ${pendingAction.targetLabel}.`;
        setSuggestedFollowUps(["herhaal", "prioriteiten"]);
      } else {
        router.push(pendingAction.path);
        setOpen(false);
        confirmationMessage = `Ik open nu ${pendingAction.label}.`;
        setSuggestedFollowUps(["dagstart", "prioriteiten", "help"]);
      }

      if (fromVoice && operatorMode) {
        confirmationMessage += " Wil je dat ik nog iets anders regel?";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: confirmationMessage }]);
      setPendingAction(null);
      speakIfNeeded(confirmationMessage, fromVoice);
      return true;
    } catch {
      setError("Kon de AI-actie niet uitvoeren.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const cancelPendingAction = (options?: { fromVoice?: boolean }) => {
    if (!pendingAction || actionLoading) return false;
    const fromVoice = options?.fromVoice ?? false;
    const message = `Actie geannuleerd: ${pendingAction.summary}.`;
    setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    setPendingAction(null);
    setSuggestedFollowUps(["prioriteiten", "help"]);
    speakIfNeeded(message, fromVoice);
    return true;
  };

  const handleLocalVoiceIntent = (text: string, fromVoice: boolean) => {
    if (isOperatorModeOn(text)) {
      const message = "Operator mode staat nu aan. Ik ga proactiever sturen op prioriteiten en vervolgacties.";
      setOperatorMode(true);
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      speakIfNeeded(message, fromVoice);
      return true;
    }

    if (isOperatorModeOff(text)) {
      const message = "Operator mode staat nu uit. Ik reageer weer meer op losse opdrachten.";
      setOperatorMode(false);
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      speakIfNeeded(message, fromVoice);
      return true;
    }

    if (operatorMode && isOperatorBriefingIntent(text)) {
      const message = getOperatorBriefing(pathname, operatorSnapshot);
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      setSuggestedFollowUps(["werkqueue support", "werkqueue operations", "open bestellingen"]);
      speakIfNeeded(message, fromVoice);
      return true;
    }

    const queueIntent = getOperatorQueueIntent(text);
    if (operatorMode && queueIntent) {
      const message = getOperatorQueueBriefing(queueIntent, operatorSnapshot);
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      setSuggestedFollowUps(
        queueIntent === "support"
          ? ["open support dashboard", "open tickets", "prioriteiten"]
          : queueIntent === "operations"
            ? ["open operations dashboard", "open bestellingen", "prioriteiten"]
            : ["open commercie dashboard", "lees de dagrapportage voor", "prioriteiten"]
      );
      speakIfNeeded(message, fromVoice);
      return true;
    }

    const departmentDashboardIntent = getDepartmentDashboardIntent(text);
    if (operatorMode && departmentDashboardIntent) {
      router.push(departmentDashboardIntent.path);
      setOpen(false);
      const message = `Ik open nu het ${departmentDashboardIntent.label}.`;
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      setSuggestedFollowUps(["dagstart", "prioriteiten", "help"]);
      speakIfNeeded(message, fromVoice);
      return true;
    }

    if (isVoiceHelp(text)) {
      const message = getVoiceHelpMessage();
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      setSuggestedFollowUps(["dagstart", "werkqueue support", "open operations dashboard"]);
      speakIfNeeded(message, fromVoice);
      return true;
    }

    if (isVoiceRepeat(text)) {
      const message = lastAssistantReplyRef.current || "Ik heb nog geen antwoord om te herhalen.";
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      speakIfNeeded(message, fromVoice);
      return true;
    }

    return false;
  };

  const send = async (rawInput?: string) => {
    const text = (rawInput ?? input).trim();
    if (!text || loading) return;

    if (handleLocalVoiceIntent(text, Boolean(rawInput))) {
      setInput("");
      setLiveTranscript("");
      return;
    }

    if (pendingAction && isVoiceConfirm(text)) {
      void executePendingAction({ fromVoice: Boolean(rawInput) });
      setInput("");
      setLiveTranscript("");
      return;
    }

    if (pendingAction && isVoiceCancel(text)) {
      cancelPendingAction({ fromVoice: Boolean(rawInput) });
      setInput("");
      setLiveTranscript("");
      return;
    }

    if (rawInput) {
      const lastVoiceSubmission = lastVoiceSubmissionRef.current;
      const now = Date.now();
      if (lastVoiceSubmission && lastVoiceSubmission.text === text && now - lastVoiceSubmission.timestamp < 4000) {
        logVoice("duplicate voice send blocked", { text });
        return;
      }
      lastVoiceSubmissionRef.current = { text, timestamp: now };
    }
    logVoice("send called", { fromVoice: Boolean(rawInput), text });

    setInput("");
    setLiveTranscript("");
    pendingVoiceSendRef.current = false;
    setPendingAction(null);
    setSuggestedFollowUps([]);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          currentPath: pathname,
          channel: rawInput ? "voice" : "chat",
          operatorMode,
        }),
      });
      const data = (await res.json()) as AIChatResponse & { error?: string };
      logVoice("ai response", { ok: res.ok, status: res.status, hasReply: Boolean(data?.reply) });

      if (!res.ok) {
        setError(data.error ?? "Er is iets misgegaan.");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      const reply = String(data.reply ?? "").trim();
      setPendingAction(data.action ?? null);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (voiceModeRef.current && reply) {
        speakReply(reply);
        return;
      }
    } catch {
      logVoice("ai request failed");
      setError("Kon geen verbinding maken. Probeer het opnieuw.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (loading || isListening || isSpeaking) return;
    logVoice("startVoiceInput called", { loading, isListening, isSpeaking, voiceMode: voiceModeRef.current });
    preventRestartRef.current = false;
    setError(null);

    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      logVoice("speechRecognition not supported");
      setError("Spraakinvoer wordt niet ondersteund in deze browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "nl-NL";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";
      for (let i = 0; i < event.results.length; i += 1) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += chunk;
        } else {
          interim += chunk;
        }
      }
      const shown = `${finalText}${interim}`.trimStart();
      latestTranscriptRef.current = shown;
      logVoice("recognition onresult", {
        shown,
        finalText,
        resultsLength: event.results.length,
      });
      setInput(shown);
      setLiveTranscript(shown);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (shown.trim() && !pendingVoiceSendRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          const finalSpokenText = shown.trim();
          if (!finalSpokenText || pendingVoiceSendRef.current) return;
          logVoice("silence timer send", { finalSpokenText });
          pendingVoiceSendRef.current = true;
          latestTranscriptRef.current = "";
          stopRecognition();
          void send(finalSpokenText);
        }, 700);
      }
      if (voiceWatchdogRef.current) clearTimeout(voiceWatchdogRef.current);
      voiceWatchdogRef.current = setTimeout(() => {
        if (voiceModeRef.current && isListening) {
          logVoice("watchdog stop after inactivity");
          stopRecognition();
          setLiveTranscript("");
        }
      }, 8000);
    };

    recognition.onerror = (event) => {
      const code = event.error ?? "unknown";
      logVoice("recognition onerror", { code, preventRestart: preventRestartRef.current });
      if (code === "aborted" || code === "no-speech") {
        return;
      }

      if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Microfoon toestemming geweigerd.");
      } else if (code === "audio-capture") {
        setError("Geen microfoon gevonden of microfoon is niet beschikbaar.");
      } else if (code === "network") {
        setError("Spraakherkenning tijdelijk onderbroken. Tik opnieuw op de orb.");
        stopRecognition();
        return;
      } else {
        setError(`Spraakopname is mislukt (${code}).`);
      }

      stopRecognition();
      setVoiceMode(false);
    };

    recognition.onend = () => {
      logVoice("recognition onend", {
        voiceMode: voiceModeRef.current,
        loading: loadingRef.current,
        speaking: speakingRef.current,
        preventRestart: preventRestartRef.current,
      });
      if (voiceWatchdogRef.current) {
        clearTimeout(voiceWatchdogRef.current);
        voiceWatchdogRef.current = null;
      }
      const buffered = latestTranscriptRef.current.trim();
      if (buffered && !pendingVoiceSendRef.current && !loadingRef.current && !speakingRef.current) {
        logVoice("onend buffered send", { buffered });
        pendingVoiceSendRef.current = true;
        latestTranscriptRef.current = "";
        void send(buffered);
      }
      setIsListening(false);
      recognitionRef.current = null;
      preventRestartRef.current = false;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    latestTranscriptRef.current = "";
    try {
      logVoice("recognition start()");
      recognition.start();
      if (voiceWatchdogRef.current) clearTimeout(voiceWatchdogRef.current);
      voiceWatchdogRef.current = setTimeout(() => {
        if (voiceModeRef.current && !loadingRef.current && !speakingRef.current) {
          logVoice("watchdog stop: no recognition events");
          stopRecognition();
          setLiveTranscript("");
        }
      }, 8000);
    } catch {
      logVoice("recognition start() failed");
      setIsListening(false);
      recognitionRef.current = null;
      setError("Kon microfoon niet starten. Probeer opnieuw.");
    }
  };

  const startVoiceMode = () => {
    logVoice("startVoiceMode");
    voiceModeRef.current = true;
    setVoiceMode(true);
    setLiveTranscript("");
    pendingVoiceSendRef.current = false;
    lastVoiceSubmissionRef.current = null;
    preventRestartRef.current = false;
    startVoiceInput();
  };

  const stopVoiceMode = () => {
    logVoice("stopVoiceMode");
    voiceModeRef.current = false;
    setVoiceMode(false);
    setLiveTranscript("");
    pendingVoiceSendRef.current = false;
    lastVoiceSubmissionRef.current = null;
    preventRestartRef.current = true;
    stopRecognition();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleVoiceOrbClick = () => {
    if (loading || isSpeaking) return;
    if (isListening) {
      stopRecognition();
      setLiveTranscript("");
      return;
    }
    setLiveTranscript("");
    pendingVoiceSendRef.current = false;
    lastVoiceSubmissionRef.current = null;
    preventRestartRef.current = false;
    setError(null);
    startVoiceInput();
  };

  const voiceStatusText = isListening
    ? liveTranscript
      ? "Ik hoor je, praat gerust verder"
      : "Ik luister..."
    : loading
      ? "Ik verwerk je vraag..."
      : isSpeaking
        ? "Ik geef antwoord..."
        : "Tik op de orb om te spreken.";

  const voiceVisualState = isSpeaking
    ? "speaking"
    : loading
      ? "thinking"
      : isListening
        ? liveTranscript
          ? "listening-active"
          : "listening"
        : "idle";

  const renderMessages = (
    userBubbleClass: string,
    assistantBubbleClass: string,
    loadingBubbleClass: string,
    errorBubbleClass: string,
    actionCardClass: string
  ) => (
    <>
      {messages.map((m, i) => (
        <div
          key={i}
          className={`rounded-lg px-3 py-2 text-sm ${m.role === "user" ? userBubbleClass : assistantBubbleClass}`}
        >
          {m.content}
        </div>
      ))}
      {loading && (
        <div className={`rounded-lg px-3 py-2 text-sm ${loadingBubbleClass}`}>Bezig…</div>
      )}
      {pendingAction && (
        <div className={`rounded-2xl border px-4 py-4 text-sm ${actionCardClass}`}>
          <p className="font-semibold">Actie klaar om uit te voeren</p>
          <p className="mt-1 opacity-90">{pendingAction.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void executePendingAction()}
              disabled={actionLoading}
              className="ui-btn-primary rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-50"
            >
              {actionLoading ? "Bezig..." : "Bevestigen"}
            </button>
            <button
              type="button"
              onClick={() => cancelPendingAction()}
              disabled={actionLoading}
              className="ui-btn-secondary rounded-lg border border-current/20 px-3 py-2 text-xs font-medium hover:bg-white/10 disabled:opacity-50"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className={`rounded-lg px-3 py-2 text-sm ${errorBubbleClass}`}>{error}</div>
      )}
    </>
  );

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 md:bottom-6 md:right-6">
        <button
          type="button"
          onClick={voiceMode ? stopVoiceMode : startVoiceMode}
          className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-white/40 md:h-14 md:w-14 ${
            voiceMode ? "bg-rose-600 hover:bg-rose-500" : "bg-white/15 hover:bg-white/25"
          }`}
          title={voiceMode ? "Stop voice gesprek" : "Start voice gesprek"}
          aria-label={voiceMode ? "Stop voice gesprek" : "Start voice gesprek"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v11m0 0a3 3 0 003-3V6a3 3 0 10-6 0v3a3 3 0 003 3zm-7 0a7 7 0 0014 0m-7 7v4m-4 0h8" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-white/40 md:h-14 md:w-14"
          title={open ? "Sluit chat" : "Open chat"}
          aria-label={open ? "Sluit chat" : "Open chat"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-2 bottom-20 top-16 z-50 flex flex-col rounded-2xl border border-white/15 bg-[#10141c]/95 shadow-2xl backdrop-blur-xl md:inset-x-auto md:bottom-24 md:right-6 md:top-auto md:w-full md:max-w-md">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="font-semibold text-gray-100">AI Medewerker</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-gray-100"
              aria-label="Sluiten"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto space-y-3 p-4">
            {renderMessages(
              "ml-8 border border-white/15 bg-white/10 text-gray-100",
              "mr-8 border border-white/10 bg-black/35 text-gray-200",
              "mr-8 border border-white/10 bg-black/35 text-gray-400",
              "border border-rose-400/30 bg-rose-500/10 text-rose-100",
              "border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="border-t border-white/10 p-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stel een vraag…"
                className="ui-input flex-1 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="ui-btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                Verstuur
              </button>
            </div>
          </form>
        </div>
      )}

      {voiceMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md md:p-6">
          <div className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 text-white shadow-2xl">
            <div className="border-b border-white/10 px-5 py-5 md:px-8 md:py-6">
              <div className="flex w-full justify-end">
                <button
                  type="button"
                  onClick={stopVoiceMode}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  Sluiten
                </button>
              </div>

              <div className="flex flex-col items-center py-6 md:py-8">
                <button
                  type="button"
                  onClick={handleVoiceOrbClick}
                  disabled={loading || isSpeaking}
                  className={`voice-orb voice-orb--${voiceVisualState} ${loading || isSpeaking ? "cursor-default" : "cursor-pointer"}`}
                  aria-label={isListening ? "Stop luisteren" : "Start luisteren"}
                  title={isListening ? "Stop luisteren" : "Start luisteren"}
                >
                  <div className="voice-orb__glow" />
                  <div className="voice-orb__halo" />
                  <div className="voice-orb__core" />
                </button>
              </div>

              <div className="mx-auto w-full max-w-xl text-center">
                {availableVoices.length > 0 && (
                  <div className="mb-5 text-left">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-100">
                        Operator mode {operatorMode ? "aan" : "uit"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOperatorMode((current) => !current)}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/10"
                      >
                        {operatorMode ? "Schakel uit" : "Schakel aan"}
                      </button>
                    </div>
                    <label htmlFor="voice-select" className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/60">
                      Stem
                    </label>
                    <select
                      id="voice-select"
                      value={selectedVoiceURI}
                      onChange={(e) => setSelectedVoiceURI(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/15"
                      disabled={isSpeaking}
                    >
                      {availableVoices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI} className="text-gray-900">
                          {voice.name} ({voice.lang}){voice.default ? " - standaard" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <p className="text-lg font-semibold text-white md:text-xl">{voiceStatusText}</p>
                <p className="mt-3 min-h-[56px] text-sm leading-6 text-white/70 md:min-h-[64px] md:text-base">
                  {liveTranscript || (error ? "Er ging iets mis met de spraakmodus." : "Na elk antwoord tik je opnieuw op de orb om een volgende vraag te stellen.")}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {["Dagstart", "Prioriteiten", "Help", "Herhaal"].map((label) => {
                    const promptMap: Record<string, string> = {
                      Dagstart: "dagstart",
                      Prioriteiten: "prioriteiten",
                      Help: "wat kun je doen",
                      Herhaal: "herhaal",
                    };
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          const prompt = promptMap[label];
                          void send(prompt);
                        }}
                        disabled={loading || isSpeaking || isListening}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10 disabled:opacity-40"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {operatorMode && suggestedFollowUps.length > 0 && !pendingAction && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/50">
                      Volgende operator-stappen
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestedFollowUps.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => void send(prompt)}
                          disabled={loading || isSpeaking || isListening}
                          className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-100 transition hover:bg-emerald-500/20 disabled:opacity-40"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-5 flex items-center justify-center gap-3 text-sm text-white/70">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${isListening ? "bg-emerald-400" : isSpeaking ? "bg-sky-400" : loading ? "bg-amber-300" : "bg-white/35"}`} />
                  <span>{isListening ? "Microfoon luistert" : isSpeaking ? "AI spreekt" : loading ? "AI denkt na" : "Stand-by"}</span>
                </div>
              </div>

              {error && <p className="mx-auto mt-5 w-full max-w-xl rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
            </div>

            <div className="min-h-0 flex-1 px-3 pb-3 pt-3 md:px-5 md:pb-5">
              <div
                ref={scrollRef}
                className="h-full overflow-y-auto rounded-[1.5rem] border border-white/10 bg-black/25 p-4 space-y-3"
              >
                {renderMessages(
                  "ml-10 bg-white text-gray-900",
                  "mr-10 bg-white/10 text-white",
                  "mr-10 bg-white/10 text-white/70",
                  "border border-red-400/30 bg-red-500/10 text-red-100",
                  "border border-emerald-400/30 bg-emerald-500/10 text-emerald-50"
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

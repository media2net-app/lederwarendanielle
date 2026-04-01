"use client";

import type { BestellingStatus } from "@/lib/mock-bestellingen";
import type { TicketStatus, GesprekBericht } from "@/lib/mock-klantenservice";
import type { TaakStatus } from "@/lib/dashboard-data";
import type { PipelineStage } from "@/lib/mock-pipeline";
import type { ChatMessage } from "@/lib/mock-chat";

const KEYS = {
  orderStatuses: "demo_order_statuses",
  ticketUpdates: "demo_ticket_updates",
  taskStatuses: "demo_task_statuses",
  pipelineStages: "demo_pipeline_stages",
  orderEvents: "demo_order_events",
  demoMode: "demo_mode",
  chatMessages: "demo_chat_messages",
  chatReads: "demo_chat_reads",
};

export interface DemoOrderEvent {
  at: string;
  actor: string;
  action: string;
}

interface TicketUpdate {
  status?: TicketStatus;
  addedMessages?: GesprekBericht[];
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getOrderStatusMap(): Record<string, BestellingStatus> {
  return safeRead(KEYS.orderStatuses, {} as Record<string, BestellingStatus>);
}

export function setOrderStatus(orderId: string, status: BestellingStatus) {
  const map = getOrderStatusMap();
  map[orderId] = status;
  safeWrite(KEYS.orderStatuses, map);
}

export function getOrderEvents(orderId: string): DemoOrderEvent[] {
  const map = safeRead(KEYS.orderEvents, {} as Record<string, DemoOrderEvent[]>);
  return map[orderId] ?? [];
}

export function addOrderEvent(orderId: string, action: string, actor = "Demo gebruiker") {
  const map = safeRead(KEYS.orderEvents, {} as Record<string, DemoOrderEvent[]>);
  const list = map[orderId] ?? [];
  list.unshift({ at: new Date().toISOString(), actor, action });
  map[orderId] = list.slice(0, 20);
  safeWrite(KEYS.orderEvents, map);
}

export function getTicketUpdateMap(): Record<string, TicketUpdate> {
  return safeRead(KEYS.ticketUpdates, {} as Record<string, TicketUpdate>);
}

export function setTicketStatus(ticketId: string, status: TicketStatus) {
  const map = getTicketUpdateMap();
  map[ticketId] = { ...(map[ticketId] ?? {}), status };
  safeWrite(KEYS.ticketUpdates, map);
}

export function addTicketMessage(ticketId: string, message: GesprekBericht) {
  const map = getTicketUpdateMap();
  const cur = map[ticketId] ?? {};
  const added = cur.addedMessages ?? [];
  map[ticketId] = { ...cur, addedMessages: [...added, message] };
  safeWrite(KEYS.ticketUpdates, map);
}

export function getTaskStatusMap(): Record<string, TaakStatus> {
  return safeRead(KEYS.taskStatuses, {} as Record<string, TaakStatus>);
}

export function setTaskStatus(taskId: string, status: TaakStatus) {
  const map = getTaskStatusMap();
  map[taskId] = status;
  safeWrite(KEYS.taskStatuses, map);
}

export function getPipelineStageMap(): Record<string, PipelineStage> {
  return safeRead(KEYS.pipelineStages, {} as Record<string, PipelineStage>);
}

export function setPipelineStage(leadId: string, stage: PipelineStage) {
  const map = getPipelineStageMap();
  map[leadId] = stage;
  safeWrite(KEYS.pipelineStages, map);
}

export function getDemoMode(): boolean {
  return safeRead(KEYS.demoMode, true);
}

export function setDemoMode(enabled: boolean) {
  safeWrite(KEYS.demoMode, enabled);
}

export function getChatMessageMap(): Record<string, ChatMessage[]> {
  return safeRead(KEYS.chatMessages, {} as Record<string, ChatMessage[]>);
}

export function getConversationMessages(conversationId: string, seed: ChatMessage[] = []): ChatMessage[] {
  const map = getChatMessageMap();
  if (!map[conversationId]) {
    map[conversationId] = [...seed];
    safeWrite(KEYS.chatMessages, map);
  }
  return map[conversationId] ?? [];
}

export function appendConversationMessage(conversationId: string, message: ChatMessage) {
  const map = getChatMessageMap();
  const list = map[conversationId] ?? [];
  map[conversationId] = [...list, message];
  safeWrite(KEYS.chatMessages, map);
}

export function getChatReadMap(): Record<string, string> {
  return safeRead(KEYS.chatReads, {} as Record<string, string>);
}

export function markConversationRead(conversationId: string, atIso: string) {
  const map = getChatReadMap();
  map[conversationId] = atIso;
  safeWrite(KEYS.chatReads, map);
}

export function resetDemoState() {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => {
    if (k !== KEYS.demoMode) window.localStorage.removeItem(k);
  });
}

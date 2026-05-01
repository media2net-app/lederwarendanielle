import type { MerkId } from "@/lib/merken";
import type { BestellingStatus } from "@/lib/orders-shared";
import type { TicketStatus } from "@/lib/support-shared";
import type { TaakStatus } from "@/lib/tasks-shared";

export type AITaskPriority = "hoog" | "normaal" | "laag";

export type AIAction =
  | {
      type: "update_order_status";
      orderId: string;
      orderNumber: string;
      newStatus: BestellingStatus;
      summary: string;
    }
  | {
      type: "update_ticket_status";
      ticketId: string;
      subject: string;
      newStatus: TicketStatus;
      summary: string;
    }
  | {
      type: "update_task_status";
      taskId: string;
      title: string;
      newStatus: TaakStatus;
      summary: string;
    }
  | {
      type: "create_task";
      title: string;
      assignedTo: string;
      priority: AITaskPriority;
      deadline: string;
      merkId: MerkId | null;
      summary: string;
    }
  | {
      type: "add_internal_note";
      targetType: "order" | "ticket";
      targetId: string;
      targetLabel: string;
      note: string;
      summary: string;
    }
  | {
      type: "navigate";
      path: string;
      label: string;
      summary: string;
    };

export interface AIChatResponse {
  reply: string;
  action?: AIAction;
}

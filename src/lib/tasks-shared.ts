export type TaakStatus = "open" | "bezig" | "afgerond";
export type TaakPrioriteit = "hoog" | "normaal" | "laag";

export interface TaakSubtaak {
  id: string;
  titel: string;
  status: TaakStatus;
  deadline: string;
}

export interface Taak {
  id: string;
  titel: string;
  status: TaakStatus;
  merkId: string | null;
  toegewezenAan: string;
  deadline: string;
  prioriteit: TaakPrioriteit;
  subtasks: TaakSubtaak[];
}

export interface DbTaskRow {
  id: string;
  titel: string;
  status: TaakStatus;
  merk_id: string | null;
  toegewezen_aan: string;
  deadline: string;
  prioriteit: TaakPrioriteit;
  subtasks: unknown;
}

function normalizeSubtask(subtask: unknown, index: number): TaakSubtaak {
  const source = (subtask ?? {}) as Partial<TaakSubtaak>;
  return {
    id: source.id || `sub-${index + 1}`,
    titel: source.titel || `Subtaak ${index + 1}`,
    status: source.status || "open",
    deadline: source.deadline || new Date().toISOString().slice(0, 10),
  };
}

export function mapDbTask(row: DbTaskRow): Taak {
  const rawSubtasks = Array.isArray(row.subtasks) ? row.subtasks : [];
  return {
    id: row.id,
    titel: row.titel,
    status: row.status,
    merkId: row.merk_id,
    toegewezenAan: row.toegewezen_aan,
    deadline: row.deadline,
    prioriteit: row.prioriteit,
    subtasks: rawSubtasks.map((subtask, index) => normalizeSubtask(subtask, index)),
  };
}

import type {
  Agent,
  Approval,
  ActivityEvent,
  ChatMessage,
  KpiSummary,
  OfficeSnapshot,
  Project,
  Task,
} from './domain.js';

/**
 * Sự kiện thời gian thực (WebSocket) – backend phát, frontend áp dụng lên store duy nhất.
 * Tên sự kiện là định danh kỹ thuật, không dịch.
 */
export type OfficeEvent =
  | { type: 'snapshot'; snapshot: OfficeSnapshot }
  | { type: 'task.upserted'; task: Task; revision: number }
  | { type: 'task.removed'; taskId: string; revision: number }
  | { type: 'agent.upserted'; agent: Agent; revision: number }
  | { type: 'approval.upserted'; approval: Approval; revision: number }
  | { type: 'activity.created'; activity: ActivityEvent; revision: number }
  | { type: 'project.upserted'; project: Project; revision: number }
  | { type: 'kpi.updated'; kpis: KpiSummary; revision: number }
  | { type: 'message.created'; message: ChatMessage; revision: number };

export const SOCKET_EVENT_NAME = 'office:event';
export const SOCKET_HELLO_NAME = 'office:hello';

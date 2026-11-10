import type {
  Agent,
  Approval,
  ChatMessage,
  Task,
  TaskPriority,
  TaskStatus,
  OfficeSnapshot,
} from './domain.js';

/** Hợp đồng REST – đường dẫn là định danh kỹ thuật, không dịch. */
export const API_ROUTES = {
  health: '/api/health',
  state: '/api/state',
  agents: '/api/agents',
  tasks: '/api/tasks',
  approvals: '/api/approvals',
  activities: '/api/activities',
  projects: '/api/projects',
  connectors: '/api/connectors',
  kpis: '/api/kpis',
  ceoRequests: '/api/ceo/requests',
  messages: (agentId: string) => `/api/agents/${agentId}/messages`,
  agentPause: (agentId: string) => `/api/agents/${agentId}/pause`,
  agentResume: (agentId: string) => `/api/agents/${agentId}/resume`,
  taskById: (taskId: string) => `/api/tasks/${taskId}`,
  approvalDecide: (approvalId: string, decision: 'approve' | 'reject') =>
    `/api/approvals/${approvalId}/${decision}`,
  settings: '/api/settings',
} as const;

export interface CreateCeoRequestBody {
  text: string;
  priority?: TaskPriority;
}

export interface CreateCeoRequestResponse {
  planTask: Task;
  approval?: Approval;
  reply: ChatMessage;
}

export interface CreateTaskBody {
  title: string;
  description?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  dueAt?: string;
  projectId?: string;
  departmentId?: Task['departmentId'];
}

export interface UpdateTaskBody {
  status?: TaskStatus;
  assigneeId?: string | null;
  priority?: TaskPriority;
  progress?: number;
  focus?: boolean;
  dueAt?: string | null;
}

export interface DecideApprovalBody {
  note?: string;
}

export interface SendAgentMessageBody {
  text: string;
}

export interface SendAgentMessageResponse {
  owner: ChatMessage;
  reply: ChatMessage;
}

export interface UpdateSettingsBody {
  executionMode?: 'local' | 'cloud' | 'hybrid';
  ownerName?: string;
  companyName?: string;
}

/** Lỗi API chuẩn hóa – `code` là định danh kỹ thuật; UI dịch sang tiếng Việt qua errors:<code>. */
export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string; // thông điệp kỹ thuật (tiếng Anh) phục vụ log/debug
  details?: unknown;
}

export type ApiErrorCode =
  | 'not_found'
  | 'validation_failed'
  | 'conflict'
  | 'agent_paused'
  | 'approval_already_decided'
  | 'provider_unavailable'
  | 'rate_limited'
  | 'internal';

export type AgentSummary = Pick<Agent, 'id' | 'role' | 'status' | 'departmentId'>;
export type SnapshotResponse = OfficeSnapshot;

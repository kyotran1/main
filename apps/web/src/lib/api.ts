import type {
  ApiErrorBody,
  ApiErrorCode,
  CreateCeoRequestBody,
  CreateCeoRequestResponse,
  CreateTaskBody,
  DecideApprovalBody,
  OfficeSnapshot,
  SendAgentMessageBody,
  SendAgentMessageResponse,
  Task,
  Agent,
  Approval,
  UpdateSettingsBody,
  UpdateTaskBody,
  CompanyInfo,
} from '@ads-nolimit/shared';
import { API_ROUTES } from '@ads-nolimit/shared';
import { getApiBaseUrl } from './env';

/** Lỗi API có mã kỹ thuật – giao diện dịch sang tiếng Việt bằng errors:codes.<code>. */
export class ApiError extends Error {
  readonly code: ApiErrorCode | 'network';
  readonly status: number;
  readonly details?: unknown;
  constructor(code: ApiErrorCode | 'network', status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const BASE = getApiBaseUrl();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(init?.headers ?? {}) },
      ...init,
    });
  } catch (err) {
    throw new ApiError('network', 0, err instanceof Error ? err.message : 'Network request failed');
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const body = text ? (JSON.parse(text) as unknown) : null;
  if (!res.ok) {
    const err = (body ?? {}) as Partial<ApiErrorBody>;
    throw new ApiError(err.code ?? 'internal', res.status, err.message ?? res.statusText, err.details);
  }
  return body as T;
}

const json = (body: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(body) });

export const api = {
  health: () => request<{ ok: boolean; revision: number; executionMode: string }>(API_ROUTES.health),
  getState: () => request<OfficeSnapshot>(API_ROUTES.state),
  createCeoRequest: (body: CreateCeoRequestBody) =>
    request<CreateCeoRequestResponse>(API_ROUTES.ceoRequests, json(body)),
  createTask: (body: CreateTaskBody) => request<Task>(API_ROUTES.tasks, json(body)),
  updateTask: (taskId: string, body: UpdateTaskBody) =>
    request<Task>(API_ROUTES.taskById(taskId), { method: 'PATCH', body: JSON.stringify(body) }),
  decideApproval: (approvalId: string, decision: 'approve' | 'reject', body: DecideApprovalBody = {}) =>
    request<Approval>(API_ROUTES.approvalDecide(approvalId, decision), json(body)),
  pauseAgent: (agentId: string) => request<Agent>(API_ROUTES.agentPause(agentId), json({})),
  resumeAgent: (agentId: string) => request<Agent>(API_ROUTES.agentResume(agentId), json({})),
  sendAgentMessage: (agentId: string, body: SendAgentMessageBody) =>
    request<SendAgentMessageResponse>(API_ROUTES.messages(agentId), json(body)),
  updateSettings: (body: UpdateSettingsBody) =>
    request<CompanyInfo>(API_ROUTES.settings, { method: 'PATCH', body: JSON.stringify(body) }),
};

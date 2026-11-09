import { create } from 'zustand';
import type {
  ActivityEvent,
  Agent,
  Approval,
  ChatMessage,
  Department,
  DepartmentId,
  KpiSummary,
  OfficeEvent,
  OfficeSnapshot,
  Project,
  Task,
  Connector,
  CompanyInfo,
} from '@ads-nolimit/shared';

/**
 * STORE DUY NHẤT (single source of truth) phía giao diện.
 * Dashboard – Bảng điều khiển, Sơ đồ tổ chức, Văn phòng ảo 3D và mọi trang khác đều đọc
 * từ store này. Dữ liệu được nạp bằng snapshot từ backend và cập nhật qua sự kiện realtime.
 * KHÔNG trang nào được giữ bản sao dữ liệu riêng.
 */

export type ConnectionStatus = 'connecting' | 'live' | 'reconnecting' | 'offline';

export interface OfficeDataState {
  hydrated: boolean;
  revision: number;
  updatedAt: string | null;
  company: CompanyInfo | null;
  departments: Department[];
  agents: Record<string, Agent>;
  tasks: Record<string, Task>;
  approvals: Record<string, Approval>;
  projects: Record<string, Project>;
  connectors: Connector[];
  activities: ActivityEvent[];
  messages: ChatMessage[];
  kpis: KpiSummary | null;
}

export interface OfficeUiState {
  connection: ConnectionStatus;
  lastError: string | null;
  selectedAgentId: string | null;
  selectedDepartmentId: DepartmentId | null;
  selectedTaskId: string | null;
  /** Agent đang được camera 3D theo dõi (đồng bộ từ mọi trang có nút "Đưa camera tới"). */
  cameraFocusAgentId: string | null;
  sidebarCollapsed: boolean;
}

export interface OfficeActions {
  hydrate: (snapshot: OfficeSnapshot) => void;
  applyEvent: (event: OfficeEvent) => void;
  setConnection: (status: ConnectionStatus, error?: string | null) => void;
  selectAgent: (id: string | null) => void;
  selectDepartment: (id: DepartmentId | null) => void;
  selectTask: (id: string | null) => void;
  focusCameraOnAgent: (id: string | null) => void;
  toggleSidebar: (collapsed?: boolean) => void;
  reset: () => void;
}

export type OfficeStore = OfficeDataState & OfficeUiState & OfficeActions;

const MAX_ACTIVITIES = 300;
const MAX_MESSAGES = 500;

const initialData: OfficeDataState = {
  hydrated: false,
  revision: 0,
  updatedAt: null,
  company: null,
  departments: [],
  agents: {},
  tasks: {},
  approvals: {},
  projects: {},
  connectors: [],
  activities: [],
  messages: [],
  kpis: null,
};

const initialUi: OfficeUiState = {
  connection: 'connecting',
  lastError: null,
  selectedAgentId: null,
  selectedDepartmentId: null,
  selectedTaskId: null,
  cameraFocusAgentId: null,
  sidebarCollapsed: false,
};

const byId = <T extends { id: string }>(items: T[]): Record<string, T> =>
  Object.fromEntries(items.map((i) => [i.id, i]));

const sortByCreatedDesc = <T extends { createdAt: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

export const useOfficeStore = create<OfficeStore>()((set, get) => ({
  ...initialData,
  ...initialUi,

  hydrate: (snapshot) =>
    set({
      hydrated: true,
      revision: snapshot.revision,
      updatedAt: snapshot.updatedAt,
      company: snapshot.company,
      departments: snapshot.departments,
      agents: byId(snapshot.agents),
      tasks: byId(snapshot.tasks),
      approvals: byId(snapshot.approvals),
      projects: byId(snapshot.projects),
      connectors: snapshot.connectors,
      activities: sortByCreatedDesc(snapshot.activities).slice(0, MAX_ACTIVITIES),
      messages: [...snapshot.messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(-MAX_MESSAGES),
      kpis: snapshot.kpis,
    }),

  applyEvent: (event) => {
    const state = get();
    if (event.type === 'snapshot') {
      state.hydrate(event.snapshot);
      return;
    }
    // Bỏ qua sự kiện cũ hơn bản đã có (ngoại trừ khi chưa hydrate).
    if (state.hydrated && event.revision < state.revision) return;
    const updatedAt = new Date().toISOString();
    switch (event.type) {
      case 'task.upserted':
        set({ tasks: { ...state.tasks, [event.task.id]: event.task }, revision: event.revision, updatedAt });
        break;
      case 'task.removed': {
        const { [event.taskId]: _removed, ...rest } = state.tasks;
        set({ tasks: rest, revision: event.revision, updatedAt });
        break;
      }
      case 'agent.upserted':
        set({ agents: { ...state.agents, [event.agent.id]: event.agent }, revision: event.revision, updatedAt });
        break;
      case 'approval.upserted':
        set({
          approvals: { ...state.approvals, [event.approval.id]: event.approval },
          revision: event.revision,
          updatedAt,
        });
        break;
      case 'activity.created':
        set({
          activities: [event.activity, ...state.activities.filter((a) => a.id !== event.activity.id)].slice(
            0,
            MAX_ACTIVITIES,
          ),
          revision: event.revision,
          updatedAt,
        });
        break;
      case 'project.upserted':
        set({
          projects: { ...state.projects, [event.project.id]: event.project },
          revision: event.revision,
          updatedAt,
        });
        break;
      case 'kpi.updated':
        set({ kpis: event.kpis, revision: event.revision, updatedAt });
        break;
      case 'message.created':
        set({
          messages: [...state.messages.filter((m) => m.id !== event.message.id), event.message].slice(-MAX_MESSAGES),
          revision: event.revision,
          updatedAt,
        });
        break;
    }
  },

  setConnection: (connection, error = null) => set({ connection, lastError: error }),
  selectAgent: (selectedAgentId) => set({ selectedAgentId }),
  selectDepartment: (selectedDepartmentId) => set({ selectedDepartmentId }),
  selectTask: (selectedTaskId) => set({ selectedTaskId }),
  focusCameraOnAgent: (cameraFocusAgentId) => set({ cameraFocusAgentId }),
  toggleSidebar: (collapsed) =>
    set((s) => ({ sidebarCollapsed: collapsed ?? !s.sidebarCollapsed })),
  reset: () => set({ ...initialData, ...initialUi }),
}));

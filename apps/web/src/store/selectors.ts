import type {
  Agent,
  AgentRole,
  AgentStatus,
  Approval,
  Department,
  DepartmentId,
  Task,
  TaskStatus,
  WorkflowStage,
} from '@ads-nolimit/shared';
import { WORKFLOW_STAGES, isTaskOpen } from '@ads-nolimit/shared';
import type { OfficeStore } from './officeStore';

/**
 * Bộ chọn (selectors) dùng chung – mọi con số trên Tổng quan, Bảng điều khiển,
 * Sơ đồ tổ chức và Văn phòng 3D đều được tính từ đây để luôn khớp nhau.
 */

export const selectAgents = (s: OfficeStore): Agent[] => Object.values(s.agents);
export const selectTasks = (s: OfficeStore): Task[] => Object.values(s.tasks);
export const selectApprovals = (s: OfficeStore): Approval[] => Object.values(s.approvals);
export const selectProjects = (s: OfficeStore) => Object.values(s.projects);
export const selectDepartments = (s: OfficeStore): Department[] => s.departments;

export const selectAgentById = (id: string | null | undefined) => (s: OfficeStore): Agent | undefined =>
  id ? s.agents[id] : undefined;
export const selectTaskById = (id: string | null | undefined) => (s: OfficeStore): Task | undefined =>
  id ? s.tasks[id] : undefined;
export const selectDepartmentById =
  (id: DepartmentId | null | undefined) =>
  (s: OfficeStore): Department | undefined =>
    id ? s.departments.find((d) => d.id === id) : undefined;

export const selectAgentsByDepartment = (departmentId: DepartmentId) => (s: OfficeStore): Agent[] =>
  Object.values(s.agents).filter((a) => a.departmentId === departmentId);

export const selectTasksByAgent = (agentId: string) => (s: OfficeStore): Task[] =>
  Object.values(s.tasks).filter((t) => t.assigneeId === agentId);

export const selectTasksByDepartment = (departmentId: DepartmentId) => (s: OfficeStore): Task[] =>
  Object.values(s.tasks).filter((t) => t.departmentId === departmentId);

export const selectPendingApprovals = (s: OfficeStore): Approval[] =>
  Object.values(s.approvals)
    .filter((a) => a.status === 'pending')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export interface StatusCounts {
  total: number;
  byStatus: Record<TaskStatus, number>;
  open: number;
  completionRate: number; // %
}

const EMPTY_STATUS: Record<TaskStatus, number> = {
  not_started: 0,
  in_progress: 0,
  pending: 0,
  needs_approval: 0,
  in_review: 0,
  completed: 0,
  blocked: 0,
  overdue: 0,
};

export function computeTaskCounts(tasks: Task[]): StatusCounts {
  const byStatus: Record<TaskStatus, number> = { ...EMPTY_STATUS };
  for (const t of tasks) byStatus[t.status] += 1;
  const total = tasks.length;
  const open = tasks.filter((t) => isTaskOpen(t.status)).length;
  const completionRate = total === 0 ? 0 : Math.round((byStatus.completed / total) * 100);
  return { total, byStatus, open, completionRate };
}

export const selectTaskCounts = (s: OfficeStore): StatusCounts => computeTaskCounts(Object.values(s.tasks));

export interface AgentCounts {
  total: number;
  byStatus: Record<AgentStatus, number>;
  running: number;
}

export function computeAgentCounts(agents: Agent[]): AgentCounts {
  const byStatus: Record<AgentStatus, number> = {
    active: 0,
    running: 0,
    waiting: 0,
    idle: 0,
    paused: 0,
    error: 0,
  };
  for (const a of agents) byStatus[a.status] += 1;
  return { total: agents.length, byStatus, running: byStatus.running };
}

export const selectAgentCounts = (s: OfficeStore): AgentCounts => computeAgentCounts(Object.values(s.agents));

/** Số liệu thẻ thống kê đầu trang Tổng quan – nguồn duy nhất cho mọi nơi hiển thị. */
export interface HeadlineStats {
  agents: number;
  running: number;
  completed: number;
  pending: number;
  needsApproval: number;
}

export const selectHeadlineStats = (s: OfficeStore): HeadlineStats => {
  const tasks = Object.values(s.tasks);
  const agents = Object.values(s.agents);
  return {
    agents: agents.length,
    running: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status === 'pending' || t.status === 'not_started').length,
    needsApproval: Object.values(s.approvals).filter((a) => a.status === 'pending').length,
  };
};

export const selectStageCounts = (s: OfficeStore): Record<WorkflowStage, number> => {
  const out = Object.fromEntries(WORKFLOW_STAGES.map((st) => [st, 0])) as Record<WorkflowStage, number>;
  for (const t of Object.values(s.tasks)) {
    if (isTaskOpen(t.status)) out[t.stage] += 1;
  }
  return out;
};

/** Công việc trọng tâm hôm nay: ưu tiên cờ `focus`, rồi mức ưu tiên và hạn gần nhất. */
export const selectTodaysKeyTasks =
  (limit = 5) =>
  (s: OfficeStore): Task[] => {
    const rank: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return Object.values(s.tasks)
      .filter((t) => isTaskOpen(t.status) || t.focus)
      .sort((a, b) => {
        if (!!a.focus !== !!b.focus) return a.focus ? -1 : 1;
        const pr = (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9);
        if (pr !== 0) return pr;
        return (a.dueAt ?? '9999').localeCompare(b.dueAt ?? '9999');
      })
      .slice(0, limit);
  };

export const selectRecentActivities =
  (limit = 8) =>
  (s: OfficeStore) =>
    s.activities.slice(0, limit);

export const selectMessagesForAgent = (agentId: string) => (s: OfficeStore) =>
  s.messages.filter((m) => m.agentId === agentId);

/** Cây tổ chức: dựa trên reportsTo – dùng cho Sơ đồ tổ chức và tooltip 3D. */
export interface OrgNode {
  agent: Agent;
  children: OrgNode[];
}

export function buildOrgTree(agents: Agent[]): OrgNode[] {
  const byParent = new Map<string | undefined, Agent[]>();
  for (const a of agents) {
    const list = byParent.get(a.reportsTo) ?? [];
    list.push(a);
    byParent.set(a.reportsTo, list);
  }
  const roleRank: Record<AgentRole, number> = {
    ai_ceo: 0,
    ai_coo: 1,
    ai_project_manager: 2,
    ai_specialist: 3,
    ai_qa_reviewer: 4,
  };
  const build = (parentId: string | undefined): OrgNode[] =>
    (byParent.get(parentId) ?? [])
      .sort((a, b) => roleRank[a.role] - roleRank[b.role] || a.id.localeCompare(b.id))
      .map((agent) => ({ agent, children: build(agent.id) }));
  const roots = build(undefined);
  // Agent có reportsTo trỏ tới id không tồn tại → coi là gốc.
  const known = new Set(agents.map((a) => a.id));
  const orphans = agents.filter((a) => a.reportsTo && !known.has(a.reportsTo));
  return [...roots, ...orphans.map((agent) => ({ agent, children: build(agent.id) }))];
}

export const selectOrgTree = (s: OfficeStore): OrgNode[] => buildOrgTree(Object.values(s.agents));

export const selectAgentWorkload = (agentId: string) => (s: OfficeStore) => {
  const tasks = Object.values(s.tasks).filter((t) => t.assigneeId === agentId);
  return computeTaskCounts(tasks);
};

export const selectDepartmentSummary = (departmentId: DepartmentId) => (s: OfficeStore) => {
  const agents = Object.values(s.agents).filter((a) => a.departmentId === departmentId);
  const tasks = Object.values(s.tasks).filter((t) => t.departmentId === departmentId);
  return { agents, tasks, counts: computeTaskCounts(tasks), agentCounts: computeAgentCounts(agents) };
};

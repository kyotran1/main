import type { Agent, AgentRole, AgentStatus, Department, DepartmentId } from '@ads-nolimit/shared';
import { AGENT_ROLES } from '@ads-nolimit/shared';
import type { OfficeStore } from '@/store/officeStore';

export const AGENT_STATUS_ORDER: readonly AgentStatus[] = ['running', 'active', 'waiting', 'idle', 'paused', 'error'];
export const AGENT_ROLE_ORDER: readonly AgentRole[] = AGENT_ROLES;
const ROLE_RANK: Record<AgentRole, number> = { ai_ceo: 0, ai_coo: 1, ai_project_manager: 2, ai_specialist: 3, ai_qa_reviewer: 4 };

export interface AgentFilter {
  role: AgentRole | 'all';
  status: AgentStatus | 'all';
  department: DepartmentId | 'all';
}

export const EMPTY_AGENT_FILTER: AgentFilter = { role: 'all', status: 'all', department: 'all' };
export const isAgentFilterDirty = (f: AgentFilter): boolean => f.role !== 'all' || f.status !== 'all' || f.department !== 'all';

export function applyAgentFilter(agents: Agent[], f: AgentFilter): Agent[] {
  return agents.filter(
    (a) => (f.role === 'all' || a.role === f.role) && (f.status === 'all' || a.status === f.status) && (f.department === 'all' || a.departmentId === f.department),
  );
}

export const sortAgentsByRank = (agents: Agent[]): Agent[] =>
  [...agents].sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role] || a.id.localeCompare(b.id));

export interface DepartmentGroup {
  department: Department;
  agents: Agent[];
  openTasks: number;
}

/**
 * Gom nhân sự theo phòng ban (theo thứ tự phòng trong store), chỉ giữ phòng có nhân sự;
 * kèm số việc đang mở của phòng để tiêu đề nhóm hiển thị.
 */
export function groupAgentsByDepartment(agents: Agent[], departments: Department[], openTasksByDept: Record<string, number>): DepartmentGroup[] {
  const out: DepartmentGroup[] = [];
  const seen = new Set<DepartmentId>();
  for (const d of departments) {
    const members = sortAgentsByRank(agents.filter((a) => a.departmentId === d.id));
    seen.add(d.id);
    if (members.length) out.push({ department: d, agents: members, openTasks: openTasksByDept[d.id] ?? 0 });
  }
  // Nhân sự thuộc phòng chưa khai báo trong danh sách (phòng thủ dữ liệu).
  const leftovers = agents.filter((a) => !seen.has(a.departmentId));
  if (leftovers.length) {
    const byDept = new Map<DepartmentId, Agent[]>();
    for (const a of leftovers) byDept.set(a.departmentId, [...(byDept.get(a.departmentId) ?? []), a]);
    for (const [id, list] of byDept) {
      out.push({
        department: { id, accent: '#64748b', bounds: { x: 0, z: 0, width: 0, depth: 0 } },
        agents: sortAgentsByRank(list),
        openTasks: openTasksByDept[id] ?? 0,
      });
    }
  }
  return out;
}

/** Số việc đang mở theo phòng ban và theo nhân sự – tính một lần cho cả trang. */
export const selectOpenTaskCounts = (s: OfficeStore): { byDepartment: Record<string, number>; byAgent: Record<string, number> } => {
  const byDepartment: Record<string, number> = {};
  const byAgent: Record<string, number> = {};
  for (const t of Object.values(s.tasks)) {
    if (t.status === 'completed') continue;
    byDepartment[t.departmentId] = (byDepartment[t.departmentId] ?? 0) + 1;
    if (t.assigneeId) byAgent[t.assigneeId] = (byAgent[t.assigneeId] ?? 0) + 1;
  }
  return { byDepartment, byAgent };
};

/** Số phòng ban đang có nhân sự. */
export const selectStaffedDepartmentCount = (s: OfficeStore): number => new Set(Object.values(s.agents).map((a) => a.departmentId)).size;

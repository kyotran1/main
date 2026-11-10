import type { Agent, DepartmentId, Task, TaskPriority, TaskStatus } from '@ads-nolimit/shared';
import { STAGE_ORDER, TASK_STATUSES } from '@ads-nolimit/shared';
import type { OfficeStore } from '@/store/officeStore';

/** Thứ tự trạng thái trên trang Quản lý công việc (cột Kanban, bộ lọc, sắp xếp). */
export const TASK_STATUS_ORDER: readonly TaskStatus[] = TASK_STATUSES;
export const PRIORITY_ORDER: readonly TaskPriority[] = ['high', 'medium', 'low'];
const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
const STATUS_RANK: Record<TaskStatus, number> = Object.fromEntries(TASK_STATUS_ORDER.map((s, i) => [s, i])) as Record<TaskStatus, number>;

export type TaskViewMode = 'table' | 'kanban';
export type SortKey = 'title' | 'assignee' | 'department' | 'stage' | 'status' | 'priority' | 'progress' | 'due';
export type SortDir = 'asc' | 'desc';

export interface TaskFilter {
  query: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  department: DepartmentId | 'all';
  assignee: string | 'all';
}

export const EMPTY_TASK_FILTER: TaskFilter = { query: '', status: 'all', priority: 'all', department: 'all', assignee: 'all' };

export const isTaskFilterDirty = (f: TaskFilter): boolean =>
  f.query.trim() !== '' || f.status !== 'all' || f.priority !== 'all' || f.department !== 'all' || f.assignee !== 'all';

/** Chuẩn hóa chuỗi tìm kiếm: bỏ dấu, chữ thường – để "ke hoach" khớp "kế hoạch". */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function applyTaskFilter(tasks: Task[], filter: TaskFilter): Task[] {
  const q = normalizeSearch(filter.query);
  return tasks.filter((t) => {
    if (filter.status !== 'all' && t.status !== filter.status) return false;
    if (filter.priority !== 'all' && t.priority !== filter.priority) return false;
    if (filter.department !== 'all' && t.departmentId !== filter.department) return false;
    if (filter.assignee !== 'all' && t.assigneeId !== filter.assignee) return false;
    if (q && !normalizeSearch(t.title).includes(q) && !normalizeSearch(t.description ?? '').includes(q)) return false;
    return true;
  });
}

/** Quá hạn: trạng thái overdue, hoặc chưa hoàn thành mà hạn đã qua. */
export function isTaskOverdue(task: Task, now = Date.now()): boolean {
  if (task.status === 'completed') return false;
  if (task.status === 'overdue') return true;
  return !!task.dueAt && new Date(task.dueAt).getTime() < now;
}

/** Số ngày trễ hạn (>= 1) hoặc 0 nếu chưa trễ. */
export function overdueDays(task: Task, now = Date.now()): number {
  if (!task.dueAt || !isTaskOverdue(task, now)) return 0;
  return Math.max(1, Math.floor((now - new Date(task.dueAt).getTime()) / 86_400_000));
}

export function isDueToday(task: Task, now = new Date()): boolean {
  if (!task.dueAt) return false;
  const d = new Date(task.dueAt);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function sortTasks(tasks: Task[], key: SortKey, dir: SortDir, agentName: (id: string | undefined) => string): Task[] {
  const sign = dir === 'asc' ? 1 : -1;
  const cmp = (a: Task, b: Task): number => {
    switch (key) {
      case 'title':
        return a.title.localeCompare(b.title, 'vi');
      case 'assignee':
        return agentName(a.assigneeId).localeCompare(agentName(b.assigneeId), 'vi');
      case 'department':
        return a.departmentId.localeCompare(b.departmentId);
      case 'stage':
        return STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
      case 'status':
        return STATUS_RANK[a.status] - STATUS_RANK[b.status];
      case 'priority':
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      case 'progress':
        return a.progress - b.progress;
      case 'due':
        return (a.dueAt ?? '9999').localeCompare(b.dueAt ?? '9999');
    }
  };
  return [...tasks].sort((a, b) => sign * cmp(a, b) || a.createdAt.localeCompare(b.createdAt));
}

/** Gom công việc theo trạng thái cho Kanban – giữ đủ mọi cột kể cả cột rỗng. */
export function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const out = Object.fromEntries(TASK_STATUS_ORDER.map((s) => [s, [] as Task[]])) as unknown as Record<TaskStatus, Task[]>;
  for (const t of tasks) out[t.status].push(t);
  for (const s of TASK_STATUS_ORDER) {
    out[s].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || (a.dueAt ?? '9999').localeCompare(b.dueAt ?? '9999'));
  }
  return out;
}

/** Công việc con của một công việc (theo parentId). */
export const selectChildTasks = (taskId: string) => (s: OfficeStore): Task[] =>
  Object.values(s.tasks)
    .filter((t) => t.parentId === taskId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

/** Nhân sự AI có thể nhận việc, xếp theo cấp bậc rồi id – dùng cho ô chọn người phụ trách. */
const ROLE_RANK = { ai_ceo: 0, ai_coo: 1, ai_project_manager: 2, ai_specialist: 3, ai_qa_reviewer: 4 } as const;
export const selectAssignableAgents = (s: OfficeStore): Agent[] =>
  Object.values(s.agents).sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role] || a.id.localeCompare(b.id));

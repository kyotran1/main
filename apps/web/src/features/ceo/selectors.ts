import type { Agent, AgentRole, Approval, Project, Task, TaskStatus } from '@ads-nolimit/shared';
import { isTaskOpen } from '@ads-nolimit/shared';
import type { OfficeStore } from '@/store/officeStore';
import { computeTaskCounts, type StatusCounts } from '@/store/selectors';

/**
 * Bộ chọn riêng cho Trung tâm điều hành AI CEO. Mọi số liệu đều suy ra từ store duy nhất
 * (cùng các hàm tính của store/selectors) nên luôn khớp với Tổng quan, Bảng điều khiển…
 */

/** Thẻ đánh dấu công việc kế hoạch do backend gắn (dữ liệu, không dịch). */
export const PLAN_TAG = 'kế hoạch';

export const selectCeoAgent = (s: OfficeStore): Agent | undefined =>
  Object.values(s.agents).find((a) => a.role === 'ai_ceo');

export interface PlanSummary {
  task: Task;
  /** Đoạn mở đầu của mô tả kế hoạch (văn bản do AI CEO viết – dữ liệu). */
  summary: string;
  /** Các hạng mục đánh số "1. …" trong mô tả. */
  outline: string[];
  /** Công việc con đã được phân rã từ kế hoạch. */
  children: Task[];
  /** Yêu cầu phê duyệt gắn với kế hoạch (ưu tiên yêu cầu đang chờ). */
  approval?: Approval;
}

/** Tách mô tả kế hoạch "tóm tắt\n\n1. …\n2. …" thành tóm tắt + danh sách hạng mục. */
export function parsePlanDescription(description: string | undefined): { summary: string; outline: string[] } {
  const lines = (description ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const outline: string[] = [];
  const summaryParts: string[] = [];
  for (const line of lines) {
    const m = /^(\d+)[.)]\s+(.+)$/.exec(line);
    if (m && m[2]) outline.push(m[2]);
    else if (outline.length === 0) summaryParts.push(line);
  }
  return { summary: summaryParts.join(' '), outline };
}

export const selectLatestPlan =
  (ceoId: string | undefined) =>
  (s: OfficeStore): PlanSummary | null => {
    const all = Object.values(s.tasks);
    const candidates = all.filter(
      (t) => t.tags.includes(PLAN_TAG) || (!!ceoId && t.assigneeId === ceoId && t.stage === 'plan'),
    );
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const task = candidates[0]!;
    const approvals = Object.values(s.approvals)
      .filter((a) => a.taskId === task.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const approval = approvals.find((a) => a.status === 'pending') ?? approvals[0];
    const children = all.filter((t) => t.parentId === task.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const { summary, outline } = parsePlanDescription(task.description);
    return { task, summary, outline, children, approval };
  };

// ───────── Bảng công việc rút gọn ─────────
export type CeoTaskTab = 'all' | 'in_progress' | 'needs_approval' | 'completed' | 'overdue';
export const CEO_TASK_TABS: readonly CeoTaskTab[] = ['all', 'in_progress', 'needs_approval', 'completed', 'overdue'];

export interface CeoTaskBoard {
  /** Toàn bộ công việc đã sắp xếp: trọng tâm → đang mở → cập nhật mới nhất. */
  all: Task[];
  counts: Record<CeoTaskTab, number>;
}

const TAB_STATUS: Record<Exclude<CeoTaskTab, 'all'>, TaskStatus> = {
  in_progress: 'in_progress',
  needs_approval: 'needs_approval',
  completed: 'completed',
  overdue: 'overdue',
};

export function filterTasksByTab(tasks: Task[], tab: CeoTaskTab): Task[] {
  if (tab === 'all') return tasks;
  const status = TAB_STATUS[tab];
  return tasks.filter((t) => t.status === status);
}

export const selectCeoTaskBoard = (s: OfficeStore): CeoTaskBoard => {
  const all = Object.values(s.tasks).sort((a, b) => {
    if (!!a.focus !== !!b.focus) return a.focus ? -1 : 1;
    const ao = isTaskOpen(a.status);
    const bo = isTaskOpen(b.status);
    if (ao !== bo) return ao ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
  const counts = {
    all: all.length,
    in_progress: 0,
    needs_approval: 0,
    completed: 0,
    overdue: 0,
  } as Record<CeoTaskTab, number>;
  for (const t of all) {
    if (t.status === 'in_progress') counts.in_progress += 1;
    else if (t.status === 'needs_approval') counts.needs_approval += 1;
    else if (t.status === 'completed') counts.completed += 1;
    else if (t.status === 'overdue') counts.overdue += 1;
  }
  return { all, counts };
};

// ───────── Báo cáo nhanh ─────────
export interface QuickReport {
  /** Dự án nổi bật (đang triển khai, tiến độ cao nhất trước). */
  projects: Project[];
  counts: StatusCounts;
  pendingApprovals: Approval[];
}

export const selectQuickReport = (s: OfficeStore): QuickReport => {
  const projects = Object.values(s.projects);
  const active = projects.filter((p) => p.status === 'active' || p.status === 'planning');
  const picked = (active.length ? active : projects).sort((a, b) => b.progress - a.progress).slice(0, 2);
  return {
    projects: picked,
    counts: computeTaskCounts(Object.values(s.tasks)),
    pendingApprovals: Object.values(s.approvals)
      .filter((a) => a.status === 'pending')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  };
};

// ───────── Danh sách nhân sự AI (thứ tự theo cấp bậc) ─────────
const ROLE_RANK: Record<AgentRole, number> = {
  ai_ceo: 0,
  ai_coo: 1,
  ai_project_manager: 2,
  ai_specialist: 3,
  ai_qa_reviewer: 4,
};

export const selectRegistryAgents = (s: OfficeStore): Agent[] =>
  Object.values(s.agents).sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role] || a.id.localeCompare(b.id));

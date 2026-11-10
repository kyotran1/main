import type { Agent, DepartmentId, TaskStatus } from '@ads-nolimit/shared';
import { TASK_STATUSES, isTaskOpen } from '@ads-nolimit/shared';
import type { OfficeStore } from '@/store/officeStore';
import { computeTaskCounts, selectPendingApprovals, selectTaskCounts } from '@/store/selectors';

/** Một hàng dữ liệu cho biểu đồ cột xếp chồng theo phòng ban. */
export interface DepartmentStatusRow extends Record<TaskStatus, number> {
  departmentId: DepartmentId;
  total: number;
}

/** Trạng thái có xuất hiện trong dữ liệu – thứ tự cố định theo TASK_STATUSES. */
export interface DepartmentStatusChart {
  rows: DepartmentStatusRow[];
  statuses: TaskStatus[];
}

/** Số công việc theo trạng thái của từng phòng ban (chỉ phòng ban có công việc). */
export const selectTasksByDepartmentStatus = (s: OfficeStore): DepartmentStatusChart => {
  const tasks = Object.values(s.tasks);
  const present = new Set<TaskStatus>();
  const rows: DepartmentStatusRow[] = s.departments
    .filter((d) => !d.functional)
    .map((d) => {
      const own = tasks.filter((t) => t.departmentId === d.id);
      const counts = computeTaskCounts(own);
      for (const st of TASK_STATUSES) if (counts.byStatus[st] > 0) present.add(st);
      return { departmentId: d.id, total: own.length, ...counts.byStatus };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);
  return { rows, statuses: TASK_STATUSES.filter((st) => present.has(st)) };
};

/** Hiệu suất nhân sự AI – sắp xếp giảm dần, kèm số việc đã xong. */
export const selectAgentPerformance = (s: OfficeStore): Agent[] =>
  Object.values(s.agents).sort((a, b) => b.performance - a.performance || a.id.localeCompare(b.id));

export interface DepartmentSummaryRow {
  departmentId: DepartmentId;
  agents: number;
  open: number;
  completed: number;
  total: number;
  completionRate: number;
}

/** Bảng tổng hợp theo phòng ban (phòng ban có nhân sự hoặc công việc) + dòng tổng toàn công ty. */
export const selectDepartmentTable = (s: OfficeStore): { rows: DepartmentSummaryRow[]; total: DepartmentSummaryRow } => {
  const agents = Object.values(s.agents);
  const tasks = Object.values(s.tasks);
  const rows = s.departments
    .filter((d) => !d.functional)
    .map<DepartmentSummaryRow>((d) => {
      const own = tasks.filter((t) => t.departmentId === d.id);
      const counts = computeTaskCounts(own);
      return {
        departmentId: d.id,
        agents: agents.filter((a) => a.departmentId === d.id).length,
        open: counts.open,
        completed: counts.byStatus.completed,
        total: counts.total,
        completionRate: counts.completionRate,
      };
    })
    .filter((r) => r.agents > 0 || r.total > 0)
    .sort((a, b) => b.completionRate - a.completionRate || b.total - a.total);
  const all = computeTaskCounts(tasks);
  const total: DepartmentSummaryRow = {
    departmentId: 'executive',
    agents: agents.length,
    open: all.open,
    completed: all.byStatus.completed,
    total: all.total,
    completionRate: all.completionRate,
  };
  return { rows, total };
};

/** Dữ liệu đầu vào cho "Nhận định của AI COO" – văn bản được sinh ở component qua i18n. */
export interface CooInsightData {
  totalTasks: number;
  completed: number;
  completionRate: number;
  overdue: number;
  blocked: number;
  pendingApprovals: number;
  agentsTotal: number;
  agentsRunning: number;
  /** Phòng ban dẫn đầu / cần hỗ trợ (chỉ tính phòng ban có >= 2 công việc). */
  top?: { departmentId: DepartmentId; rate: number };
  lagging?: { departmentId: DepartmentId; rate: number };
  kpi: { leads: number; conversion: number; roi: number } | null;
}

export const selectCooInsights = (s: OfficeStore): CooInsightData => {
  const counts = selectTaskCounts(s);
  const agents = Object.values(s.agents);
  const ranked = selectDepartmentTable(s).rows.filter((r) => r.total >= 2);
  const top = ranked[0];
  const lagging = ranked.length > 1 ? ranked[ranked.length - 1] : undefined;
  return {
    totalTasks: counts.total,
    completed: counts.byStatus.completed,
    completionRate: counts.completionRate,
    overdue: counts.byStatus.overdue,
    blocked: counts.byStatus.blocked,
    pendingApprovals: selectPendingApprovals(s).length,
    agentsTotal: agents.length,
    agentsRunning: agents.filter((a) => a.status === 'running').length,
    top: top ? { departmentId: top.departmentId, rate: top.completionRate } : undefined,
    lagging: lagging && lagging.departmentId !== top?.departmentId ? { departmentId: lagging.departmentId, rate: lagging.completionRate } : undefined,
    kpi: s.kpis ? { leads: s.kpis.leadsGrowthPct, conversion: s.kpis.conversionGrowthPct, roi: s.kpis.roi } : null,
  };
};

/** Ảnh chụp dữ liệu để xuất JSON – lấy nguyên trạng từ store (không có trạng thái giao diện). */
export function buildExportSnapshot(s: OfficeStore) {
  return {
    exportedAt: new Date().toISOString(),
    revision: s.revision,
    updatedAt: s.updatedAt,
    company: s.company,
    kpis: s.kpis,
    departments: s.departments,
    agents: Object.values(s.agents),
    projects: Object.values(s.projects),
    tasks: Object.values(s.tasks),
    approvals: Object.values(s.approvals),
    connectors: s.connectors,
    activities: s.activities,
  };
}

/** Bảng công việc dạng CSV (UTF-8 BOM để Excel đọc đúng tiếng Việt). */
export function buildTasksCsv(s: OfficeStore): string {
  const header = ['id', 'title', 'status', 'open', 'stage', 'priority', 'departmentId', 'assigneeId', 'projectId', 'progress', 'dueAt', 'createdAt', 'updatedAt'];
  const escape = (v: unknown) => {
    const str = v === undefined || v === null ? '' : String(v);
    return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = Object.values(s.tasks).map((t) =>
    [t.id, t.title, t.status, isTaskOpen(t.status) ? 1 : 0, t.stage, t.priority, t.departmentId, t.assigneeId, t.projectId, t.progress, t.dueAt, t.createdAt, t.updatedAt].map(escape).join(','),
  );
  return `﻿${header.join(',')}\n${lines.join('\n')}\n`;
}

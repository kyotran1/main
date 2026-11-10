import type { Project, ProjectStatus, Task } from '@ads-nolimit/shared';
import type { OfficeStore } from '@/store/officeStore';
import { computeTaskCounts, type StatusCounts } from '@/store/selectors';

/** Thứ tự hiển thị trạng thái dự án: đang triển khai trước, hoàn thành cuối. */
const STATUS_RANK: Record<ProjectStatus, number> = { active: 0, planning: 1, on_hold: 2, completed: 3 };

export interface ProjectCardData {
  project: Project;
  tasks: Task[];
  counts: StatusCounts;
}

/** Tổng quan đầu trang: số dự án, đang triển khai, tổng ngân sách, tiến độ trung bình. */
export const selectProjectsOverview = (s: OfficeStore) => {
  const projects = Object.values(s.projects);
  const total = projects.length;
  const active = projects.filter((p) => p.status === 'active').length;
  const budget = projects.reduce((sum, p) => sum + (p.budgetVnd ?? 0), 0);
  const avgProgress = total === 0 ? 0 : Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / total);
  return { total, active, budget, avgProgress };
};

/** Số dự án theo từng trạng thái – dùng cho chip bộ lọc. */
export const selectProjectStatusCounts = (s: OfficeStore): Record<ProjectStatus, number> => {
  const out: Record<ProjectStatus, number> = { planning: 0, active: 0, on_hold: 0, completed: 0 };
  for (const p of Object.values(s.projects)) out[p.status] += 1;
  return out;
};

/** Thẻ dự án kèm công việc thuộc dự án (lọc theo projectId) và thống kê trạng thái. */
export const selectProjectCards =
  (status: ProjectStatus | 'all') =>
  (s: OfficeStore): ProjectCardData[] => {
    const tasks = Object.values(s.tasks);
    return Object.values(s.projects)
      .filter((p) => status === 'all' || p.status === status)
      .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.startAt.localeCompare(b.startAt))
      .map((project) => {
        const own = tasks
          .filter((t) => t.projectId === project.id)
          .sort((a, b) => Number(a.status === 'completed') - Number(b.status === 'completed') || a.createdAt.localeCompare(b.createdAt));
        return { project, tasks: own, counts: computeTaskCounts(own) };
      });
  };

/** Số ngày còn lại tới ngày kết thúc (âm = đã trễ); null khi chưa có ngày kết thúc. */
export function daysUntil(iso: string | undefined, now: number = Date.now()): number | null {
  if (!iso) return null;
  const end = new Date(iso).getTime();
  return Math.ceil((end - now) / 86_400_000);
}

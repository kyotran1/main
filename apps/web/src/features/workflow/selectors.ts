import type { Agent, Task, WorkflowStage } from '@ads-nolimit/shared';
import { STAGE_OWNER_ROLE, WORKFLOW_STAGES, isTaskOpen } from '@ads-nolimit/shared';
import type { OfficeStore } from '@/store/officeStore';

/** Bộ chọn cho trang Quy trình – đồng nhất với selectStageCounts (chỉ đếm công việc đang mở). */

/** Nhân sự AI đảm nhận mỗi giai đoạn (theo STAGE_OWNER_ROLE), sắp xếp theo id để ổn định. */
export const selectStageOwners = (s: OfficeStore): Record<WorkflowStage, Agent[]> => {
  const agents = Object.values(s.agents);
  const out = {} as Record<WorkflowStage, Agent[]>;
  for (const stage of WORKFLOW_STAGES) {
    const role = STAGE_OWNER_ROLE[stage];
    out[stage] = agents.filter((a) => a.role === role).sort((a, b) => a.id.localeCompare(b.id));
  }
  return out;
};

const PRIORITY_RANK: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };

/** Công việc đang mở ở một giai đoạn: ưu tiên cao trước, rồi hạn gần nhất. */
export const selectTasksInStage =
  (stage: WorkflowStage | null) =>
  (s: OfficeStore): Task[] =>
    Object.values(s.tasks)
      .filter((t) => isTaskOpen(t.status) && (stage === null || t.stage === stage))
      .sort((a, b) => {
        if (stage === null) {
          const si = WORKFLOW_STAGES.indexOf(a.stage) - WORKFLOW_STAGES.indexOf(b.stage);
          if (si !== 0) return si;
        }
        const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (pr !== 0) return pr;
        return (a.dueAt ?? '9999').localeCompare(b.dueAt ?? '9999');
      });

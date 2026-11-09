import type { Agent, Department, DepartmentId, Task, TaskPriority } from '@ads-nolimit/shared';

/**
 * "Bộ não" của nhân sự AI – trừu tượng hóa nhà cung cấp mô hình (Hybrid Local + Cloud).
 * Mọi đầu ra dành cho Owner phải là tiếng Việt; thuật ngữ chuyên ngành kèm giải thích tiếng Việt.
 * Định danh kỹ thuật (departmentId, role, id) KHÔNG được dịch.
 */
export interface PlanSubtaskDraft {
  title: string;
  departmentId: DepartmentId;
  priority: TaskPriority;
  /** Vai trò mong muốn của người thực hiện (mặc định ai_specialist). */
  role?: Agent['role'];
  estimateHours?: number;
}

export interface PlanDraft {
  title: string;
  summary: string;
  /** Các bước/hạng mục tóm tắt hiển thị trong "Tóm tắt kế hoạch". */
  outline: string[];
  subtasks: PlanSubtaskDraft[];
  approvalRequired: boolean;
  approvalTitle: string;
  /** Lời phản hồi của AI CEO cho Owner (tiếng Việt). */
  replyToOwner: string;
}

export interface BrainContext {
  departments: Department[];
  agents: Agent[];
  tasks: Task[];
  companyName: string;
}

export interface ReviewVerdict {
  passed: boolean;
  note: string;
}

export interface AgentBrain {
  readonly name: string;
  readonly mode: 'local' | 'cloud' | 'hybrid';
  planRequest(input: { text: string; priority: TaskPriority }, ctx: BrainContext): Promise<PlanDraft>;
  replyToOwner(agent: Agent, text: string, ctx: BrainContext & { agentTasks: Task[] }): Promise<string>;
  reviewTask(task: Task, ctx: BrainContext): Promise<ReviewVerdict>;
  isAvailable(): Promise<boolean>;
}

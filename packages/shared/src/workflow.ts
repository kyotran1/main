import type { WorkflowStage, TaskStatus, AgentRole, DepartmentId } from './domain.js';

export const WORKFLOW_STAGES: readonly WorkflowStage[] = [
  'receive',
  'plan',
  'assign',
  'execute',
  'review',
  'report',
] as const;

export const TASK_STATUSES: readonly TaskStatus[] = [
  'not_started',
  'in_progress',
  'pending',
  'needs_approval',
  'in_review',
  'completed',
  'blocked',
  'overdue',
] as const;

export const AGENT_ROLES: readonly AgentRole[] = [
  'ai_ceo',
  'ai_coo',
  'ai_project_manager',
  'ai_specialist',
  'ai_qa_reviewer',
] as const;

export const DEPARTMENT_IDS: readonly DepartmentId[] = [
  'executive',
  'strategy',
  'marketing',
  'creative_media',
  'social_community',
  'data_analytics',
  'sales_crm',
  'tech_automation',
  'meeting_room',
  'reception',
  'pantry',
] as const;

/** Vai trò chịu trách nhiệm chính ở mỗi giai đoạn. */
export const STAGE_OWNER_ROLE: Record<WorkflowStage, AgentRole> = {
  receive: 'ai_ceo',
  plan: 'ai_ceo',
  assign: 'ai_project_manager',
  execute: 'ai_specialist',
  review: 'ai_qa_reviewer',
  report: 'ai_coo',
};

export const STAGE_ORDER: Record<WorkflowStage, number> = {
  receive: 0,
  plan: 1,
  assign: 2,
  execute: 3,
  review: 4,
  report: 5,
};

export function nextStage(stage: WorkflowStage): WorkflowStage | null {
  const idx = STAGE_ORDER[stage];
  return WORKFLOW_STAGES[idx + 1] ?? null;
}

export const TERMINAL_TASK_STATUSES: readonly TaskStatus[] = ['completed'] as const;

export function isTaskOpen(status: TaskStatus): boolean {
  return !TERMINAL_TASK_STATUSES.includes(status);
}

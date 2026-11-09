import type { AgentRole, AgentStatus, DepartmentId, TaskPriority, TaskStatus } from '@ads-nolimit/shared';

/** Ánh xạ enum miền → token màu CSS (xem styles/index.css). Chỉ dùng token, không hard-code hex. */
export const DEPARTMENT_COLOR_VAR: Record<DepartmentId, string> = {
  executive: 'var(--color-dept-executive)',
  strategy: 'var(--color-dept-strategy)',
  marketing: 'var(--color-dept-marketing)',
  creative_media: 'var(--color-dept-creative-media)',
  social_community: 'var(--color-dept-social-community)',
  data_analytics: 'var(--color-dept-data-analytics)',
  sales_crm: 'var(--color-dept-sales-crm)',
  tech_automation: 'var(--color-dept-tech-automation)',
  meeting_room: 'var(--color-dept-meeting-room)',
  reception: 'var(--color-dept-reception)',
  pantry: 'var(--color-dept-pantry)',
};

export const AGENT_STATUS_COLOR_VAR: Record<AgentStatus, string> = {
  active: 'var(--color-status-active)',
  running: 'var(--color-status-running)',
  waiting: 'var(--color-status-waiting)',
  idle: 'var(--color-status-idle)',
  paused: 'var(--color-status-paused)',
  error: 'var(--color-status-error)',
};

export const TASK_STATUS_COLOR_VAR: Record<TaskStatus, string> = {
  not_started: 'var(--color-status-not-started)',
  in_progress: 'var(--color-status-running)',
  pending: 'var(--color-status-waiting)',
  needs_approval: 'var(--color-status-approval)',
  in_review: 'var(--color-status-review)',
  completed: 'var(--color-status-done)',
  blocked: 'var(--color-status-error)',
  overdue: 'var(--color-status-error)',
};

export const PRIORITY_COLOR_VAR: Record<TaskPriority, string> = {
  high: 'var(--color-priority-high)',
  medium: 'var(--color-priority-medium)',
  low: 'var(--color-priority-low)',
};

export const ROLE_COLOR_VAR: Record<AgentRole, string> = {
  ai_ceo: 'var(--color-brand-gold)',
  ai_coo: 'var(--color-brand-violet)',
  ai_project_manager: 'var(--color-brand-blue)',
  ai_specialist: 'var(--color-brand-cyan)',
  ai_qa_reviewer: 'var(--color-brand-magenta)',
};

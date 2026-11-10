import type { AgentStatus, ApprovalStatus, TaskPriority, TaskStatus, WorkflowStage } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import {
  bilingual,
  termIdForAgentStatus,
  termIdForApprovalStatus,
  termIdForPriority,
  termIdForStage,
  termIdForTaskStatus,
} from '@ads-nolimit/i18n';
import { AGENT_STATUS_COLOR_VAR, PRIORITY_COLOR_VAR, TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { Badge } from '@/components/ui/Badge';

/** Các huy hiệu trạng thái – nhãn tiếng Việt, tooltip song ngữ, màu theo token. */

export function TaskStatusBadge({ status, size = 'sm', short }: { status: TaskStatus; size?: 'sm' | 'md'; short?: boolean }) {
  const locale = useLocale();
  const label = bilingual(termIdForTaskStatus(status), locale);
  return (
    <Badge color={TASK_STATUS_COLOR_VAR[status]} size={size} dot pulse={status === 'in_progress'} title={label.inline}>
      {short ? label.short : label.primary}
    </Badge>
  );
}

export function AgentStatusBadge({ status, size = 'sm' }: { status: AgentStatus; size?: 'sm' | 'md' }) {
  const locale = useLocale();
  const label = bilingual(termIdForAgentStatus(status), locale);
  return (
    <Badge color={AGENT_STATUS_COLOR_VAR[status]} size={size} dot pulse={status === 'running' || status === 'active'} title={label.inline}>
      {label.primary}
    </Badge>
  );
}

export function PriorityBadge({ priority, size = 'sm' }: { priority: TaskPriority; size?: 'sm' | 'md' }) {
  const locale = useLocale();
  const label = bilingual(termIdForPriority(priority), locale);
  return (
    <Badge color={PRIORITY_COLOR_VAR[priority]} size={size} title={label.inline}>
      {label.primary}
    </Badge>
  );
}

export function StageBadge({ stage, size = 'sm' }: { stage: WorkflowStage; size?: 'sm' | 'md' }) {
  const locale = useLocale();
  const label = bilingual(termIdForStage(stage), locale);
  return (
    <Badge color="var(--color-brand-violet)" size={size} title={label.inline}>
      {label.short}
    </Badge>
  );
}

export function ApprovalStatusBadge({ status, size = 'sm' }: { status: ApprovalStatus; size?: 'sm' | 'md' }) {
  const locale = useLocale();
  const label = bilingual(termIdForApprovalStatus(status), locale);
  const color =
    status === 'approved' ? 'var(--color-status-done)' : status === 'rejected' ? 'var(--color-status-error)' : 'var(--color-status-waiting)';
  return (
    <Badge color={color} size={size} dot title={label.inline}>
      {label.primary}
    </Badge>
  );
}

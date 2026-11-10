import type { ProjectStatus } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForProjectStatus } from '@ads-nolimit/i18n';
import { Badge } from '@/components/ui/Badge';

/** Màu trạng thái dự án – token hệ thống, không hard-code hex. */
export const PROJECT_STATUS_COLOR_VAR: Record<ProjectStatus, string> = {
  planning: 'var(--color-status-waiting)',
  active: 'var(--color-status-running)',
  on_hold: 'var(--color-status-paused)',
  completed: 'var(--color-status-done)',
};

/** Huy hiệu trạng thái dự án: nhãn tiếng Việt, tooltip song ngữ. */
export function ProjectStatusBadge({ status, size = 'sm' }: { status: ProjectStatus; size?: 'sm' | 'md' }) {
  const locale = useLocale();
  const label = bilingual(termIdForProjectStatus(status), locale);
  return (
    <Badge color={PROJECT_STATUS_COLOR_VAR[status]} size={size} dot pulse={status === 'active'} title={label.inline}>
      {label.primary}
    </Badge>
  );
}

import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ListTodo, Play } from 'lucide-react';
import type { TaskStatus } from '@ads-nolimit/shared';
import { bilingual, termIdForTaskStatus } from '@ads-nolimit/i18n';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useDerived } from '@/store/hooks';
import { selectHeadlineStats } from '@/store/selectors';
import { Card, CardHeader } from '@/components/ui/Card';
import { TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { formatNumber } from '@/lib/format';

/** Ba ô trạng thái công việc – cùng nguồn selectHeadlineStats với thẻ thống kê và trang Tổng quan. */
export function TaskStatusTiles() {
  const { t } = useTranslation();
  const locale = useLocale();
  const stats = useDerived(selectHeadlineStats);
  const title = bilingual('module.task_status', locale);
  const tiles: { status: TaskStatus; value: number; Icon: ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
    { status: 'in_progress', value: stats.running, Icon: Play },
    { status: 'pending', value: stats.pending, Icon: Clock },
    { status: 'completed', value: stats.completed, Icon: CheckCircle2 },
  ];
  return (
    <Card>
      <CardHeader icon={<ListTodo className="size-4" />} title={title.primary} subtitle={title.secondary} />
      <div className="grid grid-cols-3 gap-2">
        {tiles.map(({ status, value, Icon }) => {
          const label = bilingual(termIdForTaskStatus(status), locale);
          const color = TASK_STATUS_COLOR_VAR[status];
          return (
            <Link
              key={status}
              to="/tasks"
              className="flex min-w-0 flex-col items-center rounded-xl border p-3 text-center transition hover:bg-white/[0.04] focus-visible:focus-ring"
              style={{ borderColor: `color-mix(in srgb, ${color} 45%, transparent)`, background: `color-mix(in srgb, ${color} 10%, transparent)`, boxShadow: `inset 0 0 24px color-mix(in srgb, ${color} 8%, transparent)` }}
              title={label.inline}
            >
              <Icon className="size-6" style={{ color }} />
              <span className="mt-1.5 text-[11px] font-semibold leading-tight text-text">{label.primary}</span>
              <span className="truncate text-[9.5px] text-text-muted">{label.secondary}</span>
              <span className="mt-1.5 text-2xl font-extrabold leading-none tabular-nums text-text">{formatNumber(value, locale)}</span>
            </Link>
          );
        })}
      </div>
      <p className="mt-2.5 text-[10.5px] text-text-muted">{t('office3d:taskStatus.subtitle')}</p>
    </Card>
  );
}

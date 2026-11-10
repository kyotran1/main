import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2, Clock3, ListChecks, Play } from 'lucide-react';
import { clsx } from 'clsx';
import type { TaskStatus } from '@ads-nolimit/shared';
import { useTerms } from '@ads-nolimit/i18n/react';
import { termIdForTaskStatus } from '@ads-nolimit/i18n';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { useDerived } from '@/store/hooks';
import { selectDepartmentSummary, selectTaskCounts } from '@/store/selectors';
import { DEPARTMENT_COLOR_VAR, TASK_STATUS_COLOR_VAR } from '@/lib/colors';

/** Bốn trạng thái nổi bật – thứ tự và biểu tượng cố định. */
const TILES: readonly { status: TaskStatus; icon: LucideIcon }[] = [
  { status: 'in_progress', icon: Play },
  { status: 'pending', icon: Clock3 },
  { status: 'completed', icon: CheckCircle2 },
  { status: 'overdue', icon: AlertTriangle },
];

/**
 * "Trạng thái công việc": 4 ô lớn từ selectTaskCounts + thanh tiến độ theo phòng ban
 * (selectDepartmentSummary cho từng phòng ban có nhân sự).
 */
export function TaskStatusPanel({ className }: { className?: string }) {
  const { t } = useTranslation();
  const terms = useTerms();
  const counts = useDerived(selectTaskCounts);
  const departments = useDerived((s) =>
    s.departments
      .filter((d) => !d.functional)
      .map((d) => ({ id: d.id, ...selectDepartmentSummary(d.id)(s) }))
      .filter((d) => d.agents.length > 0),
  );

  return (
    <Card accent="green" className={clsx('flex flex-col', className)}>
      <CardHeader
        icon={<ListChecks className="size-4.5" />}
        title={t('glossary:module.task_status.label')}
        subtitle={t('glossary:module.task_status.secondary')}
      />

      {counts.total === 0 ? (
        <EmptyState title={t('dashboard:taskStatus.empty')} icon={<ListChecks className="size-7" />} />
      ) : (
        <>
          <p className="mb-3 text-xs text-text-muted">{t('dashboard:taskStatus.description', { total: counts.total, percent: counts.completionRate })}</p>
          <div className="grid grid-cols-2 gap-2.5">
            {TILES.map(({ status, icon: Icon }) => {
              const label = terms(termIdForTaskStatus(status));
              const color = TASK_STATUS_COLOR_VAR[status];
              return (
                <Link
                  key={status}
                  to="/tasks"
                  title={label.inline}
                  className="flex min-w-0 flex-col gap-2 rounded-xl border p-3 transition hover:bg-white/[0.05] focus-visible:focus-ring"
                  style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)`, background: `color-mix(in srgb, ${color} 10%, transparent)` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Icon className="size-4.5 shrink-0" style={{ color }} aria-hidden="true" />
                    <span className="text-[26px] font-extrabold leading-none tracking-tight" style={{ color }}>
                      {counts.byStatus[status]}
                    </span>
                  </div>
                  <span className="term-stack">
                    <span className="term-primary truncate text-[13px]">{label.primary}</span>
                    <span className="term-secondary truncate">{label.secondary}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-text">{t('dashboard:taskStatus.byDepartment')}</p>
            <p className="truncate text-[11px] text-text-muted">{t('dashboard:taskStatus.byDepartmentSecondary')}</p>
          </div>

          {departments.length === 0 ? (
            <p className="mt-2 text-xs text-text-muted">{t('dashboard:taskStatus.emptyDepartments')}</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2.5">
              {departments.map((dept) => {
                const color = DEPARTMENT_COLOR_VAR[dept.id];
                const done = dept.counts.byStatus.completed;
                return (
                  <li key={dept.id} className="min-w-0">
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <DepartmentName id={dept.id} format="short" withDot className="min-w-0 truncate font-semibold text-text" />
                      <span className="shrink-0 text-text-muted tabular-nums">
                        {t('dashboard:taskStatus.doneOf', { done, total: dept.counts.total })} · {dept.counts.completionRate}%
                      </span>
                    </div>
                    <ProgressBar value={dept.counts.completionRate} color={color} size="sm" label={`${t('glossary:metric.completion_rate.inline')}: ${dept.counts.completionRate}%`} />
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}

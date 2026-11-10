import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart as PieIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { TaskStatus } from '@ads-nolimit/shared';
import { TASK_STATUSES } from '@ads-nolimit/shared';
import { useTerms } from '@ads-nolimit/i18n/react';
import { termIdForTaskStatus } from '@ads-nolimit/i18n';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDerived } from '@/store/hooks';
import { selectTaskCounts } from '@/store/selectors';
import { TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { resolveCssColor, useChartTheme } from '@/features/dashboard/chartTheme';
import { ChartTooltip } from '@/features/dashboard/ChartTooltip';

interface Slice {
  status: TaskStatus;
  value: number;
  color: string;
}

/**
 * "Tiến độ công việc tổng quan": biểu đồ vòng theo trạng thái (màu từ TASK_STATUS_COLOR_VAR),
 * tỷ lệ hoàn thành ở giữa, chú giải song ngữ kèm số lượng. Số liệu từ selectTaskCounts.
 */
export function OverallProgressCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const terms = useTerms();
  const theme = useChartTheme();
  const counts = useDerived(selectTaskCounts);

  // Chỉ vẽ trạng thái có công việc; màu cố định theo trạng thái (không theo thứ hạng).
  const slices = useMemo<Slice[]>(
    () =>
      TASK_STATUSES.filter((status) => counts.byStatus[status] > 0).map((status) => ({
        status,
        value: counts.byStatus[status],
        color: resolveCssColor(TASK_STATUS_COLOR_VAR[status]),
      })),
    [counts],
  );

  return (
    <Card accent="green" className={clsx('flex flex-col', className)}>
      <CardHeader
        icon={<PieIcon className="size-4.5" />}
        title={t('glossary:module.overall_progress.label')}
        subtitle={t('glossary:module.overall_progress.secondary')}
      />
      {counts.total === 0 ? (
        <EmptyState title={t('overview:progress.empty')} icon={<PieIcon className="size-7" />} />
      ) : (
        // my-auto: căn giữa theo chiều dọc khi thẻ bị kéo giãn bằng chiều cao hàng
        <div className="my-auto flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div
            className="relative size-[160px] shrink-0"
            role="img"
            aria-label={t('overview:progress.chartAriaLabel', { percent: counts.completionRate })}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="status"
                  innerRadius={58}
                  outerRadius={76}
                  paddingAngle={slices.length > 1 ? 2 : 0}
                  stroke={theme.surface}
                  strokeWidth={2}
                  startAngle={90}
                  endAngle={-270}
                  animationDuration={900}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.status} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    const datum = payload?.[0]?.payload as Slice | undefined;
                    if (!active || !datum) return null;
                    const label = terms(termIdForTaskStatus(datum.status));
                    return (
                      <ChartTooltip
                        title={label.inline}
                        rows={[{ color: datum.color, label: t('common:labels.task'), value: t('common:units.tasks', { count: datum.value }) }]}
                      />
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-gradient-brand text-[30px] font-extrabold leading-none tracking-tight">{counts.completionRate}%</span>
              <span className="mt-1 text-xs font-semibold text-text">{t('overview:progress.completedLabel')}</span>
              <span className="text-[10px] text-text-muted">{t('overview:progress.completedSecondary')}</span>
            </div>
          </div>

          {/* Chú giải: nhãn tiếng Việt chính + thuật ngữ tiếng Anh phụ (xếp chồng, không cắt chữ) */}
          <ul className="flex w-full min-w-0 flex-1 flex-col gap-2">
            {slices.map((slice) => {
              const label = terms(termIdForTaskStatus(slice.status));
              return (
                <li key={slice.status} className="flex items-center gap-2.5" title={label.inline}>
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: slice.color, boxShadow: `0 0 8px ${slice.color}` }} aria-hidden="true" />
                  <span className="term-stack min-w-0 flex-1">
                    <span className="term-primary text-[13px] leading-tight">{label.primary}</span>
                    <span className="term-secondary truncate">{label.secondary}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-text tabular-nums">{slice.value}</span>
                </li>
              );
            })}
            <li className="mt-1 border-t border-line/60 pt-2 text-xs text-text-muted">
              {t('overview:progress.ofTotal', { done: counts.byStatus.completed, total: counts.total })}
            </li>
          </ul>
        </div>
      )}
    </Card>
  );
}

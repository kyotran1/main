import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DepartmentId, TaskStatus } from '@ads-nolimit/shared';
import { useLocale, useTerms } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForDepartment, termIdForTaskStatus } from '@ads-nolimit/i18n';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDerived } from '@/store/hooks';
import { formatNumber } from '@/lib/format';
import { useReportChartTheme } from './chartTheme';
import { ReportTooltip } from './ReportTooltip';
import { selectTasksByDepartmentStatus } from './selectors';

const HATCH_ID = 'reports-hatch-overdue';
const ROW_HEIGHT = 34;

/**
 * Công việc theo phòng ban – cột ngang xếp chồng theo trạng thái (màu TASK_STATUS_COLOR_VAR).
 * "Quá hạn" dùng vân gạch chéo vì trùng màu với "Bị chặn"; khe 2px nền giữa các đoạn.
 */
export function DepartmentTaskChart({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const terms = useTerms();
  const theme = useReportChartTheme();
  const chart = useDerived(selectTasksByDepartmentStatus);

  const deptShort = useMemo(() => {
    const map = new Map<DepartmentId, string>();
    for (const r of chart.rows) map.set(r.departmentId, bilingual(termIdForDepartment(r.departmentId), locale).short);
    return map;
  }, [chart.rows, locale]);

  const statusLabel = (st: TaskStatus) => terms(termIdForTaskStatus(st));
  const fillFor = (st: TaskStatus) => (st === 'overdue' ? `url(#${HATCH_ID})` : theme.status[st]);

  const tooltip = (deptId: unknown) => {
    const row = chart.rows.find((r) => r.departmentId === deptId);
    if (!row) return null;
    const label = bilingual(termIdForDepartment(row.departmentId), locale);
    return (
      <ReportTooltip
        title={label.primary}
        subtitle={`${label.secondary} · ${t('reports:byDepartment.total')}: ${row.total}`}
        rows={chart.statuses
          .filter((st) => row[st] > 0)
          .map((st) => {
            const l = statusLabel(st);
            return { color: theme.status[st], kind: st === 'overdue' ? ('hatch' as const) : ('bar' as const), label: l.primary, secondary: l.secondary, value: formatNumber(row[st], locale) };
          })}
      />
    );
  };

  const height = Math.max(160, chart.rows.length * ROW_HEIGHT + 30);

  return (
    <Card accent="cyan" className={clsx('flex flex-col', className)}>
      <CardHeader icon={<Building2 className="size-4.5" />} title={t('reports:byDepartment.title')} subtitle={t('reports:byDepartment.secondary')} />
      {chart.rows.length === 0 ? (
        <EmptyState title={t('reports:byDepartment.empty')} icon={<Building2 className="size-7" />} />
      ) : (
        <>
          {/* Chú giải song ngữ – luôn hiển thị vì có nhiều trạng thái */}
          <ul className="mb-2 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[11px]">
            {chart.statuses.map((st) => {
              const l = statusLabel(st);
              return (
                <li key={st} className="flex items-center gap-1.5" title={l.inline}>
                  <span
                    className="size-2.5 rounded-[3px]"
                    style={{
                      background: st === 'overdue' ? `repeating-linear-gradient(45deg, ${theme.status[st]} 0 2px, transparent 2px 4px)` : theme.status[st],
                      boxShadow: st === 'overdue' ? `inset 0 0 0 1px ${theme.status[st]}` : undefined,
                    }}
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-text">{l.primary}</span>
                  <span className="hidden text-text-muted sm:inline">({l.secondary})</span>
                </li>
              );
            })}
          </ul>
          <figure className="m-0 w-full" style={{ height }} aria-label={t('reports:byDepartment.ariaLabel')}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart.rows} layout="vertical" margin={{ top: 4, right: 28, left: 0, bottom: 0 }} barCategoryGap="30%">
                <defs>
                  <pattern id={HATCH_ID} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                    <rect width="6" height="6" fill={theme.status.overdue} />
                    <line x1="0" y1="0" x2="0" y2="6" stroke={theme.surface} strokeWidth="2.5" />
                  </pattern>
                </defs>
                <CartesianGrid horizontal={false} stroke={theme.grid} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: theme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="departmentId"
                  width={112}
                  tick={{ fill: theme.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(id: DepartmentId) => deptShort.get(id) ?? id}
                />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={({ active, label }) => (active ? tooltip(label) : null)} />
                {chart.statuses.map((st, i) => (
                  <Bar
                    key={st}
                    dataKey={st}
                    stackId="tasks"
                    name={statusLabel(st).primary}
                    fill={fillFor(st)}
                    stroke={theme.surface}
                    strokeWidth={1}
                    maxBarSize={22}
                    radius={i === chart.statuses.length - 1 ? [0, 4, 4, 0] : 0}
                    animationDuration={700}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </figure>
          <p className="mt-2 text-xs text-text-dim">{t('reports:byDepartment.description')}</p>
        </>
      )}
    </Card>
  );
}

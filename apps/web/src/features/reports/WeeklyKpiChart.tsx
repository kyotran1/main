import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Table2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { KpiPoint } from '@ads-nolimit/shared';
import { useLocale, useTerms } from '@ads-nolimit/i18n/react';
import type { BilingualLabel } from '@ads-nolimit/i18n';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useOfficeStore } from '@/store/officeStore';
import { formatCompact, formatNumber, formatPercent } from '@/lib/format';
import { useReportChartTheme } from './chartTheme';
import { ReportTooltip } from './ReportTooltip';

interface WeekPoint extends KpiPoint {
  week: string;
}

const AXIS_WIDTH = 46;
const MARGIN = { top: 6, right: 24, left: 0, bottom: 0 };

/**
 * Hiệu suất tiếp thị theo tuần – ba bảng nhỏ chung trục tuần (small multiples):
 * lượt tiếp cận (cột), khách hàng tiềm năng (cột), tỷ lệ chuyển đổi (đường).
 * Mỗi chỉ số một thang đo riêng, tránh trục kép gây hiểu nhầm độ lớn.
 */
export function WeeklyKpiChart({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const terms = useTerms();
  const theme = useReportChartTheme();
  const series = useOfficeStore((s) => s.kpis?.series ?? null);

  const data = useMemo<WeekPoint[]>(
    () =>
      (series ?? []).map((p, i) => {
        const n = Number.parseInt(p.label.replace(/\D/g, ''), 10);
        return { ...p, week: t('common:time.week', { n: Number.isFinite(n) ? n : i + 1 }) };
      }),
    [series, t],
  );

  const reach = terms('metric.reach');
  const leads = terms('metric.leads');
  const conversion = terms('metric.conversion_rate');
  const tick = { fill: theme.text, fontSize: 11 };

  const tooltip = (week: unknown) => {
    const point = data.find((d) => d.week === String(week));
    if (!point) return null;
    return (
      <ReportTooltip
        title={point.week}
        rows={[
          { color: theme.reach, kind: 'bar', label: reach.primary, secondary: reach.secondary, value: formatNumber(point.reach, locale) },
          { color: theme.leads, kind: 'bar', label: leads.primary, secondary: leads.secondary, value: formatNumber(point.leads, locale) },
          { color: theme.conversion, kind: 'line', label: conversion.primary, secondary: conversion.secondary, value: formatPercent(point.conversionRate, locale, 1) },
        ]}
      />
    );
  };

  /** Tiêu đề từng bảng nhỏ: ô màu + nhãn tiếng Việt + thuật ngữ tiếng Anh. */
  const panelTitle = (label: BilingualLabel, color: string, kind: 'bar' | 'line') => (
    <p className="mb-1 flex items-center gap-2 text-xs" title={label.inline}>
      <span className={kind === 'line' ? 'h-0.5 w-4 rounded-full' : 'size-2.5 rounded-[3px]'} style={{ background: color }} aria-hidden="true" />
      <span className="font-semibold text-text">{label.primary}</span>
      <span className="truncate text-text-muted">({label.secondary})</span>
    </p>
  );

  return (
    <Card accent="violet" className={clsx('flex flex-col', className)}>
      <CardHeader icon={<BarChart3 className="size-4.5" />} title={t('reports:weekly.title')} subtitle={t('reports:weekly.secondary')} />
      {data.length === 0 ? (
        <EmptyState title={t('reports:weekly.empty')} icon={<BarChart3 className="size-7" />} />
      ) : (
        <>
          <figure className="m-0 flex flex-col gap-3" aria-label={t('reports:weekly.ariaLabel')}>
            <div>
              {panelTitle(reach, theme.reach, 'bar')}
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={MARGIN} barCategoryGap="36%">
                    <CartesianGrid vertical={false} stroke={theme.grid} />
                    <XAxis dataKey="week" hide />
                    <YAxis width={AXIS_WIDTH} tick={tick} axisLine={false} tickLine={false} tickCount={3} tickFormatter={(v: number) => formatCompact(v, locale)} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={({ active, label }) => (active ? tooltip(label) : null)} />
                    <Bar dataKey="reach" name={reach.primary} fill={theme.reach} maxBarSize={28} radius={[4, 4, 0, 0]} animationDuration={700} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              {panelTitle(leads, theme.leads, 'bar')}
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={MARGIN} barCategoryGap="36%">
                    <CartesianGrid vertical={false} stroke={theme.grid} />
                    <XAxis dataKey="week" hide />
                    <YAxis width={AXIS_WIDTH} tick={tick} axisLine={false} tickLine={false} tickCount={3} allowDecimals={false} tickFormatter={(v: number) => formatNumber(v, locale)} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={({ active, label }) => (active ? tooltip(label) : null)} />
                    <Bar dataKey="leads" name={leads.primary} fill={theme.leads} maxBarSize={28} radius={[4, 4, 0, 0]} animationDuration={700} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              {panelTitle(conversion, theme.conversion, 'line')}
              <div className="h-[170px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data} margin={MARGIN}>
                    <CartesianGrid vertical={false} stroke={theme.grid} />
                    <XAxis dataKey="week" tick={tick} axisLine={false} tickLine={false} interval={0} />
                    <YAxis width={AXIS_WIDTH} tick={tick} axisLine={false} tickLine={false} tickCount={3} tickFormatter={(v: number) => formatPercent(v, locale)} domain={[0, (max: number) => Math.ceil(max + 1)]} />
                    <Tooltip cursor={{ stroke: theme.grid }} content={({ active, label }) => (active ? tooltip(label) : null)} />
                    <Line
                      type="monotone"
                      dataKey="conversionRate"
                      name={conversion.primary}
                      stroke={theme.conversion}
                      strokeWidth={2}
                      strokeLinecap="round"
                      dot={{ r: 4, fill: theme.conversion, stroke: theme.surface, strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: theme.conversion, stroke: theme.surface, strokeWidth: 2 }}
                      animationDuration={700}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </figure>
          <p className="mt-2 text-xs text-text-dim">{t('reports:weekly.description')}</p>

          <details className="mt-2 rounded-xl border border-line/60 bg-white/[0.02]">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-semibold text-text-muted hover:text-text focus-visible:focus-ring [&::-webkit-details-marker]:hidden">
              <Table2 className="size-3.5" aria-hidden="true" />
              <span>{t('reports:weekly.tableToggle')}</span>
              <span className="font-medium text-text-dim">({t('reports:weekly.tableToggleSecondary')})</span>
            </summary>
            <div className="overflow-x-auto px-3 pb-3">
              <table className="w-full min-w-[360px] text-xs">
                <thead>
                  <tr className="text-left text-text-muted">
                    <th scope="col" className="py-1.5 pr-3 font-semibold">{t('reports:weekly.week')}</th>
                    <th scope="col" className="py-1.5 pr-3 text-right font-semibold" title={reach.inline}>{reach.primary}</th>
                    <th scope="col" className="py-1.5 pr-3 text-right font-semibold" title={leads.inline}>{leads.primary}</th>
                    <th scope="col" className="py-1.5 text-right font-semibold" title={conversion.inline}>{conversion.primary}</th>
                  </tr>
                </thead>
                <tbody className="text-text tabular-nums">
                  {data.map((p) => (
                    <tr key={p.label} className="border-t border-line/50">
                      <th scope="row" className="py-1.5 pr-3 text-left font-medium">{p.week}</th>
                      <td className="py-1.5 pr-3 text-right">{formatNumber(p.reach, locale)}</td>
                      <td className="py-1.5 pr-3 text-right">{formatNumber(p.leads, locale)}</td>
                      <td className="py-1.5 text-right">{formatPercent(p.conversionRate, locale, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </Card>
  );
}

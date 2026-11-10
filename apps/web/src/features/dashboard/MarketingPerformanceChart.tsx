import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Table2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { KpiPoint } from '@ads-nolimit/shared';
import { useLocale, useTerms } from '@ads-nolimit/i18n/react';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useOfficeStore } from '@/store/officeStore';
import { formatCompact, formatNumber, formatPercent } from '@/lib/format';
import { useChartTheme } from './chartTheme';
import { ChartTooltip } from './ChartTooltip';

interface WeekPoint extends KpiPoint {
  /** Nhãn tuần đã dịch ("Tuần 1") – trục X. */
  week: string;
}

/** Bề rộng trục trái/phải cố định để hai bảng vẽ thẳng hàng theo cột. */
const LEFT_AXIS_WIDTH = 46;
const RIGHT_AXIS_WIDTH = 40;
const CHART_MARGIN = { top: 8, right: 0, left: 0, bottom: 0 };

/**
 * "Marketing Performance – Hiệu suất tiếp thị" (dữ liệu store.kpis.series).
 * Hai bảng vẽ chung trục tuần: (1) cột Khách hàng tiềm năng + đường Tỷ lệ chuyển đổi (trục phải, %),
 * (2) cột Lượt tiếp cận – tách riêng vì khác bậc độ lớn với leads (tránh cột lẫn thang đo).
 * Có chú giải song ngữ, tooltip tiếng Việt cho mọi chuỗi và bảng số liệu tương đương.
 */
export function MarketingPerformanceChart({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const terms = useTerms();
  const theme = useChartTheme();
  const series = useOfficeStore((s) => s.kpis?.series ?? null);

  const data = useMemo<WeekPoint[]>(
    () =>
      (series ?? []).map((point, index) => {
        const n = Number.parseInt(point.label.replace(/\D/g, ''), 10);
        return { ...point, week: t('common:time.week', { n: Number.isFinite(n) ? n : index + 1 }) };
      }),
    [series, t],
  );

  const reach = terms('metric.reach');
  const leads = terms('metric.leads');
  const conversion = terms('metric.conversion_rate');

  const legend = [
    { key: 'leads', color: theme.leads, kind: 'bar' as const, label: leads },
    { key: 'conversion', color: theme.conversion, kind: 'line' as const, label: conversion },
    { key: 'reach', color: theme.reach, kind: 'bar' as const, label: reach },
  ];

  const tickStyle = { fill: theme.text, fontSize: 11 };

  const renderTooltip = (week: string | number | undefined) => {
    const point = data.find((d) => d.week === String(week));
    if (!point) return null;
    return (
      <ChartTooltip
        title={point.week}
        rows={[
          { color: theme.leads, kind: 'bar', label: leads.primary, secondary: leads.secondary, value: formatNumber(point.leads, locale) },
          { color: theme.conversion, kind: 'line', label: conversion.primary, secondary: conversion.secondary, value: formatPercent(point.conversionRate, locale, 1) },
          { color: theme.reach, kind: 'bar', label: reach.primary, secondary: reach.secondary, value: formatNumber(point.reach, locale) },
        ]}
      />
    );
  };

  return (
    <Card accent="cyan" className={clsx('flex flex-col', className)}>
      <CardHeader
        icon={<BarChart3 className="size-4.5" />}
        title={t('glossary:module.marketing_performance.label')}
        subtitle={t('glossary:module.marketing_performance.secondary')}
      />

      {data.length === 0 ? (
        <EmptyState title={t('dashboard:chart.empty')} icon={<BarChart3 className="size-7" />} />
      ) : (
        <>
          {/* Chú giải song ngữ – luôn hiển thị vì có từ 2 chuỗi trở lên */}
          <ul className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs" aria-hidden="true">
            {legend.map((item) => (
              <li key={item.key} className="flex items-center gap-2" title={item.label.inline}>
                <span
                  className={item.kind === 'line' ? 'h-0.5 w-4 rounded-full' : 'size-3 rounded-[3px]'}
                  style={{ background: item.color }}
                />
                <span className="font-semibold text-text">{item.label.primary}</span>
                <span className="text-text-muted">({item.label.secondary})</span>
              </li>
            ))}
          </ul>

          <figure className="m-0" aria-label={t('dashboard:chart.ariaLabel')}>
            {/* Bảng 1: Khách hàng tiềm năng (cột) + Tỷ lệ chuyển đổi (đường, trục phải) */}
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={CHART_MARGIN} barCategoryGap="34%">
                  <CartesianGrid vertical={false} stroke={theme.grid} />
                  <XAxis dataKey="week" tick={tickStyle} axisLine={false} tickLine={false} interval={0} />
                  <YAxis
                    yAxisId="left"
                    width={LEFT_AXIS_WIDTH}
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => formatNumber(v, locale)}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    width={RIGHT_AXIS_WIDTH}
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => formatPercent(v, locale)}
                    domain={[0, (max: number) => Math.ceil(max + 1)]}
                  />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={({ active, label }) => (active ? renderTooltip(label) : null)} />
                  <Bar yAxisId="left" dataKey="leads" name={leads.primary} fill={theme.leads} maxBarSize={24} radius={[4, 4, 0, 0]} animationDuration={900} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conversionRate"
                    name={conversion.primary}
                    stroke={theme.conversion}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={{ r: 4, fill: theme.conversion, stroke: theme.surface, strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: theme.conversion, stroke: theme.surface, strokeWidth: 2 }}
                    animationDuration={900}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Bảng 2: Lượt tiếp cận (cột) – cùng trục tuần, thang đo riêng */}
            <figcaption className="mt-2 mb-1 flex items-center gap-2 text-[11px] text-text-muted" title={`${t('dashboard:chart.reachPanel')} – ${t('dashboard:chart.reachPanelSecondary')}`}>
              <span className="size-2.5 rounded-[3px]" style={{ background: theme.reach }} aria-hidden="true" />
              <span className="font-semibold text-text">{t('dashboard:chart.reachPanel')}</span>
              <span>({t('dashboard:chart.reachPanelSecondary')})</span>
            </figcaption>
            <div className="h-[132px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ ...CHART_MARGIN, right: RIGHT_AXIS_WIDTH }} barCategoryGap="34%">
                  <CartesianGrid vertical={false} stroke={theme.grid} />
                  <XAxis dataKey="week" tick={tickStyle} axisLine={false} tickLine={false} interval={0} />
                  <YAxis
                    yAxisId="left"
                    width={LEFT_AXIS_WIDTH}
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => formatCompact(v, locale)}
                    tickCount={3}
                  />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={({ active, label }) => (active ? renderTooltip(label) : null)} />
                  <Bar yAxisId="left" dataKey="reach" name={reach.primary} fill={theme.reach} maxBarSize={24} radius={[4, 4, 0, 0]} animationDuration={900} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </figure>

          <p className="mt-2 text-xs text-text-dim">{t('dashboard:chart.description')}</p>

          {/* Bảng số liệu tương đương – mọi giá trị đọc được không cần di chuột */}
          <details className="group mt-2 rounded-xl border border-line/60 bg-white/[0.02]">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-semibold text-text-muted hover:text-text focus-visible:focus-ring [&::-webkit-details-marker]:hidden">
              <Table2 className="size-3.5" aria-hidden="true" />
              <span>{t('dashboard:chart.tableToggle')}</span>
              <span className="font-medium text-text-dim">({t('dashboard:chart.tableToggleSecondary')})</span>
            </summary>
            <div className="overflow-x-auto px-3 pb-3">
              <table className="w-full min-w-[420px] text-xs">
                <thead>
                  <tr className="text-left text-text-muted">
                    <th scope="col" className="py-1.5 pr-3 font-semibold">{t('dashboard:chart.weekColumn')}</th>
                    <th scope="col" className="py-1.5 pr-3 text-right font-semibold" title={leads.inline}>{leads.primary}</th>
                    <th scope="col" className="py-1.5 pr-3 text-right font-semibold" title={conversion.inline}>{conversion.primary}</th>
                    <th scope="col" className="py-1.5 text-right font-semibold" title={reach.inline}>{reach.primary}</th>
                  </tr>
                </thead>
                <tbody className="text-text tabular-nums">
                  {data.map((point) => (
                    <tr key={point.label} className="border-t border-line/50">
                      <th scope="row" className="py-1.5 pr-3 text-left font-medium">{point.week}</th>
                      <td className="py-1.5 pr-3 text-right">{formatNumber(point.leads, locale)}</td>
                      <td className="py-1.5 pr-3 text-right">{formatPercent(point.conversionRate, locale, 1)}</td>
                      <td className="py-1.5 text-right">{formatNumber(point.reach, locale)}</td>
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

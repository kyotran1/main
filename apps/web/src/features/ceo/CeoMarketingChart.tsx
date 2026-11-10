import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Table2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { KpiPoint } from '@ads-nolimit/shared';
import { useLocale, useTerms } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { formatCompact, formatNumber, formatPercent } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCeoChartTheme } from './chartColors';

interface WeekPoint extends KpiPoint {
  week: string;
}

const AXIS_WIDTH = 38;
const MARGIN = { top: 6, right: 6, left: 0, bottom: 0 };

/**
 * "Marketing Performance – Hiệu suất tiếp thị" thu nhỏ: hai bảng vẽ nhỏ chung trục tuần
 * (cột Khách hàng tiềm năng; đường Tỷ lệ chuyển đổi) – không dùng hai trục trên một biểu đồ.
 * Có chú giải song ngữ, tooltip tiếng Việt và bảng số liệu tương đương (có thể mở).
 */
export function CeoMarketingChart({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const terms = useTerms();
  const theme = useCeoChartTheme();
  const series = useOfficeStore((s) => s.kpis?.series ?? null);

  const data = useMemo<WeekPoint[]>(
    () =>
      (series ?? []).map((p, i) => {
        const n = Number.parseInt(p.label.replace(/\D/g, ''), 10);
        return { ...p, week: t('common:time.week', { n: Number.isFinite(n) ? n : i + 1 }) };
      }),
    [series, t],
  );

  const leads = terms('metric.leads');
  const conversion = terms('metric.conversion_rate');
  const tick = { fill: theme.text, fontSize: 10 };

  const tooltipFor = (week: string | number | undefined) => {
    const p = data.find((d) => d.week === String(week));
    if (!p) return null;
    return (
      <div className="glass-strong min-w-[160px] px-3 py-2 text-xs">
        <p className="mb-1 font-semibold text-text">{p.week}</p>
        <p className="flex items-center justify-between gap-3 text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px]" style={{ background: theme.leads }} aria-hidden="true" />
            {leads.primary}
          </span>
          <span className="font-bold text-text tabular-nums">{formatNumber(p.leads, locale)}</span>
        </p>
        <p className="flex items-center justify-between gap-3 text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full" style={{ background: theme.conversion }} aria-hidden="true" />
            {conversion.short}
          </span>
          <span className="font-bold text-text tabular-nums">{formatPercent(p.conversionRate, locale, 1)}</span>
        </p>
      </div>
    );
  };

  return (
    <Card accent="cyan" className={className}>
      <CardHeader
        icon={<Activity className="size-4.5" aria-hidden="true" />}
        title={t('glossary:module.marketing_performance.label')}
        subtitle={`${t('glossary:module.marketing_performance.secondary')} · ${t('ceo:chart.description')}`}
      />
      {data.length === 0 ? (
        <EmptyState title={t('ceo:chart.empty')} icon={<Activity className="size-7" aria-hidden="true" />} />
      ) : (
        <figure className="m-0" aria-label={t('ceo:chart.ariaLabel')}>
          <ul className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]" aria-hidden="true">
            <li className="flex items-center gap-1.5" title={leads.inline}>
              <span className="size-2.5 rounded-[3px]" style={{ background: theme.leads }} />
              <span className="font-semibold text-text">{leads.primary}</span>
              <span className="text-text-muted">({leads.secondary})</span>
            </li>
            <li className="flex items-center gap-1.5" title={conversion.inline}>
              <span className="h-0.5 w-3.5 rounded-full" style={{ background: theme.conversion }} />
              <span className="font-semibold text-text">{conversion.short}</span>
              <span className="text-text-muted">({conversion.secondary})</span>
            </li>
          </ul>

          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={MARGIN} barCategoryGap="38%">
                <CartesianGrid vertical={false} stroke={theme.grid} />
                <XAxis dataKey="week" tick={tick} axisLine={false} tickLine={false} interval={0} height={18} />
                <YAxis width={AXIS_WIDTH} tick={tick} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompact(v, locale)} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={({ active, label }) => (active ? tooltipFor(label) : null)} />
                <Bar dataKey="leads" fill={theme.leads} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 h-[80px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={MARGIN}>
                <CartesianGrid vertical={false} stroke={theme.grid} />
                <XAxis dataKey="week" tick={tick} axisLine={false} tickLine={false} interval={0} height={18} />
                <YAxis width={AXIS_WIDTH} tick={tick} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatPercent(v, locale)} domain={[0, 'auto']} />
                <Tooltip cursor={{ stroke: theme.grid }} content={({ active, label }) => (active ? tooltipFor(label) : null)} />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  stroke={theme.conversion}
                  strokeWidth={2}
                  dot={{ r: 3.5, fill: theme.conversion, stroke: theme.surface, strokeWidth: 2 }}
                  activeDot={{ r: 5, stroke: theme.surface, strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <details className="mt-2 text-xs">
            <summary className="inline-flex cursor-pointer items-center gap-1.5 text-text-muted hover:text-text" title={`${t('ceo:chart.tableToggle')} – ${t('ceo:chart.tableToggleSecondary')}`}>
              <Table2 className="size-3.5" aria-hidden="true" />
              {t('ceo:chart.tableToggle')}
            </summary>
            <table className="mt-2 w-full text-left text-[11px]">
              <thead>
                <tr className="text-text-muted">
                  <th className="pb-1 font-semibold">{t('ceo:chart.weekColumn')}</th>
                  <th className="pb-1 text-right font-semibold">{leads.primary}</th>
                  <th className="pb-1 text-right font-semibold">{conversion.short}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr key={p.label} className="border-t border-line/50 text-text">
                    <td className="py-1">{p.week}</td>
                    <td className="py-1 text-right tabular-nums">{formatNumber(p.leads, locale)}</td>
                    <td className="py-1 text-right tabular-nums">{formatPercent(p.conversionRate, locale, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </figure>
      )}
    </Card>
  );
}

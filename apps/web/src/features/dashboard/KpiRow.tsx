import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Coins, Percent, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { clsx } from 'clsx';
import type { KpiSummary } from '@ads-nolimit/shared';
import { useLocale, useTerms } from '@ads-nolimit/i18n/react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useOfficeStore } from '@/store/officeStore';
import { formatNumber, formatSignedPercent } from '@/lib/format';

type Accent = 'green' | 'violet' | 'cyan' | 'amber';

interface KpiTileProps {
  icon: ReactNode;
  value: string;
  /** Hướng thay đổi; `good` cho biết hướng đó là tốt (để chọn biểu tượng/màu). */
  direction?: 'up' | 'down';
  good?: boolean;
  label: string;
  secondary: string;
  note: string;
  noteSecondary?: string;
  accent: Accent;
  color: string;
}

/** Ô KPI: số to đậm, nhãn tiếng Việt chính + thuật ngữ tiếng Anh phụ, dòng chú thích so sánh kỳ trước. */
function KpiTile({ icon, value, direction, good = true, label, secondary, note, noteSecondary, accent, color }: KpiTileProps) {
  const TrendIcon = direction === 'down' ? TrendingDown : TrendingUp;
  const trendColor = direction ? (good ? 'var(--color-status-done)' : 'var(--color-status-error)') : color;
  return (
    <Card accent={accent} padded={false} className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full opacity-40 blur-2xl"
        style={{ background: `color-mix(in srgb, ${color} 45%, transparent)` }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
            style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 40%, transparent)` }}
          >
            {icon}
          </span>
          {direction ? (
            <span className="flex size-7 items-center justify-center rounded-full" style={{ color: trendColor, background: `color-mix(in srgb, ${trendColor} 14%, transparent)` }} aria-hidden="true">
              <TrendIcon className="size-4" />
            </span>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="text-[28px] font-extrabold leading-none tracking-tight md:text-[34px]" style={{ color }}>
            {value}
          </p>
          <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-tight text-text" title={`${secondary} – ${label}`}>
            {label}
          </p>
          <p className="truncate text-[11px] text-text-muted">{secondary}</p>
        </div>
        <p className="line-clamp-2 text-[11px] leading-snug text-text-dim" title={noteSecondary ? `${note} – ${noteSecondary}` : note}>
          {note}
        </p>
      </div>
    </Card>
  );
}

/** Nhãn kỳ báo cáo (chỉ hiển thị) – khóa kỳ là định danh kỹ thuật từ backend. */
export function PeriodChip() {
  const { t } = useTranslation();
  const period = useOfficeStore((s) => s.kpis?.period ?? null);
  if (!period) return null;
  const label = t(`dashboard:period.${period}`);
  const secondary = t(`dashboard:period.${period}Secondary`);
  return (
    <span
      className="inline-flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3 py-1.5 text-xs"
      title={`${t('dashboard:period.label')} – ${t('dashboard:period.secondary')}: ${label} (${secondary})`}
    >
      <CalendarDays className="size-4 text-brand-cyan" aria-hidden="true" />
      <span className="term-stack">
        <span className="term-primary text-xs">{label}</span>
        <span className="term-secondary">{secondary}</span>
      </span>
    </span>
  );
}

/** Hàng 4 KPI từ store.kpis: khách hàng tiềm năng, tỷ lệ chuyển đổi, chi phí/khách hàng, ROI. */
export function KpiRow() {
  const { t } = useTranslation();
  const locale = useLocale();
  const terms = useTerms();
  const kpis: KpiSummary | null = useOfficeStore((s) => s.kpis);

  if (!kpis) {
    return (
      <Card>
        <EmptyState title={t('dashboard:kpi.empty')} />
      </Card>
    );
  }

  const leads = terms('metric.leads');
  const conversion = terms('metric.conversion_rate');
  const cpl = terms('metric.cost_per_lead');
  const roi = terms('metric.roi');
  const vsPrevious = t('dashboard:kpi.vsPrevious');
  const vsPreviousSecondary = t('dashboard:kpi.vsPreviousSecondary');

  return (
    <section aria-label={t('glossary:module.kpi.inline')} className={clsx('grid grid-cols-2 gap-3 xl:grid-cols-4')}>
      <KpiTile
        icon={<Users className="size-5" />}
        value={formatSignedPercent(kpis.leadsGrowthPct, locale)}
        direction={kpis.leadsGrowthPct >= 0 ? 'up' : 'down'}
        good={kpis.leadsGrowthPct >= 0}
        label={leads.primary}
        secondary={leads.secondary}
        note={vsPrevious}
        noteSecondary={vsPreviousSecondary}
        accent="green"
        color="var(--color-brand-green)"
      />
      <KpiTile
        icon={<Percent className="size-5" />}
        value={formatSignedPercent(kpis.conversionGrowthPct, locale)}
        direction={kpis.conversionGrowthPct >= 0 ? 'up' : 'down'}
        good={kpis.conversionGrowthPct >= 0}
        label={conversion.primary}
        secondary={conversion.secondary}
        note={vsPrevious}
        noteSecondary={vsPreviousSecondary}
        accent="violet"
        color="var(--color-brand-violet)"
      />
      <KpiTile
        icon={<Coins className="size-5" />}
        value={formatSignedPercent(kpis.costPerLeadChangePct, locale)}
        direction={kpis.costPerLeadChangePct <= 0 ? 'down' : 'up'}
        good={kpis.costPerLeadChangePct <= 0}
        label={cpl.short}
        secondary={cpl.secondary}
        note={`${vsPrevious} · ${t('dashboard:kpi.costPerLeadNote')}`}
        noteSecondary={vsPreviousSecondary}
        accent="cyan"
        color="var(--color-brand-blue)"
      />
      <KpiTile
        icon={<TrendingUp className="size-5" />}
        value={t('common:units.times', { value: formatNumber(kpis.roi, locale, { maximumFractionDigits: 1 }) })}
        label={roi.primary}
        secondary={roi.secondary}
        note={t('dashboard:kpi.roiNote')}
        accent="amber"
        color="var(--color-brand-gold)"
      />
    </section>
  );
}

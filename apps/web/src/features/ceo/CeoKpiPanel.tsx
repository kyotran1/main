import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Coins, Gem, TrendingUp, Users } from 'lucide-react';
import type { KpiSummary } from '@ads-nolimit/shared';
import { useLocale, useTerms } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { formatNumber, formatSignedPercent } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

const PERIOD_KEY: Record<KpiSummary['period'], string> = {
  this_month: 'common:time.thisMonth',
  last_month: 'common:time.lastMonth',
  quarter: 'common:time.thisQuarter',
};

/**
 * "KPI – Chỉ số đánh giá hiệu suất": 4 ô từ store.kpis (tăng trưởng khách hàng tiềm năng,
 * tỷ lệ chuyển đổi, chi phí/khách hàng, ROI). Nhãn song ngữ lấy từ bảng thuật ngữ metric.*.
 */
export function CeoKpiPanel({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const terms = useTerms();
  const kpis = useOfficeStore((s) => s.kpis);

  const leads = terms('metric.leads');
  const conversion = terms('metric.conversion_rate');
  const cpl = terms('metric.cost_per_lead');
  const roi = terms('metric.roi');

  return (
    <Card accent="violet" className={className}>
      <CardHeader
        icon={<BarChart3 className="size-4.5" aria-hidden="true" />}
        title={t('glossary:module.kpi.label')}
        subtitle={kpis ? `${t('glossary:module.kpi.secondary')} · ${t(PERIOD_KEY[kpis.period])} · ${t('ceo:kpi.description')}` : t('glossary:module.kpi.secondary')}
      />
      {!kpis ? (
        <EmptyState title={t('ceo:kpi.empty')} icon={<BarChart3 className="size-7" aria-hidden="true" />} />
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <KpiTile
            icon={<Users className="size-4" aria-hidden="true" />}
            value={formatSignedPercent(kpis.leadsGrowthPct, locale)}
            label={leads.primary}
            secondary={leads.secondary}
            color={kpis.leadsGrowthPct >= 0 ? 'var(--color-brand-green)' : 'var(--color-brand-red)'}
            tooltip={leads.inline}
          />
          <KpiTile
            icon={<TrendingUp className="size-4" aria-hidden="true" />}
            value={formatSignedPercent(kpis.conversionGrowthPct, locale)}
            label={conversion.primary}
            secondary={conversion.secondary}
            color={kpis.conversionGrowthPct >= 0 ? 'var(--color-brand-violet)' : 'var(--color-brand-red)'}
            tooltip={conversion.inline}
          />
          <KpiTile
            icon={<Coins className="size-4" aria-hidden="true" />}
            value={formatSignedPercent(kpis.costPerLeadChangePct, locale)}
            label={cpl.short}
            secondary={cpl.secondary}
            color={kpis.costPerLeadChangePct <= 0 ? 'var(--color-brand-cyan)' : 'var(--color-brand-red)'}
            tooltip={`${cpl.inline}. ${t('ceo:kpi.costPerLeadNote')}`}
          />
          <KpiTile
            icon={<Gem className="size-4" aria-hidden="true" />}
            value={t('common:units.times', { value: formatNumber(kpis.roi, locale, { maximumFractionDigits: 1 }) })}
            label={roi.primary}
            secondary={roi.secondary}
            color="var(--color-brand-gold)"
            tooltip={`${roi.inline}. ${t('ceo:kpi.roiNote')}`}
          />
        </div>
      )}
    </Card>
  );
}

function KpiTile({ icon, value, label, secondary, color, tooltip }: { icon: ReactNode; value: string; label: string; secondary: string; color: string; tooltip: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border p-3"
      style={{
        borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
        background: `linear-gradient(160deg, color-mix(in srgb, ${color} 16%, transparent), transparent 70%)`,
      }}
      title={tooltip}
    >
      <span className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-lg" style={{ color, background: `color-mix(in srgb, ${color} 18%, transparent)` }}>
        {icon}
      </span>
      <p className="pr-8 text-[26px] font-extrabold leading-none tracking-tight" style={{ color }}>
        {value}
      </p>
      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-text">{label}</p>
      <p className="truncate text-[10px] text-text-muted">{secondary}</p>
    </div>
  );
}

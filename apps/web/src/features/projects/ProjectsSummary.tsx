import { useTranslation } from 'react-i18next';
import { FolderKanban, Gauge, Rocket, Wallet } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { StatCard } from '@/components/ui/StatCard';
import { useDerived } from '@/store/hooks';
import { formatCompact, formatPercent } from '@/lib/format';
import { selectProjectsOverview } from './selectors';

/** Bốn thẻ tổng quan đầu trang Dự án – số liệu từ selectProjectsOverview (store duy nhất). */
export function ProjectsSummary() {
  const { t } = useTranslation();
  const locale = useLocale();
  const overview = useDerived(selectProjectsOverview);
  return (
    <section aria-label={t('glossary:module.projects_campaigns.inline')} className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<FolderKanban className="size-5" />}
        value={overview.total}
        label={t('projects:summary.total')}
        secondary={t('projects:summary.totalSecondary')}
        accent="violet"
        color="var(--color-brand-violet)"
      />
      <StatCard
        icon={<Rocket className="size-5" />}
        value={overview.active}
        label={t('projects:summary.active')}
        secondary={t('projects:summary.activeSecondary')}
        accent="cyan"
        color="var(--color-brand-cyan)"
      />
      <StatCard
        icon={<Wallet className="size-5" />}
        value={<span title={`${overview.budget.toLocaleString(locale)} ₫`}>{t('common:units.vnd', { value: formatCompact(overview.budget, locale) })}</span>}
        label={t('projects:summary.budget')}
        secondary={t('projects:summary.budgetSecondary')}
        accent="amber"
        color="var(--color-brand-gold)"
      />
      <StatCard
        icon={<Gauge className="size-5" />}
        value={formatPercent(overview.avgProgress, locale)}
        label={t('projects:summary.avgProgress')}
        secondary={t('projects:summary.avgProgressSecondary')}
        accent="green"
        color="var(--color-brand-green)"
      />
    </section>
  );
}

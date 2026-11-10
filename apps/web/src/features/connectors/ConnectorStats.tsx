import { useTranslation } from 'react-i18next';
import { Cloud, HardDrive, Plug, PlugZap } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useDerived } from '@/store/hooks';
import { formatNumber } from '@/lib/format';
import { StatCard } from '@/components/ui/StatCard';
import { selectConnectorStats } from './selectors';

/** Bốn thẻ thống kê: tổng công cụ, đã kết nối, chạy cục bộ, dịch vụ đám mây. */
export function ConnectorStats() {
  const { t } = useTranslation();
  const locale = useLocale();
  const stats = useDerived(selectConnectorStats);

  return (
    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<Plug className="size-5" aria-hidden="true" />}
        value={formatNumber(stats.total, locale)}
        label={t('connectors:stats.total.label')}
        secondary={t('connectors:stats.total.secondary')}
        accent="cyan"
        color="var(--color-brand-cyan)"
      />
      <StatCard
        icon={<PlugZap className="size-5" aria-hidden="true" />}
        value={formatNumber(stats.connected, locale)}
        label={t('connectors:stats.connected.label')}
        secondary={t('connectors:stats.connected.secondary')}
        accent="green"
        color="var(--color-status-active)"
      />
      <StatCard
        icon={<HardDrive className="size-5" aria-hidden="true" />}
        value={formatNumber(stats.local, locale)}
        label={t('connectors:stats.local.label')}
        secondary={t('connectors:stats.local.secondary')}
        accent="amber"
        color="var(--color-brand-amber)"
      />
      <StatCard
        icon={<Cloud className="size-5" aria-hidden="true" />}
        value={formatNumber(stats.cloud, locale)}
        label={t('connectors:stats.cloud.label')}
        secondary={t('connectors:stats.cloud.secondary')}
        accent="violet"
        color="var(--color-brand-violet)"
      />
    </div>
  );
}

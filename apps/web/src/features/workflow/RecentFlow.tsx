import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';
import { useDerived } from '@/store/hooks';
import { selectRecentActivities } from '@/store/selectors';
import { Card, CardHeader } from '@/components/ui/Card';
import { ActivityList } from '@/features/activity/ActivityItem';

/** "Luồng gần đây": 8 hoạt động mới nhất (ActivityList) – cùng nguồn với Nhật ký hoạt động. */
export function RecentFlow({ className }: { className?: string }) {
  const { t } = useTranslation();
  const items = useDerived(selectRecentActivities(8));
  return (
    <Card accent="green" className={className}>
      <CardHeader
        icon={<Activity className="size-4.5" aria-hidden="true" />}
        title={t('workflow:recent.title')}
        subtitle={`${t('workflow:recent.secondary')} · ${t('workflow:recent.description')}`}
        action={
          <Link
            to="/activity"
            className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-cyan hover:underline focus-visible:focus-ring"
            title={`${t('workflow:recent.viewAll')} – ${t('workflow:recent.viewAllSecondary')}`}
          >
            <span className="hidden sm:inline">{t('workflow:recent.viewAll')}</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />
      <ActivityList items={items} compact />
    </Card>
  );
}

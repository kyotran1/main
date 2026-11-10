import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ActivityList } from '@/features/activity/ActivityItem';
import { useDerived } from '@/store/hooks';
import { selectRecentActivities } from '@/store/selectors';
import { ViewAllLink } from './KeyTasksCard';

/** "Hoạt động AI gần đây": 6 sự kiện mới nhất từ selectRecentActivities(6). */
export function RecentActivitiesCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const activities = useDerived(selectRecentActivities(6));
  return (
    <Card accent="violet" className={clsx('flex flex-col', className)}>
      <CardHeader
        icon={<Zap className="size-4.5" />}
        title={t('glossary:module.recent_activities.label')}
        subtitle={t('glossary:module.recent_activities.secondary')}
        action={<ViewAllLink to="/activity" label={t('glossary:action.view_log.label')} compact />}
      />
      {activities.length === 0 ? (
        <EmptyState title={t('overview:activities.empty')} description={t('overview:activities.emptyDescription')} icon={<Zap className="size-7" />} />
      ) : (
        <ActivityList items={activities} compact />
      )}
    </Card>
  );
}

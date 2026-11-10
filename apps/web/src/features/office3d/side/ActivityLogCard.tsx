import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { bilingual } from '@ads-nolimit/i18n';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useDerived } from '@/store/hooks';
import { selectRecentActivities } from '@/store/selectors';
import { Card, CardHeader } from '@/components/ui/Card';
import { ActivityList } from '@/features/activity/ActivityItem';

/** Nhật ký hoạt động rút gọn (5 mục) – dùng chung ActivityList để câu chữ khớp mọi trang. */
export function ActivityLogCard() {
  const locale = useLocale();
  const items = useDerived(selectRecentActivities(5));
  const title = bilingual('module.activity_log', locale);
  const viewAll = bilingual('action.view_all', locale);
  return (
    <Card>
      <CardHeader
        icon={<Activity className="size-4" />}
        title={title.primary}
        subtitle={title.secondary}
        action={
          <Link to="/activity" className="text-xs font-semibold text-brand-cyan hover:underline focus-visible:focus-ring" title={viewAll.inline}>
            {viewAll.primary}
          </Link>
        }
      />
      <ActivityList items={items} compact />
    </Card>
  );
}

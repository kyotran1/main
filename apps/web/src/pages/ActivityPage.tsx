import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, SearchX } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useOfficeStore } from '@/store/officeStore';
import { useAgents } from '@/store/hooks';
import { PageLoading } from '@/features/overview/PageLoading';
import { useActivityText } from '@/features/activity/ActivityItem';
import { ActivityFilterBar } from '@/features/activity/ActivityFilterBar';
import { ActivityTimeline } from '@/features/activity/ActivityTimeline';
import { RealtimeIndicator } from '@/features/activity/RealtimeIndicator';
import { EMPTY_FILTER, filterActivities, type ActivityFilterState } from '@/features/activity/activityFilters';

const PAGE_SIZE = 20;

/**
 * TRANG NHẬT KÝ HOẠT ĐỘNG – toàn bộ store.activities (mới nhất trước) với bộ lọc nhân sự /
 * loại sự kiện / từ khóa, nhóm theo ngày, tải thêm và chỉ báo realtime.
 */
export default function ActivityPage() {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);
  const activities = useOfficeStore((s) => s.activities);
  const agents = useAgents();
  const toText = useActivityText();
  const [filter, setFilter] = useState<ActivityFilterState>(EMPTY_FILTER);
  const [limit, setLimit] = useState(PAGE_SIZE);

  // Chỉ nhân sự có xuất hiện trong nhật ký mới hiện trong bộ lọc (ổn định theo thứ tự id).
  const agentsInLog = useMemo(() => {
    const ids = new Set(activities.map((a) => a.agentId).filter(Boolean));
    return agents.filter((a) => ids.has(a.id)).sort((a, b) => a.id.localeCompare(b.id));
  }, [activities, agents]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filtered = useMemo(() => filterActivities(activities, filter, toText), [activities, filter, agents]);

  const updateFilter = (next: ActivityFilterState) => {
    setFilter(next);
    setLimit(PAGE_SIZE);
  };
  const dirty = filter.agentId !== 'all' || filter.kind !== 'all' || filter.query.trim() !== '';

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader termId="module.activity_log" icon={<Activity className="size-5" />} description={t('activity:description')} actions={<RealtimeIndicator />} />

      {!hydrated ? (
        <PageLoading message={t('activity:loading')} />
      ) : (
        <>
          <ActivityFilterBar agents={agentsInLog} value={filter} onChange={updateFilter} shown={filtered.length} total={activities.length} />

          {activities.length === 0 ? (
            <Card>
              <EmptyState icon={<Activity className="size-7" />} title={t('activity:empty')} description={t('activity:emptyDescription')} />
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={<SearchX className="size-7" />}
                title={t('activity:emptyFiltered')}
                description={t('activity:emptyFilteredDescription')}
                action={
                  dirty ? (
                    <Button variant="outline" size="sm" onClick={() => updateFilter(EMPTY_FILTER)}>
                      {t('activity:filterBar.clear')}
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <ActivityTimeline items={filtered} limit={limit} onLoadMore={() => setLimit((n) => n + PAGE_SIZE)} />
          )}
        </>
      )}
    </div>
  );
}

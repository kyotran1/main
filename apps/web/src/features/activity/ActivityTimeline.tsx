import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronDown } from 'lucide-react';
import type { ActivityEvent } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { Button } from '@/components/ui/Button';
import { formatLongDate } from '@/lib/format';
import { ActivityList } from './ActivityItem';
import { groupByDay, relativeDayLabel } from './activityFilters';

/**
 * Dòng thời gian nhóm theo ngày (Hôm nay / Hôm qua / ngày đầy đủ) + nút tải thêm.
 * `items` đã được lọc; `limit` là số mục đang hiển thị.
 */
export function ActivityTimeline({ items, limit, onLoadMore }: { items: ActivityEvent[]; limit: number; onLoadMore: () => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const visible = items.slice(0, limit);
  const remaining = items.length - visible.length;
  const groups = groupByDay(visible);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => {
        const rel = relativeDayLabel(group.dayKey);
        const heading = rel ? t(`activity:groups.${rel}`) : formatLongDate(group.sampleIso, locale);
        const sub = rel ? formatLongDate(group.sampleIso, locale) : null;
        return (
          <section key={group.dayKey} aria-label={heading} className="glass p-3 md:p-4">
            <header className="mb-1 flex items-center gap-2.5 border-b border-line/60 pb-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15 text-brand-cyan ring-1 ring-brand-cyan/30">
                <CalendarDays className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-bold text-text">{heading}</h2>
                {sub ? <p className="truncate text-[11px] text-text-muted">{sub}</p> : null}
              </div>
              <span className="shrink-0 rounded-full border border-line bg-white/[0.03] px-2 py-0.5 text-[11px] font-semibold text-text-muted tabular-nums">{t('activity:filterBar.result', { count: group.items.length })}</span>
            </header>
            <ActivityList items={group.items} />
          </section>
        );
      })}
      {remaining > 0 ? (
        <div className="flex justify-center">
          <Button variant="outline" size="md" icon={<ChevronDown className="size-4" />} onClick={onLoadMore}>
            {t('activity:loadMoreRemaining', { count: remaining })}
          </Button>
        </div>
      ) : items.length > 0 ? (
        <p className="py-1 text-center text-xs text-text-dim">{t('activity:endOfList')}</p>
      ) : null}
    </div>
  );
}

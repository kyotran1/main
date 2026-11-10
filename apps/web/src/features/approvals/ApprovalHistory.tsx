import { useTranslation } from 'react-i18next';
import { History } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForApprovalType } from '@ads-nolimit/i18n';
import { useDerived } from '@/store/hooks';
import { formatDate, formatTime } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ApprovalStatusBadge } from '@/components/domain/StatusBadges';
import { selectDecidedApprovals } from './selectors';

const LIMIT = 12;

/** Lịch sử quyết định của Chủ doanh nghiệp: trạng thái, tiêu đề, thời điểm và ghi chú. */
export function ApprovalHistory({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const items = useDerived(selectDecidedApprovals).slice(0, LIMIT);
  return (
    <Card accent="violet" className={className}>
      <CardHeader icon={<History className="size-4.5" aria-hidden="true" />} title={t('approvals:history.title')} subtitle={`${t('approvals:history.secondary')} · ${t('approvals:history.description')}`} />
      {items.length === 0 ? (
        <EmptyState title={t('approvals:history.empty')} icon={<History className="size-7" aria-hidden="true" />} />
      ) : (
        <ol className="relative ml-2 flex flex-col gap-4 border-l border-line/70 pl-4">
          {items.map((a) => {
            const type = bilingual(termIdForApprovalType(a.type), locale);
            const color = a.status === 'approved' ? 'var(--color-status-done)' : 'var(--color-status-error)';
            const when = a.decidedAt ?? a.createdAt;
            return (
              <li key={a.id} className="relative">
                <span aria-hidden="true" className="absolute -left-[21px] top-1.5 size-2.5 rounded-full ring-2 ring-bg-panel" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                <div className="flex flex-wrap items-center gap-2">
                  <ApprovalStatusBadge status={a.status} />
                  <span className="text-[11px] text-text-muted" title={type.inline}>
                    {type.primary}
                  </span>
                  <time dateTime={when} className="ml-auto text-[11px] text-text-dim tabular-nums">
                    {formatDate(when, locale)} {formatTime(when, locale)}
                  </time>
                </div>
                <p className="mt-1 text-[13px] font-semibold leading-snug text-text [overflow-wrap:anywhere]">{a.title}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {a.decisionNote ? <span className="italic">“{a.decisionNote}”</span> : t('approvals:card.noNote')}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

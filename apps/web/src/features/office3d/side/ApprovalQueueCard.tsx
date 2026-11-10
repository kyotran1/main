import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck, X } from 'lucide-react';
import { bilingual, termIdForApprovalType } from '@ads-nolimit/i18n';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { selectPendingApprovals } from '@/store/selectors';
import { api } from '@/lib/api';
import { formatRelative, formatVnd } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useAgentDisplayName } from '@/components/domain/AgentName';

type Decision = 'approve' | 'reject';

/** Ba yêu cầu chờ duyệt gần nhất với nút Duyệt / Từ chối – store tự cập nhật qua realtime sau khi gọi API. */
export function ApprovalQueueCard() {
  const { t } = useTranslation();
  const locale = useLocale();
  const pending = useDerived(selectPendingApprovals);
  const agents = useOfficeStore((s) => s.agents);
  const displayName = useAgentDisplayName();
  const [busy, setBusy] = useState<Record<string, Decision>>({});
  const [error, setError] = useState<unknown>(null);
  const title = bilingual('module.approval_center', locale);
  const approve = bilingual('action.approve', locale);
  const reject = bilingual('action.reject', locale);
  const viewAll = bilingual('action.view_all', locale);
  const top = pending.slice(0, 3);

  const decide = async (id: string, decision: Decision) => {
    setBusy((b) => ({ ...b, [id]: decision }));
    setError(null);
    try {
      await api.decideApproval(id, decision);
    } catch (err) {
      setError(err);
    } finally {
      setBusy((b) => {
        const { [id]: _done, ...rest } = b;
        return rest;
      });
    }
  };

  return (
    <Card accent={pending.length ? 'amber' : 'none'}>
      <CardHeader
        icon={<ShieldCheck className="size-4" />}
        title={title.primary}
        subtitle={title.secondary}
        action={
          pending.length ? (
            <Badge color="var(--color-brand-amber)" size="sm" dot pulse title={t('office3d:approvals.pending', { count: pending.length })}>
              {t('office3d:approvals.pendingShort', { count: pending.length })}
            </Badge>
          ) : null
        }
      />
      {top.length === 0 ? (
        <EmptyState title={t('office3d:approvals.empty')} icon={<ShieldCheck className="size-7" />} />
      ) : (
        <ul className="divide-y divide-line/60">
          {top.map((a) => {
            const type = bilingual(termIdForApprovalType(a.type), locale);
            const current = busy[a.id];
            return (
              <li key={a.id} className="flex flex-col gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-text" title={a.title}>
                    {a.title}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-text-muted">
                    <span title={type.inline}>{type.primary}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{t('office3d:approvals.requestedBy', { name: displayName(agents[a.requestedBy]) })}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={a.createdAt}>{formatRelative(a.createdAt, t)}</time>
                  </p>
                  {a.amountVnd ? <p className="mt-0.5 text-[11px] font-semibold text-brand-amber">{t('office3d:approvals.amount', { amount: formatVnd(a.amountVnd, locale) })}</p> : null}
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <Button size="sm" variant="success" icon={<Check className="size-3.5" />} loading={current === 'approve'} disabled={!!current} onClick={() => void decide(a.id, 'approve')} title={approve.inline}>
                    {approve.primary}
                  </Button>
                  <Button size="sm" variant="danger" icon={<X className="size-3.5" />} loading={current === 'reject'} disabled={!!current} onClick={() => void decide(a.id, 'reject')} title={reject.inline}>
                    {reject.primary}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {error ? (
        <div className="mt-3">
          <ErrorBanner error={error} />
        </div>
      ) : null}
      {pending.length > top.length ? (
        <Link to="/approvals" className="mt-2 inline-block text-xs font-semibold text-brand-cyan hover:underline focus-visible:focus-ring" title={viewAll.inline}>
          {viewAll.primary} ({pending.length})
        </Link>
      ) : null}
    </Card>
  );
}

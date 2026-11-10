import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { Approval, ApprovalType } from '@ads-nolimit/shared';
import { useLocale, useTerms } from '@ads-nolimit/i18n/react';
import { termIdForApprovalType } from '@ads-nolimit/i18n';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { AgentName } from '@/components/domain/AgentName';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { selectPendingApprovals } from '@/store/selectors';
import { api } from '@/lib/api';
import { formatRelative, formatVnd } from '@/lib/format';
import { ViewAllLink } from '@/features/overview/KeyTasksCard';

/** Màu theo loại phê duyệt – cố định theo thực thể. */
const TYPE_COLOR: Record<ApprovalType, string> = {
  plan: 'var(--color-brand-violet)',
  budget: 'var(--color-brand-amber)',
  content: 'var(--color-brand-cyan)',
  publish: 'var(--color-brand-green)',
  connector: 'var(--color-brand-magenta)',
};

const LIMIT = 3;

type Decision = 'approve' | 'reject';

/**
 * "Trung tâm phê duyệt" rút gọn: 3 yêu cầu chờ duyệt sớm nhất (selectPendingApprovals)
 * với nút Duyệt / Từ chối gọi api.decideApproval; lỗi hiển thị bằng ErrorBanner.
 */
export function ApprovalsQuickPanel({ className }: { className?: string }) {
  const { t } = useTranslation();
  const pending = useDerived(selectPendingApprovals);
  const [busy, setBusy] = useState<{ id: string; decision: Decision } | null>(null);
  const [error, setError] = useState<unknown>(null);

  const decide = async (approval: Approval, decision: Decision) => {
    setBusy({ id: approval.id, decision });
    setError(null);
    try {
      await api.decideApproval(approval.id, decision);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  const shown = pending.slice(0, LIMIT);
  const more = pending.length - shown.length;

  return (
    <Card accent="amber" className={clsx('flex flex-col', className)}>
      <CardHeader
        icon={<ShieldCheck className="size-4.5" />}
        title={t('glossary:module.approval_center.label')}
        subtitle={t('glossary:module.approval_center.secondary')}
        action={<ViewAllLink to="/approvals" label={t('glossary:action.view_all.label')} compact />}
      />

      {error ? (
        <div className="mb-3">
          <ErrorBanner error={error} />
        </div>
      ) : null}

      {shown.length === 0 ? (
        <EmptyState title={t('dashboard:approvals.empty')} description={t('dashboard:approvals.emptyDescription')} icon={<ShieldCheck className="size-7" />} />
      ) : (
        <>
          <Badge color="var(--color-status-waiting)" dot pulse className="mb-3 self-start">
            {t('dashboard:approvals.pendingCount', { count: pending.length })}
          </Badge>
          <ul className="flex flex-col gap-2.5">
            {shown.map((approval) => (
              <ApprovalRow key={approval.id} approval={approval} busy={busy?.id === approval.id ? busy.decision : null} onDecide={(d) => void decide(approval, d)} />
            ))}
          </ul>
          {more > 0 ? (
            <Link to="/approvals" className="mt-3 text-xs font-semibold text-text-muted hover:text-text">
              {t('dashboard:approvals.moreCount', { count: more })}
            </Link>
          ) : null}
        </>
      )}
    </Card>
  );
}

function ApprovalRow({ approval, busy, onDecide }: { approval: Approval; busy: Decision | null; onDecide: (decision: Decision) => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const terms = useTerms();
  const requester = useOfficeStore((s) => s.agents[approval.requestedBy]);
  const type = terms(termIdForApprovalType(approval.type));
  const color = TYPE_COLOR[approval.type];

  return (
    <li className="rounded-xl border border-line bg-white/[0.03] p-3">
      <div className="flex items-center justify-between gap-2">
        <Badge color={color} size="sm" title={type.inline}>
          {type.primary}
        </Badge>
        <time dateTime={approval.createdAt} className="shrink-0 text-[11px] text-text-dim" title={new Date(approval.createdAt).toLocaleString(locale)}>
          {formatRelative(approval.createdAt, t)}
        </time>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-text">{approval.title}</p>
      <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-text-muted">
        <span className="min-w-0 truncate">
          {t('dashboard:approvals.requestedBy')}: {requester ? <AgentName agent={requester} format="primary" className="font-semibold text-text" /> : t('common:labels.unknown')}
        </span>
        {approval.amountVnd ? (
          <span className="shrink-0 font-semibold text-brand-amber" title={t('glossary:metric.budget.inline')}>
            {t('dashboard:approvals.amount')}: {formatVnd(approval.amountVnd, locale)}
          </span>
        ) : null}
      </p>
      <div className="mt-2.5 flex gap-2">
        <Button
          variant="success"
          size="sm"
          className="flex-1"
          icon={<Check className="size-3.5" />}
          loading={busy === 'approve'}
          disabled={busy !== null}
          onClick={() => onDecide('approve')}
          title={t('dashboard:approvals.approveTitle', { title: approval.title })}
        >
          {t('glossary:action.approve.label')}
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="flex-1"
          icon={<X className="size-3.5" />}
          loading={busy === 'reject'}
          disabled={busy !== null}
          onClick={() => onDecide('reject')}
          title={t('dashboard:approvals.rejectTitle', { title: approval.title })}
        >
          {t('glossary:action.reject.label')}
        </Button>
      </div>
    </li>
  );
}

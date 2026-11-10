import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Check, ExternalLink, FolderKanban, MessageSquareText, Wallet, X } from 'lucide-react';
import type { Approval } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForApprovalType } from '@ads-nolimit/i18n';
import { useOfficeStore } from '@/store/officeStore';
import { formatDate, formatRelative, formatTime, formatVnd } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName } from '@/components/domain/AgentName';
import { ApprovalStatusBadge } from '@/components/domain/StatusBadges';
import { useApprovalDecision } from './useApprovalDecision';

const TYPE_COLOR: Record<Approval['type'], string> = {
  plan: 'var(--color-brand-violet)',
  budget: 'var(--color-brand-gold)',
  content: 'var(--color-brand-cyan)',
  publish: 'var(--color-brand-magenta)',
  connector: 'var(--color-brand-teal)',
};

/**
 * Một yêu cầu phê duyệt: loại + trạng thái, tiêu đề/tóm tắt (dữ liệu từ Agent), người đề xuất,
 * công việc/dự án liên quan, số tiền, thời gian; với yêu cầu đang chờ có nút Duyệt / Từ chối
 * mở ô ghi chú rồi xác nhận (api.decideApproval).
 */
export function ApprovalCard({ approval }: { approval: Approval }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const requester = useOfficeStore((s) => s.agents[approval.requestedBy]);
  const task = useOfficeStore((s) => (approval.taskId ? s.tasks[approval.taskId] : undefined));
  const project = useOfficeStore((s) => (approval.projectId ? s.projects[approval.projectId] : undefined));
  const selectTask = useOfficeStore((s) => s.selectTask);
  const decision = useApprovalDecision(approval.id);
  const type = bilingual(termIdForApprovalType(approval.type), locale);
  const pending = approval.status === 'pending';
  const typeColor = TYPE_COLOR[approval.type];

  return (
    <article
      className={clsx('glass relative overflow-hidden p-4 md:p-5', pending ? 'neon-border-amber' : 'opacity-95')}
      aria-labelledby={`approval-${approval.id}-title`}
    >
      {/* Vạch màu theo loại yêu cầu */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1" style={{ background: typeColor, boxShadow: `0 0 12px ${typeColor}` }} />

      <div className="flex flex-wrap items-center gap-2">
        <ApprovalStatusBadge status={approval.status} />
        <Badge color={typeColor} title={type.inline}>
          {type.primary}
        </Badge>
        <time dateTime={approval.createdAt} className="ml-auto text-[11px] text-text-dim" title={`${formatDate(approval.createdAt, locale)} ${formatTime(approval.createdAt, locale)}`}>
          {t('approvals:card.createdAt', { time: formatRelative(approval.createdAt, t) })}
        </time>
      </div>

      <h3 id={`approval-${approval.id}-title`} className="mt-2.5 text-[15px] font-bold leading-snug text-text [overflow-wrap:anywhere]">
        {approval.title}
      </h3>
      {approval.summary ? <p className="mt-1 text-sm leading-relaxed text-text-muted [overflow-wrap:anywhere]">{approval.summary}</p> : null}

      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-2">
          <dt className="shrink-0 text-text-dim" title={`${t('approvals:card.requestedBySecondary')} – ${t('approvals:card.requestedBy')}`}>
            {t('approvals:card.requestedBy')}:
          </dt>
          <dd className="flex min-w-0 items-center gap-1.5">
            {requester ? (
              <>
                <AgentAvatar agent={requester} size={20} showStatus={false} />
                <AgentName agent={requester} format="inline" className="truncate font-semibold text-text" />
              </>
            ) : (
              <span className="text-text-muted">{t('common:labels.unknown')}</span>
            )}
          </dd>
        </div>
        {task ? (
          <div className="flex min-w-0 items-center gap-2">
            <dt className="shrink-0 text-text-dim" title={`${t('approvals:card.linkedTaskSecondary')} – ${t('approvals:card.linkedTask')}`}>
              {t('approvals:card.linkedTask')}:
            </dt>
            <dd className="min-w-0">
              <button
                type="button"
                onClick={() => selectTask(task.id)}
                className="inline-flex max-w-full items-center gap-1 rounded text-brand-cyan hover:underline focus-visible:focus-ring"
                title={t('approvals:card.openTask', { title: task.title })}
              >
                <span className="truncate">{task.title}</span>
                <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
              </button>
            </dd>
          </div>
        ) : null}
        {project ? (
          <div className="flex min-w-0 items-center gap-2">
            <dt className="shrink-0 text-text-dim" title={`${t('approvals:card.projectSecondary')} – ${t('approvals:card.project')}`}>
              <FolderKanban className="inline size-3.5 align-text-bottom" aria-hidden="true" /> {t('approvals:card.project')}:
            </dt>
            <dd className="truncate text-text">{project.name}</dd>
          </div>
        ) : null}
        {approval.amountVnd !== undefined ? (
          <div className="flex min-w-0 items-center gap-2">
            <dt className="shrink-0 text-text-dim" title={`${t('approvals:card.amountSecondary')} – ${t('approvals:card.amount')}`}>
              <Wallet className="inline size-3.5 align-text-bottom" aria-hidden="true" /> {t('approvals:card.amount')}:
            </dt>
            <dd className="text-sm font-extrabold text-brand-gold tabular-nums">{formatVnd(approval.amountVnd, locale)}</dd>
          </div>
        ) : null}
      </dl>

      {decision.error ? (
        <div className="mt-3">
          <ErrorBanner error={decision.error} onRetry={() => void decision.confirm()} />
        </div>
      ) : null}

      {pending ? (
        <div className="mt-4">
          {decision.mode ? (
            <DecisionForm approvalId={approval.id} decision={decision} />
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="success" size="sm" icon={<Check className="size-4" aria-hidden="true" />} onClick={() => decision.open('approve')} title={`${t('approvals:decision.approve')} – ${t('approvals:decision.approveSecondary')}`}>
                {t('approvals:decision.approve')}
              </Button>
              <Button variant="danger" size="sm" icon={<X className="size-4" aria-hidden="true" />} onClick={() => decision.open('reject')} title={`${t('approvals:decision.reject')} – ${t('approvals:decision.rejectSecondary')}`}>
                {t('approvals:decision.reject')}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <DecisionOutcome approval={approval} />
      )}
      {decision.done && !pending ? (
        <p role="status" className="mt-2 text-xs font-semibold text-brand-green">
          {t('approvals:decision.done')}
        </p>
      ) : null}
    </article>
  );
}

function DecisionForm({ approvalId, decision }: { approvalId: string; decision: ReturnType<typeof useApprovalDecision> }) {
  const { t } = useTranslation();
  const approve = decision.mode === 'approve';
  const inputId = `approval-note-${approvalId}`;
  return (
    <form
      className={clsx('rounded-xl border p-3', approve ? 'border-brand-green/50 bg-brand-green/5' : 'border-brand-red/50 bg-brand-red/5')}
      onSubmit={(e) => {
        e.preventDefault();
        void decision.confirm();
      }}
    >
      <label htmlFor={inputId} className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-text">
        <MessageSquareText className="size-3.5 text-text-muted" aria-hidden="true" />
        {t('approvals:decision.noteLabel')}
      </label>
      <textarea
        id={inputId}
        value={decision.note}
        onChange={(e) => decision.setNote(e.target.value)}
        rows={2}
        maxLength={2000}
        autoFocus
        placeholder={approve ? t('approvals:decision.notePlaceholderApprove') : t('approvals:decision.notePlaceholderReject')}
        className="w-full resize-y rounded-lg border border-line bg-bg-deep/70 px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-brand-cyan/60 focus:outline-none"
        disabled={decision.busy}
      />
      <p className="mt-1.5 text-[11px] text-text-muted">{approve ? t('approvals:decision.approveHint') : t('approvals:decision.rejectHint')}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <Button type="submit" variant={approve ? 'success' : 'danger'} size="sm" loading={decision.busy} icon={approve ? <Check className="size-4" aria-hidden="true" /> : <X className="size-4" aria-hidden="true" />}>
          {decision.busy ? t('approvals:decision.processing') : approve ? t('approvals:decision.confirmApprove') : t('approvals:decision.confirmReject')}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={decision.cancel} disabled={decision.busy}>
          {t('approvals:decision.cancel')}
        </Button>
      </div>
    </form>
  );
}

function DecisionOutcome({ approval }: { approval: Approval }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const approved = approval.status === 'approved';
  const color = approved ? 'var(--color-status-done)' : 'var(--color-status-error)';
  return (
    <div className="mt-3 rounded-xl border border-line/70 bg-white/[0.03] p-3 text-xs">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-text-muted">
        <span className="font-semibold" style={{ color }}>
          {t('approvals:history.decidedBy')}
        </span>
        {approval.decidedAt ? (
          <time dateTime={approval.decidedAt}>
            {t('approvals:card.decidedAt', { time: `${formatDate(approval.decidedAt, locale)} ${formatTime(approval.decidedAt, locale)}` })}
          </time>
        ) : null}
      </p>
      <p className="mt-1 text-text" title={`${t('approvals:card.noteSecondary')} – ${t('approvals:card.note')}`}>
        <span className="text-text-dim">{t('approvals:card.note')}: </span>
        {approval.decisionNote ? <span className="italic">“{approval.decisionNote}”</span> : <span className="text-text-dim">{t('approvals:card.noNote')}</span>}
      </p>
    </div>
  );
}

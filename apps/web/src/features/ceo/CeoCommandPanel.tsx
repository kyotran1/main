import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { CheckCircle2, Crown, Eye, ListChecks, Rocket, Send, Target, UserRound } from 'lucide-react';
import type { Agent, ChatMessage } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { selectMessagesForAgent } from '@/store/selectors';
import { api } from '@/lib/api';
import { formatPercent, formatTime } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName } from '@/components/domain/AgentName';
import { AgentStatusBadge, TaskStatusBadge } from '@/components/domain/StatusBadges';
import { selectLatestPlan, type PlanSummary } from './selectors';

/**
 * CỘT TRÁI – "Bàn làm việc" của Chủ doanh nghiệp với AI CEO:
 * hồ sơ AI CEO → lịch sử hội thoại → kế hoạch mới nhất (phê duyệt tại chỗ) → ô nhập yêu cầu.
 * Dữ liệu từ store (realtime); gửi yêu cầu qua api.createCeoRequest, store tự cập nhật.
 */
export function CeoCommandPanel({ ceo }: { ceo: Agent }) {
  return (
    <Card accent="violet" strong padded={false} className="@container flex flex-col overflow-hidden">
      <CeoProfile ceo={ceo} />
      <CeoConversation ceo={ceo} />
      <PlanSummaryCard ceoId={ceo.id} />
      <CeoComposer ceo={ceo} />
    </Card>
  );
}

// ───────────────────────── Hồ sơ AI CEO ─────────────────────────
function CeoProfile({ ceo }: { ceo: Agent }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  return (
    <div className="relative overflow-hidden border-b border-line/70 p-4">
      {/* Vầng sáng vàng – màu chức vụ AI CEO */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -left-10 size-44 rounded-full opacity-40 blur-3xl"
        style={{ background: 'var(--color-brand-gold)' }}
      />
      <div className="relative flex items-start gap-3.5">
        <button
          type="button"
          onClick={() => selectAgent(ceo.id)}
          className="shrink-0 rounded-full focus-visible:focus-ring"
          aria-label={t('ceo:profile.openProfile')}
          title={`${t('ceo:profile.openProfile')} – ${t('ceo:profile.openProfileSecondary')}`}
        >
          <AgentAvatar agent={ceo} size={64} />
        </button>
        <div className="min-w-0 flex-1">
          <AgentName agent={ceo} className="text-lg [&_.term-secondary]:text-sm" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <AgentStatusBadge status={ceo.status} />
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-2.5 py-1 text-xs font-semibold text-brand-gold"
              title={`${t('ceo:profile.performance')} – ${t('ceo:profile.performanceSecondary')}`}
            >
              <Crown className="size-3" aria-hidden="true" />
              {t('ceo:profile.performance')}: {formatPercent(ceo.performance, locale)}
            </span>
          </div>
          <p className="mt-1.5 truncate text-[11px] text-text-muted" title={`${t('ceo:profile.tasksCompleted')} – ${t('ceo:profile.tasksCompletedSecondary')}`}>
            {t('ceo:profile.tasksCompleted')}: {ceo.tasksCompleted} · {ceo.model.provider}/{ceo.model.model}
          </p>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Hội thoại ─────────────────────────
const MAX_VISIBLE_MESSAGES = 30;

function CeoConversation({ ceo }: { ceo: Agent }) {
  const { t } = useTranslation();
  const messages = useDerived(selectMessagesForAgent(ceo.id), [ceo.id]);
  const visible = messages.slice(-MAX_VISIBLE_MESSAGES);
  const listRef = useRef<HTMLDivElement>(null);

  // Tự cuộn xuống tin mới nhất khi có tin nhắn mới.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visible.length]);

  return (
    <section aria-label={`${t('ceo:chat.title')} – ${t('ceo:chat.secondary')}`} className="border-b border-line/70">
      <div ref={listRef} className="flex max-h-[300px] min-h-[140px] flex-col gap-3 overflow-y-auto p-4">
        {visible.length === 0 ? (
          <p className="m-auto max-w-[260px] text-center text-xs text-text-muted">{t('ceo:chat.empty')}</p>
        ) : (
          visible.map((m) => <MessageBubble key={m.id} message={m} ceo={ceo} />)
        )}
      </div>
    </section>
  );
}

function MessageBubble({ message, ceo }: { message: ChatMessage; ceo: Agent }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const selectTask = useOfficeStore((s) => s.selectTask);
  const isOwner = message.from === 'owner';
  const related = message.relatedTaskIds ?? [];
  const firstRelated = related[0];
  return (
    <div className={clsx('flex max-w-[92%] items-end gap-2', isOwner ? 'self-end flex-row-reverse' : 'self-start')}>
      {isOwner ? (
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-violet to-brand-purple text-white ring-2 ring-bg-panel"
          title={`${t('ceo:chat.owner')} – ${t('ceo:chat.ownerSecondary')}`}
          aria-hidden="true"
        >
          <UserRound className="size-3.5" />
        </span>
      ) : (
        <AgentAvatar agent={ceo} size={28} showStatus={false} />
      )}
      <div className="min-w-0">
        <div
          className={clsx(
            'rounded-2xl px-3 py-2 text-[13px] leading-relaxed',
            isOwner
              ? 'rounded-br-sm bg-gradient-to-br from-brand-violet/80 to-brand-purple/60 text-white shadow-[0_0_18px_rgba(139,92,246,0.25)]'
              : 'rounded-bl-sm border border-line bg-white/[0.04] text-text',
          )}
        >
          <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{message.text}</p>
          {firstRelated ? (
            <button
              type="button"
              onClick={() => selectTask(firstRelated)}
              className={clsx(
                'mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold focus-visible:focus-ring',
                isOwner ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/20',
              )}
            >
              <ListChecks className="size-3" aria-hidden="true" />
              {t('ceo:chat.relatedTasks', { count: related.length })}
            </button>
          ) : null}
        </div>
        <time dateTime={message.createdAt} className={clsx('mt-1 block text-[10px] text-text-dim', isOwner && 'text-right')}>
          {formatTime(message.createdAt, locale)}
        </time>
      </div>
    </div>
  );
}

// ───────────────────────── Kế hoạch (Tóm tắt) ─────────────────────────
function PlanSummaryCard({ ceoId }: { ceoId: string }) {
  const { t } = useTranslation();
  const plan = useDerived(selectLatestPlan(ceoId), [ceoId]);

  return (
    <section aria-label={`${t('ceo:plan.title')} – ${t('ceo:plan.secondary')}`} className="border-b border-line/70 p-4">
      <div className="rounded-2xl border border-brand-violet/40 bg-gradient-to-br from-brand-violet/20 via-bg-panel-2/60 to-brand-cyan/10 p-3.5 shadow-[0_0_28px_rgba(139,92,246,0.18)]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 shrink-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-violet/25 text-brand-cyan ring-1 ring-white/10">
              <Target className="size-4" aria-hidden="true" />
            </span>
            <span className="term-stack">
              <span className="term-primary text-sm">{t('ceo:plan.title')}</span>
              <span className="term-secondary">{t('ceo:plan.secondary')}</span>
            </span>
          </div>
          {plan ? (
            <span className="ml-auto">
              <PlanStateChip plan={plan} />
            </span>
          ) : null}
        </div>
        {plan ? <PlanBody plan={plan} /> : <p className="mt-3 text-xs leading-relaxed text-text-muted">{t('ceo:plan.empty')}</p>}
      </div>
    </section>
  );
}

function PlanStateChip({ plan }: { plan: PlanSummary }) {
  const { t } = useTranslation();
  const status = plan.approval?.status;
  if (!status) return <TaskStatusBadge status={plan.task.status} />;
  const map = {
    pending: { label: t('ceo:plan.awaitingApproval'), secondary: t('ceo:plan.awaitingApprovalSecondary'), color: 'var(--color-status-waiting)' },
    approved: { label: t('ceo:plan.approved'), secondary: t('ceo:plan.approvedSecondary'), color: 'var(--color-status-done)' },
    rejected: { label: t('ceo:plan.rejected'), secondary: t('ceo:plan.rejectedSecondary'), color: 'var(--color-status-error)' },
  } as const;
  const item = map[status];
  return (
    <span
      className="inline-flex max-w-[150px] items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
      style={{ color: item.color, borderColor: `color-mix(in srgb, ${item.color} 45%, transparent)`, background: `color-mix(in srgb, ${item.color} 14%, transparent)` }}
      title={`${item.label} – ${item.secondary}`}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
      <span className="truncate">{item.label}</span>
    </span>
  );
}

function PlanBody({ plan }: { plan: PlanSummary }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const selectTask = useOfficeStore((s) => s.selectTask);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [justApproved, setJustApproved] = useState(false);

  const items = plan.outline.length ? plan.outline : plan.children.map((c) => c.title);
  const pending = plan.approval?.status === 'pending' ? plan.approval : undefined;

  const approve = async () => {
    if (!pending) return;
    setApproving(true);
    setError(null);
    try {
      await api.decideApproval(pending.id, 'approve');
      setJustApproved(true);
      setTimeout(() => setJustApproved(false), 5000);
    } catch (err) {
      setError(err);
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="mt-3">
      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-text">{plan.task.title}</h3>
      {plan.summary ? <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-text-muted">{plan.summary}</p> : null}
      {items.length ? (
        <ol className="mt-2.5 flex flex-col gap-1.5">
          {items.slice(0, 6).map((item, idx) => (
            <li key={`${idx}-${item}`} className="flex items-start gap-2 text-xs leading-snug text-text">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-green" aria-hidden="true" />
              <span className="min-w-0 [overflow-wrap:anywhere]">
                <span className="mr-1 font-semibold text-text-muted tabular-nums">{idx + 1}.</span>
                {item}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
      <p className="mt-2.5 text-[11px] text-text-dim">
        {t('ceo:plan.createdAt', { time: formatTime(plan.task.createdAt, locale) })}
        {items.length ? ` · ${plan.outline.length ? t('ceo:plan.steps', { count: items.length }) : t('ceo:plan.childTasks', { count: plan.children.length })}` : ''}
      </p>

      {error ? (
        <div className="mt-3">
          <ErrorBanner error={error} onRetry={() => void approve()} />
        </div>
      ) : null}
      {justApproved ? (
        <p role="status" className="mt-3 rounded-lg border border-brand-green/40 bg-brand-green/10 px-3 py-2 text-xs font-semibold text-brand-green">
          {t('ceo:plan.approveSuccess')}
        </p>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-2 @min-[22rem]:grid-cols-2">
        <Button
          variant="outline"
          size="sm"
          icon={<Eye className="size-3.5" aria-hidden="true" />}
          onClick={() => selectTask(plan.task.id)}
          title={`${t('ceo:plan.viewDetails')} – ${t('ceo:plan.viewDetailsSecondary')}`}
          className="w-full"
        >
          {t('ceo:plan.viewDetails')}
        </Button>
        <Button
          variant="success"
          size="sm"
          icon={<Rocket className="size-3.5" aria-hidden="true" />}
          onClick={() => void approve()}
          loading={approving}
          disabled={!pending}
          title={pending ? `${t('ceo:plan.approveExecute')} – ${t('ceo:plan.approveExecuteSecondary')}` : t('ceo:plan.noApproval')}
          className="w-full"
        >
          {approving ? t('ceo:plan.approving') : t('ceo:plan.approveExecute')}
        </Button>
      </div>
    </div>
  );
}

// ───────────────────────── Ô nhập yêu cầu ─────────────────────────
const MIN_REQUEST_LENGTH = 3;

function CeoComposer({ ceo }: { ceo: Agent }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [sent, setSent] = useState(false);
  const [tooShort, setTooShort] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = async () => {
    const trimmed = text.trim();
    if (trimmed.length < MIN_REQUEST_LENGTH) {
      setTooShort(true);
      return;
    }
    setTooShort(false);
    setSending(true);
    setError(null);
    try {
      await api.createCeoRequest({ text: trimmed });
      setText('');
      setSent(true);
      setTimeout(() => setSent(false), 6000);
      textareaRef.current?.focus();
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit();
  };
  // Enter gửi, Shift+Enter xuống dòng.
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const paused = ceo.status === 'paused';

  return (
    <form onSubmit={onSubmit} className="p-4" aria-label={t('ceo:chat.inputLabel')}>
      {error ? (
        <div className="mb-3">
          <ErrorBanner error={error} onRetry={() => void submit()} />
        </div>
      ) : null}
      <div className="flex items-end gap-2 rounded-2xl border border-line-strong bg-bg-deep/60 p-2 focus-within:border-brand-cyan/60 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]">
        <label htmlFor="ceo-request" className="sr-only">
          {t('ceo:chat.inputLabel')}
        </label>
        <textarea
          id="ceo-request"
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          maxLength={4000}
          placeholder={t('ceo:chat.placeholder')}
          disabled={sending}
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-text placeholder:text-text-dim focus:outline-none disabled:opacity-60"
        />
        <Button
          type="submit"
          size="md"
          loading={sending}
          icon={<Send className="size-4" aria-hidden="true" />}
          title={`${t('ceo:chat.send')} – ${t('ceo:chat.sendSecondary')}`}
          className="shrink-0 !px-3"
        >
          {sending ? t('ceo:chat.sending') : t('ceo:chat.send')}
        </Button>
      </div>
      <p role={sent || tooShort ? 'status' : undefined} className={clsx('mt-2 text-[11px] leading-snug', tooShort ? 'text-brand-amber' : sent ? 'text-brand-green' : 'text-text-dim')}>
        {tooShort ? t('ceo:chat.minLength') : sent ? t('ceo:chat.sent') : paused ? t('errors:codes.agent_paused.explain') : t('ceo:chat.hint')}
      </p>
    </form>
  );
}

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { MessageSquare, SendHorizontal } from 'lucide-react';
import type { Agent } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { api } from '@/lib/api';
import { useDerived } from '@/store/hooks';
import { selectMessagesForAgent } from '@/store/selectors';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { formatTime } from '@/lib/format';
import { ROLE_COLOR_VAR } from '@/lib/colors';

/**
 * Hội thoại nhanh với một nhân sự AI: tin nhắn từ store (selectMessagesForAgent),
 * ô nhập gửi qua api.sendAgentMessage – phản hồi về qua realtime (message.created).
 */
export function AgentChat({ agent }: { agent: Agent }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const messages = useDerived(selectMessagesForAgent(agent.id), [agent.id]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const roleColor = ROLE_COLOR_VAR[agent.role];

  // Cuộn xuống tin mới nhất mỗi khi danh sách đổi.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.sendAgentMessage(agent.id, { text: trimmed });
      setText('');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <ol
        ref={listRef}
        className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-xl border border-line bg-bg-deep/40 p-3"
        aria-live="polite"
        aria-label={`${t('agents:detail.chat')} – ${t('agents:detail.chatSecondary')}`}
      >
        {messages.length === 0 ? (
          <li className="flex flex-col items-center gap-1.5 py-5 text-center text-xs text-text-muted">
            <MessageSquare className="size-5 text-text-dim" aria-hidden="true" />
            {t('agents:detail.chatEmpty')}
          </li>
        ) : (
          messages.map((m) => {
            const mine = m.from === 'owner';
            return (
              <li key={m.id} className={clsx('flex items-end gap-2', mine ? 'flex-row-reverse' : 'flex-row')}>
                {mine ? (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-violet/30 text-[10px] font-bold text-text ring-1 ring-brand-violet/60" aria-hidden="true">
                    {t('agents:detail.fromOwner').slice(0, 1)}
                  </span>
                ) : (
                  <AgentAvatar agent={agent} size={24} showStatus={false} />
                )}
                <div className={clsx('min-w-0 max-w-[85%]', mine ? 'text-right' : 'text-left')}>
                  <p
                    className={clsx(
                      'inline-block whitespace-pre-wrap rounded-2xl px-3 py-2 text-left text-[13px] leading-relaxed text-text',
                      mine ? 'rounded-br-md bg-brand-violet/25 ring-1 ring-brand-violet/40' : 'rounded-bl-md bg-white/[0.05] ring-1 ring-white/10',
                    )}
                    style={mine ? undefined : { boxShadow: `inset 2px 0 0 ${roleColor}` }}
                  >
                    {m.text}
                  </p>
                  <span className="mt-0.5 block text-[10px] text-text-dim" title={mine ? t('agents:detail.fromOwner') : t('agents:detail.fromAgent')}>
                    {mine ? t('agents:detail.fromOwner') : t('agents:detail.fromAgent')} · {formatTime(m.createdAt, locale)}
                  </span>
                </div>
              </li>
            );
          })
        )}
      </ol>
      {error ? <ErrorBanner error={error} onRetry={() => void send()} /> : null}
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          maxLength={4000}
          placeholder={t('agents:detail.chatPlaceholder')}
          aria-label={t('agents:detail.chatPlaceholder')}
          disabled={busy}
          className="min-h-10 flex-1 resize-none rounded-xl border border-line bg-bg-deep/60 px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:border-brand-cyan/70 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={busy || !text.trim()}
          title={busy ? t('agents:detail.chatSending') : t('agents:detail.chatSend')}
          aria-label={busy ? t('agents:detail.chatSending') : t('agents:detail.chatSend')}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-brand-violet to-brand-purple text-white shadow-[0_0_18px_rgba(139,92,246,0.45)] transition hover:brightness-110 focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <SendHorizontal className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

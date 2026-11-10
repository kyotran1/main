import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Cpu, PauseCircle, PlayCircle } from 'lucide-react';
import type { Agent } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForExecutionMode } from '@ads-nolimit/i18n';
import { useOfficeStore } from '@/store/officeStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName, useAgentDisplayName } from '@/components/domain/AgentName';
import { AgentStatusBadge } from '@/components/domain/StatusBadges';
import { ROLE_COLOR_VAR } from '@/lib/colors';
import { useAgentPauseResume } from './useAgentPauseResume';

/**
 * Thẻ nhân sự AI trong lưới theo phòng ban: ảnh đại diện, tên hai dòng, trạng thái, hiệu suất,
 * số việc đang mở, công việc hiện tại (dữ liệu), chế độ mô hình, nút Tạm dừng/Tiếp tục. Bấm thẻ → selectAgent.
 */
export function AgentCard({ agent, openTasks, onError }: { agent: Agent; openTasks: number; onError: (err: unknown) => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const displayName = useAgentDisplayName();
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const currentTask = useOfficeStore((s) => (agent.currentTaskId ? s.tasks[agent.currentTaskId] : undefined));
  const { busy, error, toggle } = useAgentPauseResume(agent.id);
  // Đẩy lỗi tạm dừng/tiếp tục lên trang để hiển thị một ErrorBanner chung.
  useEffect(() => {
    if (error) onError(error);
  }, [error, onError]);
  const roleColor = ROLE_COLOR_VAR[agent.role];
  const mode = bilingual(termIdForExecutionMode(agent.model.mode), locale);
  const paused = agent.status === 'paused';
  const name = displayName(agent);
  const toggleIcon = busy ? (
    <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  ) : paused ? (
    <PlayCircle className="size-3.5" aria-hidden="true" />
  ) : (
    <PauseCircle className="size-3.5" aria-hidden="true" />
  );

  return (
    <article className={clsx('glass relative flex min-w-0 flex-col gap-3 p-3.5 transition hover:border-line-strong', paused && 'saturate-50')} style={{ boxShadow: `inset 0 3px 0 ${roleColor}` }}>
      <button type="button" onClick={() => selectAgent(agent.id)} title={t('agents:card.openProfile', { name })} aria-label={t('agents:card.openProfile', { name })} className="absolute inset-0 rounded-card focus-visible:focus-ring" />
      <div className="pointer-events-none relative flex items-start gap-3">
        <AgentAvatar agent={agent} size={48} />
        <div className="min-w-0 flex-1">
          <AgentName agent={agent} className="w-full text-[14px]" />
          <div className="mt-1.5">
            <AgentStatusBadge status={agent.status} />
          </div>
        </div>
        <span className="term-stack shrink-0 items-end text-right" title={`${t('agents:card.performanceSecondary')} – ${t('agents:card.performance')}`}>
          <span className="text-xl font-extrabold leading-none tabular-nums" style={{ color: roleColor }}>
            {agent.performance}%
          </span>
          <span className="term-secondary">{t('agents:card.performance')}</span>
        </span>
      </div>
      <ProgressBar value={agent.performance} color={roleColor} size="xs" className="pointer-events-none relative" label={`${t('agents:card.performance')}: ${agent.performance}%`} />

      <dl className="pointer-events-none relative grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-line bg-white/[0.03] px-2.5 py-1.5" title={`${t('agents:card.workloadSecondary')} – ${t('agents:card.workload')}`}>
          <dt className="truncate text-[11px] text-text-muted">{t('agents:card.workload')}</dt>
          <dd className="text-base font-bold tabular-nums text-text">{openTasks}</dd>
        </div>
        <div className="rounded-lg border border-line bg-white/[0.03] px-2.5 py-1.5" title={`${t('agents:card.completedSecondary')} – ${t('agents:card.completed')}`}>
          <dt className="truncate text-[11px] text-text-muted">{t('agents:card.completed')}</dt>
          <dd className="text-base font-bold tabular-nums text-text">{agent.tasksCompleted}</dd>
        </div>
      </dl>

      <div className="pointer-events-none relative min-w-0" title={`${t('agents:card.currentTaskSecondary')} – ${t('agents:card.currentTask')}`}>
        <p className="text-[11px] text-text-muted">{t('agents:card.currentTask')}</p>
        <p className={clsx('line-clamp-2 text-[13px] leading-snug', currentTask ? 'text-text' : 'italic text-text-dim')}>{currentTask ? currentTask.title : t('agents:card.noCurrentTask')}</p>
      </div>

      <div className="relative mt-auto flex items-center justify-between gap-2">
        <span className="pointer-events-none flex min-w-0 items-center gap-1.5" title={`${t('agents:card.model')}: ${agent.model.model} · ${mode.inline}`}>
          <Cpu className="size-4 shrink-0 text-brand-cyan" aria-hidden="true" />
          <span className="term-stack min-w-0 leading-tight">
            <span className="truncate font-mono text-[11px] font-semibold text-text">{agent.model.model}</span>
            <span className="truncate text-[11px] text-text-muted">{mode.primary}</span>
          </span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void toggle(paused);
          }}
          disabled={busy}
          title={paused ? t('agents:card.resumeAgent', { name }) : t('agents:card.pauseAgent', { name })}
          aria-label={paused ? t('agents:card.resumeAgent', { name }) : t('agents:card.pauseAgent', { name })}
          className={clsx(
            'relative z-10 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition focus-visible:focus-ring disabled:opacity-50',
            paused ? 'border-brand-green/50 bg-brand-green/15 text-brand-green hover:bg-brand-green/25' : 'border-line bg-white/[0.03] text-text-muted hover:bg-white/[0.08] hover:text-text',
          )}
        >
          {toggleIcon}
          {paused ? t('agents:card.resume') : t('agents:card.pause')}
        </button>
      </div>
    </article>
  );
}

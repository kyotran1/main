import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Camera, ClipboardPlus, Cpu, PauseCircle, PlayCircle, Plug, Sparkles } from 'lucide-react';
import type { Agent } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForExecutionMode } from '@ads-nolimit/i18n';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { selectAgentWorkload, selectTasksByAgent } from '@/store/selectors';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName, useAgentDisplayName } from '@/components/domain/AgentName';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { AgentStatusBadge, TaskStatusBadge } from '@/components/domain/StatusBadges';
import { ROLE_COLOR_VAR, TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { DrawerShell, DrawerSection, DrawerStat } from './DrawerShell';
import { AssignTaskForm } from './AssignTaskForm';
import { AgentChat } from './AgentChat';
import { useAgentPauseResume } from './useAgentPauseResume';

/**
 * NGĂN CHI TIẾT NHÂN SỰ AI – mở khi store.selectedAgentId có giá trị (mọi trang đều có thể gọi selectAgent(id)).
 * Được gắn một lần trong AppShell. Toàn bộ dữ liệu đọc từ store duy nhất; thao tác ghi qua api.*,
 * store tự cập nhật qua realtime.
 */
export function AgentDetailDrawer() {
  const { t } = useTranslation();
  const selectedAgentId = useOfficeStore((s) => s.selectedAgentId);
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const agent = useOfficeStore((s) => (s.selectedAgentId ? s.agents[s.selectedAgentId] : undefined));
  const close = useCallback(() => selectAgent(null), [selectAgent]);

  const header = agent ? <AgentHeader agent={agent} /> : <p className="text-sm font-semibold text-text">{t('agents:detail.title')}</p>;

  return (
    <DrawerShell
      open={!!selectedAgentId}
      onClose={close}
      label={`${t('agents:detail.title')} – ${t('agents:detail.secondary')}`}
      closeLabel={t('agents:detail.close')}
      header={header}
      accent={agent ? ROLE_COLOR_VAR[agent.role] : undefined}
    >
      {agent ? <AgentBody key={agent.id} agent={agent} /> : <p className="text-sm text-text-muted">{t('agents:detail.notFound')}</p>}
    </DrawerShell>
  );
}

function AgentHeader({ agent }: { agent: Agent }) {
  return (
    <div className="flex items-center gap-3">
      <AgentAvatar agent={agent} size={56} />
      <div className="min-w-0 flex-1">
        <AgentName agent={agent} className="w-full text-base" />
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <AgentStatusBadge status={agent.status} />
          <DepartmentName id={agent.departmentId} format="short" withDot className="text-xs text-text-muted" />
        </div>
      </div>
    </div>
  );
}

function AgentBody({ agent }: { agent: Agent }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const displayName = useAgentDisplayName();
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const selectTask = useOfficeStore((s) => s.selectTask);
  const focusCameraOnAgent = useOfficeStore((s) => s.focusCameraOnAgent);
  const manager = useOfficeStore((s) => (agent.reportsTo ? s.agents[agent.reportsTo] : undefined));
  const connectors = useOfficeStore((s) => s.connectors);
  const tasks = useDerived(selectTasksByAgent(agent.id), [agent.id]);
  const workload = useDerived(selectAgentWorkload(agent.id), [agent.id]);
  const { busy, error, toggle, clearError } = useAgentPauseResume(agent.id);
  const [assigning, setAssigning] = useState(false);

  const roleColor = ROLE_COLOR_VAR[agent.role];
  const mode = bilingual(termIdForExecutionMode(agent.model.mode), locale);
  const paused = agent.status === 'paused';
  const openTasks = tasks.filter((x) => x.status !== 'completed');
  const agentConnectors = agent.connectorIds.map((id) => connectors.find((c) => c.id === id) ?? { id, vendor: id, connected: false });

  const goToCamera = () => {
    focusCameraOnAgent(agent.id);
    selectAgent(null);
    navigate('/office');
  };

  return (
    <div className="flex flex-col">
      {/* Hành động chính */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Button
          variant={paused ? 'success' : 'outline'}
          size="sm"
          loading={busy}
          icon={paused ? <PlayCircle className="size-4" aria-hidden="true" /> : <PauseCircle className="size-4" aria-hidden="true" />}
          onClick={() => void toggle(paused)}
          title={paused ? t('glossary:action.resume.inline') : t('glossary:action.pause.inline')}
        >
          {paused ? t('agents:detail.resume') : t('agents:detail.pause')}
        </Button>
        <Button
          variant={assigning ? 'outline' : 'primary'}
          size="sm"
          icon={<ClipboardPlus className="size-4" aria-hidden="true" />}
          onClick={() => setAssigning((v) => !v)}
          aria-expanded={assigning}
          title={`${t('agents:detail.assignSecondary')} – ${t('agents:detail.assign')}`}
        >
          {t('agents:detail.assign')}
        </Button>
        <Button variant="outline" size="sm" icon={<Camera className="size-4" aria-hidden="true" />} onClick={goToCamera} title={t('glossary:action.focus_camera.inline')} className="col-span-2 sm:col-span-1">
          {t('agents:detail.focusCamera')}
        </Button>
      </div>
      {error ? (
        <div className="mt-3">
          <ErrorBanner error={error} onRetry={clearError} />
        </div>
      ) : null}
      {assigning ? (
        <div className="mt-3">
          <AssignTaskForm agent={agent} onClose={() => setAssigning(false)} />
        </div>
      ) : null}

      {/* Số liệu */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <DrawerStat value={`${agent.performance}%`} label={t('agents:detail.performance')} secondary={t('agents:detail.performanceSecondary')} color={roleColor} />
        <DrawerStat value={agent.tasksCompleted} label={t('agents:detail.tasksCompleted')} secondary={t('agents:detail.tasksCompletedSecondary')} color="var(--color-status-done)" />
        <DrawerStat value={workload.open} label={t('agents:detail.openTasks')} secondary={t('agents:detail.openTasksSecondary')} color="var(--color-status-running)" />
      </div>
      <ProgressBar value={agent.performance} color={roleColor} size="xs" className="mt-2" label={`${t('agents:detail.performance')}: ${agent.performance}%`} />

      {/* Báo cáo cho */}
      <DrawerSection label={t('agents:detail.reportsTo')} secondary={t('agents:detail.reportsToSecondary')}>
        {manager ? (
          <button
            type="button"
            onClick={() => selectAgent(manager.id)}
            title={t('agents:card.openProfile', { name: displayName(manager) })}
            className="flex w-full items-center gap-3 rounded-xl border border-line bg-white/[0.03] p-2.5 text-left transition hover:border-line-strong hover:bg-white/[0.06] focus-visible:focus-ring"
          >
            <AgentAvatar agent={manager} size={36} />
            <AgentName agent={manager} className="min-w-0 flex-1 text-sm" />
            <AgentStatusBadge status={manager.status} />
          </button>
        ) : (
          <p className="rounded-xl border border-dashed border-line px-3 py-2.5 text-xs text-text-muted">{t('agents:detail.topLevel')}</p>
        )}
      </DrawerSection>

      {/* Mô hình */}
      <DrawerSection label={t('agents:detail.model')} secondary={t('agents:detail.modelSecondary')}>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white/[0.03] p-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-cyan/15 text-brand-cyan ring-1 ring-brand-cyan/40">
            <Cpu className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-sm font-semibold text-text" title={`${t('glossary:tech.model.inline')}: ${agent.model.model}`}>
              {agent.model.model}
            </p>
            <p className="truncate text-xs text-text-muted" title={`${t('glossary:tech.provider.inline')}: ${agent.model.provider}`}>
              {t('agents:detail.provider')}: <span className="font-mono text-text">{agent.model.provider}</span>
            </p>
          </div>
          <Badge color="var(--color-brand-violet)" title={`${mode.inline} · ${t('agents:detail.mode')}`}>
            {mode.inline}
          </Badge>
        </div>
      </DrawerSection>

      {/* Kỹ năng */}
      <DrawerSection label={t('agents:detail.skills')} secondary={t('agents:detail.skillsSecondary')}>
        {agent.skills.length === 0 ? (
          <p className="text-xs text-text-muted">{t('agents:detail.noSkills')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {agent.skills.map((sk) => (
              <li key={sk.id} className="flex items-center gap-3">
                <span className="inline-flex min-w-0 max-w-[55%] items-center gap-1.5 rounded-md border border-line bg-bg-deep/50 px-2 py-1 font-mono text-[11px] text-text" title={`${t('glossary:tech.skill.inline')}: ${sk.id}`}>
                  <Sparkles className="size-3 shrink-0 text-brand-cyan" aria-hidden="true" />
                  <span className="truncate">{sk.id}</span>
                </span>
                <ProgressBar value={sk.level} color={roleColor} size="xs" className="flex-1" label={`${sk.id}: ${sk.level}%`} />
                <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-text-muted">{sk.level}%</span>
              </li>
            ))}
          </ul>
        )}
      </DrawerSection>

      {/* Công cụ kết nối */}
      <DrawerSection label={t('agents:detail.connectors')} secondary={t('agents:detail.connectorsSecondary')}>
        {agentConnectors.length === 0 ? (
          <p className="text-xs text-text-muted">{t('agents:detail.noConnectors')}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {agentConnectors.map((c) => {
              const color = c.connected ? 'var(--color-status-done)' : 'var(--color-status-idle)';
              return (
                <li key={c.id} className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-2.5 py-2" title={`${c.vendor} · ${c.connected ? t('agents:detail.connected') : t('agents:detail.disconnected')}`}>
                  <Plug className="size-3.5 shrink-0 text-text-muted" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-text">{c.vendor}</span>
                  <span className="size-2 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} aria-hidden="true" />
                  <span className="sr-only">{c.connected ? t('agents:detail.connected') : t('agents:detail.disconnected')}</span>
                </li>
              );
            })}
          </ul>
        )}
      </DrawerSection>

      {/* Công việc đang phụ trách */}
      <DrawerSection
        label={t('agents:detail.tasks')}
        secondary={t('agents:detail.tasksSecondary')}
        action={<span className="text-xs text-text-muted">{t('agents:group.openTasks', { count: openTasks.length })}</span>}
      >
        {tasks.length === 0 ? (
          <p className="text-xs text-text-muted">{t('agents:detail.noTasks')}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {[...openTasks, ...tasks.filter((x) => x.status === 'completed')].map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => selectTask(task.id)}
                  title={t('tasks:detail.openTask', { title: task.title })}
                  className={clsx(
                    'flex w-full flex-col gap-1.5 rounded-xl border border-line bg-white/[0.03] p-2.5 text-left transition hover:border-line-strong hover:bg-white/[0.06] focus-visible:focus-ring',
                    task.status === 'completed' && 'opacity-70',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 min-w-0 flex-1 text-[13px] font-medium leading-snug text-text">{task.title}</span>
                    <TaskStatusBadge status={task.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar value={task.progress} color={TASK_STATUS_COLOR_VAR[task.status]} size="xs" className="flex-1" label={`${t('tasks:detail.progress')}: ${task.progress}%`} />
                    <span className="w-9 text-right text-[11px] font-semibold tabular-nums text-text-muted">{task.progress}%</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DrawerSection>

      {/* Hội thoại nhanh */}
      <DrawerSection label={t('agents:detail.chat')} secondary={t('agents:detail.chatSecondary')} className="pb-2">
        <AgentChat agent={agent} />
      </DrawerSection>
    </div>
  );
}

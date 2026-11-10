import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Crosshair, MapPin, X } from 'lucide-react';
import type { Agent } from '@ads-nolimit/shared';
import { isTaskOpen } from '@ads-nolimit/shared';
import { bilingual, termIdForDepartment } from '@ads-nolimit/i18n';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { selectDepartmentById, selectDepartmentSummary } from '@/store/selectors';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName } from '@/components/domain/AgentName';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { AgentStatusBadge, TaskStatusBadge } from '@/components/domain/StatusBadges';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { formatPercent } from '@/lib/format';
import { agentPresentIn } from './scene/layout';

/**
 * Bảng chi tiết phòng ban – mở khi store.selectedDepartmentId có giá trị (click phòng trong 3D).
 * Mọi con số lấy từ selectDepartmentSummary để khớp với bảng tên 3D và các trang khác.
 */
export function DepartmentPanel() {
  const { t } = useTranslation();
  const locale = useLocale();
  const id = useOfficeStore((s) => s.selectedDepartmentId);
  const selectDepartment = useOfficeStore((s) => s.selectDepartment);
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const selectTask = useOfficeStore((s) => s.selectTask);
  const focusCameraOnAgent = useOfficeStore((s) => s.focusCameraOnAgent);
  const department = useDerived(selectDepartmentById(id), [id]);
  const summary = useDerived((s) => (id ? selectDepartmentSummary(id)(s) : null), [id]);
  const visitors = useDerived((s) => (id ? Object.values(s.agents).filter((a) => a.departmentId !== id && agentPresentIn(a, id)) : []), [id]);

  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectDepartment(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, selectDepartment]);

  if (!id || !department || !summary) return null;

  const label = bilingual(termIdForDepartment(id), locale);
  const accent = department.accent;
  const tasks = [...summary.tasks].sort((a, b) => Number(isTaskOpen(b.status)) - Number(isTaskOpen(a.status)) || b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);
  const members = summary.agents;

  const stat = (value: string, primary: string, secondary: string) => (
    <div className="flex flex-col items-center px-1 py-2 text-center" title={`${primary} – ${secondary}`}>
      <span className="text-lg font-extrabold leading-none tabular-nums text-text">{value}</span>
      <span className="mt-1 text-[10px] font-semibold leading-tight text-text">{primary}</span>
      <span className="text-[9px] leading-tight text-text-muted">{secondary}</span>
    </div>
  );

  const agentRow = (agent: Agent, visiting: boolean) => (
    <li key={agent.id} className="flex items-center gap-2 py-1.5">
      <button type="button" className="flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left hover:bg-white/[0.04] focus-visible:focus-ring" onClick={() => selectAgent(agent.id)}>
        <AgentAvatar agent={agent} size={30} />
        <AgentName agent={agent} className="min-w-0 flex-1 text-[12px]" />
      </button>
      {visiting ? <MapPin className="size-3.5 shrink-0 text-brand-cyan" aria-label={t('office3d:panel.visiting')} /> : null}
      <AgentStatusBadge status={agent.status} />
      <button
        type="button"
        className="rounded-md p-1 text-text-muted hover:bg-white/5 hover:text-brand-cyan focus-visible:focus-ring"
        onClick={() => focusCameraOnAgent(agent.id)}
        aria-label={`${t('office3d:panel.focusCamera')} – ${bilingual('action.focus_camera', locale).term}`}
        title={bilingual('action.focus_camera', locale).inline}
      >
        <Crosshair className="size-3.5" />
      </button>
    </li>
  );

  return (
    <aside
      role="dialog"
      aria-label={`${t('office3d:panel.title.label')}: ${label.inline}`}
      className="glass-strong pointer-events-auto absolute bottom-2 left-2 right-2 z-10 flex max-h-[min(74%,460px)] flex-col overflow-hidden sm:right-auto sm:bottom-3 sm:left-3 sm:w-[360px]"
      style={{ borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`, boxShadow: `0 0 0 1px color-mix(in srgb, ${accent} 30%, transparent), 0 16px 40px color-mix(in srgb, var(--color-bg-base) 70%, transparent)` }}
    >
      <header className="flex items-start gap-2.5 border-b border-line/70 p-3">
        <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <DepartmentName id={id} className="text-sm" />
          <p className="mt-0.5 text-[10px] text-text-muted" title={`${t('office3d:panel.title.label')} – ${t('office3d:panel.title.secondary')}`}>
            {t('office3d:panel.title.label')}
            {department.functional ? ` · ${t('office3d:room.functional')}` : ''}
          </p>
        </div>
        <button type="button" onClick={() => selectDepartment(null)} className="rounded-lg p-1.5 text-text-muted hover:bg-white/5 hover:text-text focus-visible:focus-ring" aria-label={t('common:labels.close')}>
          <X className="size-4" />
        </button>
      </header>

      <div className="grid grid-cols-3 divide-x divide-line/60 border-b border-line/70">
        {stat(String(summary.agentCounts.total), t('office3d:panel.members.label'), t('office3d:panel.members.secondary'))}
        {stat(String(summary.counts.open), t('office3d:panel.openTasks.label'), t('office3d:panel.openTasks.secondary'))}
        {stat(formatPercent(summary.counts.completionRate, locale), t('office3d:panel.completion.label'), t('office3d:panel.completion.secondary'))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <section>
          <h3 className="text-[11px] font-semibold text-text-muted" title={`${t('office3d:panel.members.label')} – ${t('office3d:panel.members.secondary')}`}>
            {t('office3d:panel.members.label')}
          </h3>
          {members.length === 0 && visitors.length === 0 ? (
            <p className="mt-1 text-xs text-text-dim">{department.functional ? t('office3d:panel.functionalNote') : t('office3d:panel.noAgents')}</p>
          ) : (
            <ul className="mt-1 divide-y divide-line/50">
              {members.map((a) => agentRow(a, false))}
              {visitors.map((a) => agentRow(a, true))}
            </ul>
          )}
        </section>

        <section className="mt-3">
          <h3 className="text-[11px] font-semibold text-text-muted" title={`${t('office3d:panel.tasks.label')} – ${t('office3d:panel.tasks.secondary')}`}>
            {t('office3d:panel.tasks.label')}
          </h3>
          {tasks.length === 0 ? (
            <p className="mt-1 text-xs text-text-dim">{t('office3d:panel.noTasks')}</p>
          ) : (
            <ul className="mt-1 divide-y divide-line/50">
              {tasks.map((task) => (
                <li key={task.id}>
                  <button type="button" className="flex w-full flex-col gap-1 rounded-lg py-1.5 text-left hover:bg-white/[0.04] focus-visible:focus-ring" onClick={() => selectTask(task.id)}>
                    <span className="flex w-full items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-text" title={task.title}>
                        {task.title}
                      </span>
                      <TaskStatusBadge status={task.status} short />
                    </span>
                    <span className="flex w-full items-center gap-2">
                      <ProgressBar value={task.progress} color={TASK_STATUS_COLOR_VAR[task.status]} size="xs" className="flex-1" label={task.title} />
                      <span className="text-[10px] tabular-nums text-text-muted">{formatPercent(task.progress, locale)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link to="/tasks" className="mt-2 inline-block text-[11px] font-semibold text-brand-cyan hover:underline focus-visible:focus-ring">
            {t('office3d:panel.viewAllTasks')}
          </Link>
        </section>
      </div>
    </aside>
  );
}

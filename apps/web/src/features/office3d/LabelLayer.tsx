import { useEffect } from 'react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { ListChecks, MapPin, Users } from 'lucide-react';
import type { Department } from '@ads-nolimit/shared';
import { bilingual, termIdForDepartment, termIdForRole } from '@ads-nolimit/i18n';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { selectDepartmentSummary } from '@/store/selectors';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName } from '@/components/domain/AgentName';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { AgentStatusBadge, TaskStatusBadge } from '@/components/domain/StatusBadges';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AGENT_STATUS_COLOR_VAR, ROLE_COLOR_VAR, TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { formatPercent } from '@/lib/format';
import { useSceneSettings } from './scene/SceneContext';
import { anchorKey, useLabelElement, useOverlayBus, useSceneUi } from './scene/overlay';
import { WALL_HEIGHT, agentInDepartmentScope, findRoom, roomCenter } from './scene/layout';

/**
 * Lớp nhãn DOM nổi trên Canvas: bảng tên phòng ban, nhãn nhân sự, bong bóng chi tiết, biển hiệu.
 * Vị trí do LabelProjector (trong Canvas) cập nhật mỗi khung hình; nội dung là React DOM thường.
 */
export function LabelLayer() {
  const settings = useSceneSettings();
  const departments = useOfficeStore((s) => s.departments);
  const agentIds = useDerived((s) => Object.keys(s.agents).sort().join('|'));
  const hoveredAgentId = useSceneUi((s) => s.hoveredAgentId);
  const compact = useSceneUi((s) => s.compact);
  const selectedAgentId = useOfficeStore((s) => s.selectedAgentId);
  const full = settings.mode === 'full';
  const tipAgentId = full ? (hoveredAgentId ?? selectedAgentId) : null;

  return (
    <div className="pointer-events-none absolute inset-0 isolate z-0 overflow-hidden">
      {settings.showLabels && full && !compact ? <CompanySign departments={departments} /> : null}
      {settings.showLabels ? departments.map((d) => <RoomLabel key={d.id} department={d} />) : null}
      {settings.showLabels && full
        ? agentIds
            .split('|')
            .filter(Boolean)
            .map((id) => <AgentLabel key={id} agentId={id} hidden={compact && id !== tipAgentId} />)
        : null}
      {tipAgentId ? <AgentTooltip key={tipAgentId} agentId={tipAgentId} /> : null}
    </div>
  );
}

/** Bảng tên song ngữ của phòng + số nhân sự & việc mở (selectDepartmentSummary). */
function RoomLabel({ department }: { department: Department }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const settings = useSceneSettings();
  const bus = useOverlayBus();
  const compact = useSceneUi((s) => s.compact);
  const hovered = useSceneUi((s) => s.hoveredDepartmentId === department.id);
  const selected = useOfficeStore((s) => s.selectedDepartmentId === department.id);
  const selectDepartment = useOfficeStore((s) => s.selectDepartment);
  const summary = useDerived(selectDepartmentSummary(department.id), [department.id]);
  const ref = useLabelElement(anchorKey.room(department.id));
  const mini = settings.mode === 'mini';
  const [cx] = roomCenter(department);
  // Neo bảng tên lệch về tường sau của phòng để không che nhãn nhân sự đứng giữa phòng.
  const cz = department.bounds.z + department.bounds.depth * 0.3;

  useEffect(() => {
    const key = anchorKey.room(department.id);
    bus.anchors.set(key, { position: [cx, WALL_HEIGHT + (mini ? 0.8 : compact ? 1.2 : 2.0), cz], offsetY: 0 });
    return () => {
      bus.anchors.delete(key);
    };
  }, [bus, department.id, cx, cz, mini, compact]);

  const label = bilingual(termIdForDepartment(department.id), locale);
  const accent = department.accent;
  const dimmed = settings.filterDepartmentId !== null && settings.filterDepartmentId !== department.id;
  const lit = !dimmed && (hovered || selected || settings.filterDepartmentId === department.id);
  // Tránh lặp "Marketing / Marketing": nếu dạng rút gọn trùng tiếng Anh thì dùng nhãn đầy đủ
  // (ở chế độ mini/compact không có dòng phụ nên luôn dùng dạng rút gọn; tooltip vẫn song ngữ).
  const primary = !mini && !compact && label.short.toLowerCase() === label.secondary.toLowerCase() ? label.primary : label.short;
  const showCounts = !mini && (!department.functional || summary.agents.length > 0 || summary.tasks.length > 0);

  return (
    <div ref={ref} className="absolute left-0 top-0 z-10 will-change-transform" style={{ visibility: 'hidden' }}>
      <button
        type="button"
        onClick={() => {
          selectDepartment(department.id);
          settings.onSelectDepartment?.(department.id);
        }}
        onMouseEnter={() => bus.ui.getState().setHoveredDepartment(department.id)}
        onMouseLeave={() => bus.ui.getState().clearHoveredDepartment(department.id)}
        title={label.inline}
        className="pointer-events-auto flex flex-col items-center rounded-lg border px-2 py-1 text-center backdrop-blur-md transition-[opacity,box-shadow,transform] duration-300 focus-visible:focus-ring"
        style={{
          borderColor: `color-mix(in srgb, ${accent} ${lit ? 85 : 50}%, transparent)`,
          background: 'color-mix(in srgb, var(--color-bg-panel) 86%, transparent)',
          boxShadow: lit ? `0 0 18px color-mix(in srgb, ${accent} 55%, transparent)` : `0 4px 14px color-mix(in srgb, var(--color-bg-base) 60%, transparent)`,
          opacity: dimmed ? 0.35 : 1,
          transform: lit ? 'translateY(-4px) scale(1.04)' : undefined,
        }}
      >
        <span className={clsx('whitespace-nowrap font-bold leading-tight text-text', mini || compact ? 'text-[10px]' : 'text-[11.5px]')}>{primary}</span>
        {!mini && (!compact || showCounts) ? (
          <span className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-[9px] leading-tight">
            {!compact ? <span className="font-medium text-text-muted">{label.secondary}</span> : null}
            {showCounts ? (
              <>
                <span className="inline-flex items-center gap-0.5 font-semibold tabular-nums text-text" title={t('common:units.agents', { count: summary.agentCounts.total })}>
                  <Users className="size-2.5" style={{ color: accent }} aria-hidden="true" />
                  {summary.agentCounts.total}
                </span>
                <span className="inline-flex items-center gap-0.5 font-semibold tabular-nums text-text" title={t('office3d:room.openTasks', { count: summary.counts.open })}>
                  <ListChecks className="size-2.5" style={{ color: accent }} aria-hidden="true" />
                  {summary.counts.open}
                </span>
              </>
            ) : null}
          </span>
        ) : null}
        {hovered && !mini && !compact ? <span className="mt-0.5 whitespace-nowrap text-[8.5px] text-text-dim">{t('office3d:room.clickHint')}</span> : null}
      </button>
    </div>
  );
}

/** Nhãn tên ngắn trên đầu nhân sự – tên gọi hoặc chức vụ, kèm chấm trạng thái. */
function AgentLabel({ agentId, hidden }: { agentId: string; hidden: boolean }) {
  const agent = useOfficeStore((s) => s.agents[agentId]);
  const settings = useSceneSettings();
  const locale = useLocale();
  const ref = useLabelElement(anchorKey.agent(agentId));
  if (!agent) return null;
  const role = bilingual(termIdForRole(agent.role), locale);
  const statusVar = AGENT_STATUS_COLOR_VAR[agent.status];
  const roleVar = ROLE_COLOR_VAR[agent.role];
  const dimmed = !agentInDepartmentScope(agent, settings.filterDepartmentId);
  return (
    <div ref={ref} className={clsx('absolute left-0 top-0 z-20 will-change-transform', hidden && 'hidden')} style={{ visibility: 'hidden' }}>
      <div
        className="flex max-w-[170px] items-center gap-1 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[10px] font-semibold text-text backdrop-blur-md transition-opacity duration-300"
        style={{
          borderColor: `color-mix(in srgb, ${roleVar} 55%, transparent)`,
          background: 'color-mix(in srgb, var(--color-bg-panel) 86%, transparent)',
          opacity: dimmed ? 0.3 : agent.status === 'paused' ? 0.6 : 1,
        }}
        title={agent.displayName ? `${agent.displayName} · ${role.inline}` : role.inline}
      >
        <span className="size-1.5 shrink-0 rounded-full" style={{ background: statusVar, boxShadow: `0 0 6px ${statusVar}` }} aria-hidden="true" />
        <span className="truncate">{agent.displayName ?? role.term}</span>
      </div>
    </div>
  );
}

/** Bong bóng chi tiết khi hover/chọn: tên song ngữ, trạng thái, phòng ban, công việc & tiến độ. */
function AgentTooltip({ agentId }: { agentId: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const agent = useOfficeStore((s) => s.agents[agentId]);
  const task = useOfficeStore((s) => (agent?.currentTaskId ? s.tasks[agent.currentTaskId] : undefined));
  const ref = useLabelElement(anchorKey.tip(agentId));
  if (!agent) return null;
  const location = agent.location;
  const whereabouts =
    location.kind === 'department'
      ? t('office3d:agent.location.department', { department: bilingual(termIdForDepartment(location.departmentId), locale).short })
      : location.kind === 'desk'
        ? null
        : t(`office3d:agent.location.${location.kind}`);
  return (
    <div ref={ref} className="absolute left-0 top-0 z-30 will-change-transform" style={{ visibility: 'hidden' }}>
      <div className="glass-strong mb-1.5 w-[236px] rounded-xl p-2.5 text-left" style={{ borderColor: `color-mix(in srgb, ${ROLE_COLOR_VAR[agent.role]} 60%, transparent)` }}>
        <div className="flex items-center gap-2">
          <AgentAvatar agent={agent} size={30} />
          <AgentName agent={agent} className="min-w-0 flex-1 text-[12px]" />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <AgentStatusBadge status={agent.status} />
          <DepartmentName id={agent.departmentId} format="short" withDot className="text-[10px] text-text-muted" />
        </div>
        {whereabouts ? (
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-brand-cyan">
            <MapPin className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{whereabouts}</span>
          </p>
        ) : null}
        {task ? (
          <div className="mt-2 border-t border-line/70 pt-2">
            <p className="text-[9.5px] font-medium text-text-muted" title={`${t('office3d:agent.currentTask.label')} – ${t('office3d:agent.currentTask.secondary')}`}>
              {t('office3d:agent.currentTask.label')}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug text-text">{task.title}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <ProgressBar value={task.progress} color={TASK_STATUS_COLOR_VAR[task.status]} size="xs" className="flex-1" label={task.title} />
              <span className="text-[10px] font-semibold tabular-nums text-text-muted">{formatPercent(task.progress, locale)}</span>
            </div>
            <div className="mt-1.5">
              <TaskStatusBadge status={task.status} short />
            </div>
          </div>
        ) : (
          <p className="mt-2 border-t border-line/70 pt-2 text-[10px] text-text-muted">{t('office3d:agent.noTask')}</p>
        )}
        <p className="mt-1.5 text-[9px] text-text-dim">{t('office3d:agent.clickHint')}</p>
      </div>
    </div>
  );
}

/** Biển hiệu công ty trên tường Ban điều hành – tên/tagline là dữ liệu từ backend. */
function CompanySign({ departments }: { departments: Department[] }) {
  const { t } = useTranslation();
  const bus = useOverlayBus();
  const company = useOfficeStore((s) => s.company);
  const ref = useLabelElement(anchorKey.sign);
  const exec = findRoom(departments, 'executive');
  const x = exec ? exec.bounds.x + exec.bounds.width / 2 : 0;
  const z = exec ? exec.bounds.z : 0;
  useEffect(() => {
    if (!exec) return;
    bus.anchors.set(anchorKey.sign, { position: [x, WALL_HEIGHT + 3.6, z], offsetY: 0 });
    return () => {
      bus.anchors.delete(anchorKey.sign);
    };
  }, [bus, exec, x, z]);
  if (!exec || !company) return null;
  return (
    <div ref={ref} className="absolute left-0 top-0 z-[5] will-change-transform" style={{ visibility: 'hidden' }}>
      <div className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-line-strong bg-bg-panel/85 px-2.5 py-1 shadow-glow-violet backdrop-blur-md" title={company.tagline}>
        <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-brand-cyan to-brand-purple" aria-hidden="true">
          <svg viewBox="0 0 64 64" className="size-4">
            <path d="M32 10 L54 52 H44 L32 28 L20 52 H10 Z" fill="var(--color-bg-base)" />
            <path d="M26 44 H38 L32 34 Z" fill="var(--color-brand-cyan)" />
          </svg>
        </span>
        <span className="text-[12px] font-extrabold tracking-wide text-text">
          {company.name} <span className="text-gradient-brand">{t('common:app.shortName')}</span>
        </span>
      </div>
    </div>
  );
}

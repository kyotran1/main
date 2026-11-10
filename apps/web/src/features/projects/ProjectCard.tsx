import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarRange, ChevronDown, Crosshair, ListChecks, Wallet } from 'lucide-react';
import { clsx } from 'clsx';
import type { Task, TaskStatus } from '@ads-nolimit/shared';
import { TASK_STATUSES } from '@ads-nolimit/shared';
import { useLocale, useTerms } from '@ads-nolimit/i18n/react';
import { termIdForTaskStatus } from '@ads-nolimit/i18n';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName } from '@/components/domain/AgentName';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { PriorityBadge, TaskStatusBadge } from '@/components/domain/StatusBadges';
import { useOfficeStore } from '@/store/officeStore';
import { formatDate, formatVnd } from '@/lib/format';
import { DEPARTMENT_COLOR_VAR, TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { PROJECT_STATUS_COLOR_VAR, ProjectStatusBadge } from './ProjectStatusBadge';
import { daysUntil, type ProjectCardData } from './selectors';

/** Nhãn nhỏ song ngữ dùng cho các ô thông tin trong thẻ. */
function FieldLabel({ icon, label, secondary }: { icon: React.ReactNode; label: string; secondary: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted" title={`${secondary} – ${label}`}>
      <span className="text-text-dim" aria-hidden="true">
        {icon}
      </span>
      <span className="truncate">{label}</span>
      <span className="hidden truncate font-medium text-text-dim sm:inline">· {secondary}</span>
    </p>
  );
}

/** Thanh phân đoạn số công việc theo trạng thái (có khe 2px nền giữa các đoạn). */
function TaskStatusBar({ counts }: { counts: Record<TaskStatus, number> }) {
  const total = TASK_STATUSES.reduce((sum, st) => sum + counts[st], 0);
  if (total === 0) return null;
  return (
    <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
      {TASK_STATUSES.filter((st) => counts[st] > 0).map((st) => (
        <span key={st} className="h-full rounded-[2px]" style={{ width: `${(counts[st] / total) * 100}%`, background: TASK_STATUS_COLOR_VAR[st] }} />
      ))}
    </div>
  );
}

/** Dòng công việc trong thẻ dự án – bấm để mở ngăn chi tiết (selectTask). */
function ProjectTaskRow({ task }: { task: Task }) {
  const { t } = useTranslation();
  const selectTask = useOfficeStore((s) => s.selectTask);
  const assignee = useOfficeStore((s) => (task.assigneeId ? s.agents[task.assigneeId] : undefined));
  return (
    <li>
      <button
        type="button"
        onClick={() => selectTask(task.id)}
        title={t('projects:card.openTask', { title: task.title })}
        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white/[0.05] focus-visible:focus-ring"
      >
        <span className="size-2 shrink-0 rounded-full" style={{ background: TASK_STATUS_COLOR_VAR[task.status], boxShadow: `0 0 8px ${TASK_STATUS_COLOR_VAR[task.status]}` }} aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-text">{task.title}</span>
          <span className="block truncate text-[11px] text-text-muted">
            {assignee ? <AgentName agent={assignee} format="primary" /> : t('projects:card.unassigned')} · {task.progress}%
          </span>
        </span>
        <span className="hidden shrink-0 sm:inline-flex">
          <PriorityBadge priority={task.priority} />
        </span>
        <TaskStatusBadge status={task.status} short />
      </button>
    </li>
  );
}

/**
 * Thẻ dự án: tên, mục tiêu, trạng thái, tiến độ lớn, chủ trì, phòng ban tham gia,
 * ngân sách, mốc thời gian, thống kê công việc theo trạng thái và danh sách công việc (mở/đóng).
 */
export function ProjectCard({ data }: { data: ProjectCardData }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const terms = useTerms();
  const { project, tasks, counts } = data;
  const owner = useOfficeStore((s) => s.agents[project.ownerAgentId]);
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const [open, setOpen] = useState(false);

  const color = PROJECT_STATUS_COLOR_VAR[project.status];
  const left = daysUntil(project.endAt);
  const timelineNote =
    left === null
      ? t('projects:card.noEnd')
      : left === 0
        ? t('projects:card.endsToday')
        : left > 0
          ? t('projects:card.daysLeft', { count: left })
          : t('projects:card.daysOverdue', { count: -left });
  const timelineTone = left !== null && left < 0 && project.status !== 'completed' ? 'text-brand-red' : left !== null && left <= 7 && project.status === 'active' ? 'text-brand-amber' : 'text-text-muted';
  const listId = `project-tasks-${project.id}`;

  return (
    <Card padded={false} className="relative overflow-hidden">
      {/* Vệt màu trạng thái bên trái thẻ */}
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: color, boxShadow: `0 0 16px ${color}` }} aria-hidden="true" />

      <div className="flex flex-col gap-4 p-4 pl-5 md:p-5 md:pl-6">
        {/* Hàng đầu: tên + trạng thái + tiến độ lớn */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold leading-tight text-text md:text-lg">{project.name}</h2>
              <ProjectStatusBadge status={project.status} />
            </div>
            {project.objective ? (
              <p className="mt-1.5 line-clamp-2 text-sm text-text-muted" title={`${t('projects:card.objective')} – ${t('projects:card.objectiveSecondary')}: ${project.objective}`}>
                <Crosshair className="mr-1.5 inline size-3.5 -translate-y-px text-text-dim" aria-hidden="true" />
                {project.objective}
              </p>
            ) : null}
          </div>
          <div className="w-full shrink-0 md:w-56" title={`${t('projects:card.progressSecondary')} – ${t('projects:card.progress')}`}>
            <div className="mb-1 flex items-end justify-between gap-2">
              <span className="text-[11px] font-semibold text-text-muted">{t('projects:card.progress')}</span>
              <span className="text-2xl font-extrabold leading-none tabular-nums" style={{ color }}>
                {project.progress}%
              </span>
            </div>
            <ProgressBar value={project.progress} color={color} size="md" label={`${t('projects:card.progress')}: ${project.progress}%`} />
          </div>
        </div>

        {/* Lưới thông tin */}
        <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0">
            <FieldLabel icon={<AgentAvatarIcon />} label={t('projects:card.owner')} secondary={t('projects:card.ownerSecondary')} />
            {owner ? (
              <button type="button" onClick={() => selectAgent(owner.id)} className="mt-1.5 flex min-w-0 items-center gap-2 rounded-lg text-left hover:bg-white/[0.04] focus-visible:focus-ring">
                <AgentAvatar agent={owner} size={30} />
                <AgentName agent={owner} className="min-w-0 text-[13px]" />
              </button>
            ) : (
              <p className="mt-1.5 text-sm text-text-muted">{t('projects:card.ownerUnknown')}</p>
            )}
          </div>

          <div className="min-w-0">
            <FieldLabel icon={<span className="inline-block size-3.5 rounded-sm bg-current opacity-60" />} label={t('projects:card.departments')} secondary={t('projects:card.departmentsSecondary')} />
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {project.departmentIds.map((id) => {
                const c = DEPARTMENT_COLOR_VAR[id];
                return (
                  <li key={id} className="inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={{ color: c, borderColor: `color-mix(in srgb, ${c} 45%, transparent)`, background: `color-mix(in srgb, ${c} 12%, transparent)` }}>
                    <DepartmentName id={id} format="short" withDot />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="min-w-0">
            <FieldLabel icon={<Wallet className="size-3.5" />} label={t('projects:card.budget')} secondary={t('projects:card.budgetSecondary')} />
            <p className="mt-1.5 truncate text-sm font-bold text-brand-gold tabular-nums">{project.budgetVnd ? formatVnd(project.budgetVnd, locale) : <span className="font-medium text-text-muted">{t('projects:card.noBudget')}</span>}</p>
          </div>

          <div className="min-w-0">
            <FieldLabel icon={<CalendarRange className="size-3.5" />} label={t('projects:card.timeline')} secondary={t('projects:card.timelineSecondary')} />
            <p className="mt-1.5 truncate text-sm font-semibold text-text tabular-nums">
              {formatDate(project.startAt, locale)}
              {project.endAt ? ` – ${formatDate(project.endAt, locale)}` : ''}
            </p>
            <p className={clsx('text-[11px] font-semibold', timelineTone)}>{timelineNote}</p>
          </div>
        </div>

        {/* Công việc theo trạng thái */}
        <div className="rounded-xl border border-line/60 bg-white/[0.02] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FieldLabel icon={<ListChecks className="size-3.5" />} label={t('projects:card.tasks')} secondary={t('projects:card.tasksSecondary')} />
            <span className="text-xs font-semibold text-text tabular-nums">
              {t('projects:card.doneOf', { done: counts.byStatus.completed, total: counts.total })}
              <span className="ml-1.5 text-text-muted">· {t('projects:card.taskCount', { count: counts.total })}</span>
            </span>
          </div>
          {counts.total === 0 ? (
            <p className="mt-2 text-xs text-text-muted">{t('projects:card.noTasks')}</p>
          ) : (
            <>
              <div className="mt-2.5">
                <TaskStatusBar counts={counts.byStatus} />
              </div>
              <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                {TASK_STATUSES.filter((st) => counts.byStatus[st] > 0).map((st) => {
                  const label = terms(termIdForTaskStatus(st));
                  return (
                    <li key={st} className="flex items-center gap-1.5" title={label.inline}>
                      <span className="size-2 rounded-[2px]" style={{ background: TASK_STATUS_COLOR_VAR[st] }} aria-hidden="true" />
                      <span className="text-text-muted">{label.primary}</span>
                      <span className="font-bold text-text tabular-nums">{counts.byStatus[st]}</span>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setOpen((v) => !v)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-brand-cyan hover:bg-white/[0.05] focus-visible:focus-ring"
              >
                <ChevronDown className={clsx('size-3.5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
                {open ? t('projects:card.hideTasks') : t('projects:card.showTasks')}
              </button>
              {open ? (
                <ul id={listId} className="mt-1 divide-y divide-line/50">
                  {tasks.map((task) => (
                    <ProjectTaskRow key={task.id} task={task} />
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Biểu tượng người phụ trách (vòng tròn nhỏ) – dùng cho nhãn "Chủ trì". */
function AgentAvatarIcon() {
  return <span className="inline-block size-3.5 rounded-full border-2 border-current opacity-70" />;
}

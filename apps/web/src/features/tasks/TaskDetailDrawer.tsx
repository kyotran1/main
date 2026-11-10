import { useCallback, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { CalendarClock, CheckCircle2, CornerLeftUp, FolderKanban, Star, Tag } from 'lucide-react';
import type { Task, TaskPriority, TaskStatus } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForPriority, termIdForProjectStatus, termIdForTaskStatus } from '@ads-nolimit/i18n';
import { api } from '@/lib/api';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName, useAgentDisplayName } from '@/components/domain/AgentName';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { PriorityBadge, StageBadge, TaskStatusBadge } from '@/components/domain/StatusBadges';
import { formatDate, formatTime } from '@/lib/format';
import { TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { DrawerShell, DrawerSection } from '@/features/agents/DrawerShell';
import { Field, Select } from './FormControls';
import { PRIORITY_ORDER, TASK_STATUS_ORDER, isTaskOverdue, overdueDays, selectAssignableAgents, selectChildTasks } from './selectors';

/**
 * NGĂN CHI TIẾT CÔNG VIỆC – mở khi store.selectedTaskId có giá trị. Gắn một lần trong AppShell.
 * Mọi thay đổi gọi api.updateTask; store tự cập nhật qua realtime (task.upserted).
 */
export function TaskDetailDrawer() {
  const { t } = useTranslation();
  const selectedTaskId = useOfficeStore((s) => s.selectedTaskId);
  const selectTask = useOfficeStore((s) => s.selectTask);
  const task = useOfficeStore((s) => (s.selectedTaskId ? s.tasks[s.selectedTaskId] : undefined));
  const close = useCallback(() => selectTask(null), [selectTask]);

  return (
    <DrawerShell
      open={!!selectedTaskId}
      onClose={close}
      label={`${t('tasks:detail.title')} – ${t('tasks:detail.secondary')}`}
      closeLabel={t('tasks:detail.close')}
      accent={task ? TASK_STATUS_COLOR_VAR[task.status] : undefined}
      header={
        task ? (
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <TaskStatusBadge status={task.status} />
              <StageBadge stage={task.stage} />
              <PriorityBadge priority={task.priority} />
              {task.focus ? (
                <Badge color="var(--color-brand-gold)" title={`${t('tasks:detail.focusOnSecondary')} – ${t('tasks:table.focusToday')}`}>
                  <Star className="mr-1 inline size-3 fill-current" aria-hidden="true" />
                  {t('tasks:table.focusToday')}
                </Badge>
              ) : null}
            </div>
            <h2 className="text-base font-bold leading-snug text-text [overflow-wrap:anywhere] md:text-lg">{task.title}</h2>
          </div>
        ) : (
          <p className="text-sm font-semibold text-text">{t('tasks:detail.title')}</p>
        )
      }
    >
      {task ? <TaskBody key={task.id} task={task} /> : <p className="text-sm text-text-muted">{t('tasks:detail.notFound')}</p>}
    </DrawerShell>
  );
}

function TaskBody({ task }: { task: Task }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const uid = useId();
  const displayName = useAgentDisplayName();
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const selectTask = useOfficeStore((s) => s.selectTask);
  const assignee = useOfficeStore((s) => (task.assigneeId ? s.agents[task.assigneeId] : undefined));
  const project = useOfficeStore((s) => (task.projectId ? s.projects[task.projectId] : undefined));
  const parent = useOfficeStore((s) => (task.parentId ? s.tasks[task.parentId] : undefined));
  const children = useDerived(selectChildTasks(task.id), [task.id]);
  const agents = useDerived(selectAssignableAgents);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  const statusColor = TASK_STATUS_COLOR_VAR[task.status];
  const overdue = isTaskOverdue(task);
  const lateDays = overdueDays(task);
  const done = task.status === 'completed';

  const patch = async (field: string, body: Parameters<typeof api.updateTask>[1]) => {
    setBusy(field);
    setError(null);
    try {
      await api.updateTask(task.id, body);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(null);
    }
  };

  const dateCell = (label: string, iso: string | undefined, highlight?: boolean) => (
    <div className="rounded-xl border border-line bg-white/[0.03] px-3 py-2">
      <span className="block text-[11px] text-text-muted">{label}</span>
      {iso ? (
        <span className={clsx('block text-sm font-semibold tabular-nums', highlight ? 'text-brand-red' : 'text-text')}>
          {formatDate(iso, locale)} <span className="text-xs font-normal text-text-muted">{formatTime(iso, locale)}</span>
        </span>
      ) : (
        <span className="block text-sm text-text-dim">{t('tasks:detail.notYet')}</span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Mô tả – dữ liệu do Agent/Owner tạo, giữ nguyên xuống dòng */}
      <p className={clsx('whitespace-pre-wrap text-sm leading-relaxed', task.description ? 'text-text-muted' : 'italic text-text-dim')}>
        {task.description || t('tasks:detail.noDescription')}
      </p>

      {/* Tiến độ */}
      <DrawerSection label={t('tasks:detail.progress')} secondary={t('tasks:detail.progressSecondary')} action={<span className="text-xl font-extrabold tabular-nums" style={{ color: statusColor }}>{task.progress}%</span>}>
        <ProgressBar value={task.progress} color={statusColor} size="md" label={`${t('tasks:detail.progress')}: ${task.progress}%`} />
      </DrawerSection>

      {/* Phụ trách / phòng ban / dự án */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="term-stack" title={`${t('tasks:detail.assigneeSecondary')} – ${t('tasks:detail.assignee')}`}>
            <span className="term-primary text-xs">{t('tasks:detail.assignee')}</span>
            <span className="term-secondary">{t('tasks:detail.assigneeSecondary')}</span>
          </span>
          {assignee ? (
            <button
              type="button"
              onClick={() => selectAgent(assignee.id)}
              title={t('tasks:detail.openAgent')}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.03] p-2 text-left transition hover:border-line-strong hover:bg-white/[0.06] focus-visible:focus-ring"
            >
              <AgentAvatar agent={assignee} size={36} />
              <AgentName agent={assignee} className="min-w-0 flex-1 text-[13px]" />
            </button>
          ) : (
            <p className="rounded-xl border border-dashed border-line px-3 py-2.5 text-xs text-text-muted">{t('tasks:detail.unassigned')}</p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="term-stack" title={`${t('tasks:detail.departmentSecondary')} – ${t('tasks:detail.department')}`}>
              <span className="term-primary text-xs">{t('tasks:detail.department')}</span>
              <span className="term-secondary">{t('tasks:detail.departmentSecondary')}</span>
            </span>
            <DepartmentName id={task.departmentId} withDot className="max-w-full text-sm" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="term-stack" title={`${t('tasks:detail.projectSecondary')} – ${t('tasks:detail.project')}`}>
              <span className="term-primary text-xs">{t('tasks:detail.project')}</span>
              <span className="term-secondary">{t('tasks:detail.projectSecondary')}</span>
            </span>
            {project ? (
              <span className="flex items-start gap-1.5 text-sm text-text" title={bilingual(termIdForProjectStatus(project.status), locale).inline}>
                <FolderKanban className="mt-0.5 size-4 shrink-0 text-brand-violet" aria-hidden="true" />
                <span className="line-clamp-2 min-w-0">{project.name}</span>
              </span>
            ) : (
              <span className="text-xs text-text-dim">{t('tasks:detail.noProject')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Mốc thời gian */}
      <DrawerSection
        label={t('tasks:detail.timeline')}
        secondary={t('tasks:detail.timelineSecondary')}
        action={
          overdue && lateDays > 0 ? (
            <Badge color="var(--color-status-error)" dot>
              {t('tasks:table.overdueBy', { count: lateDays })}
            </Badge>
          ) : undefined
        }
      >
        <div className="grid grid-cols-2 gap-2">
          {dateCell(t('tasks:detail.createdAt'), task.createdAt)}
          {dateCell(t('tasks:detail.startedAt'), task.startedAt)}
          {dateCell(t('tasks:detail.dueAt'), task.dueAt, overdue)}
          {dateCell(t('tasks:detail.completedAt'), task.completedAt)}
        </div>
      </DrawerSection>

      {/* Công việc cha / con */}
      {parent ? (
        <DrawerSection label={t('tasks:detail.parent')} secondary={t('tasks:detail.parentSecondary')}>
          <TaskLink task={parent} onOpen={() => selectTask(parent.id)} icon={<CornerLeftUp className="size-3.5 text-brand-cyan" aria-hidden="true" />} />
        </DrawerSection>
      ) : null}
      {children.length > 0 ? (
        <DrawerSection label={t('tasks:detail.children')} secondary={t('tasks:detail.childrenSecondary')} action={<span className="text-xs text-text-muted">{t('tasks:detail.childrenCount', { count: children.length })}</span>}>
          <ul className="flex flex-col gap-1.5">
            {children.map((c) => (
              <li key={c.id}>
                <TaskLink task={c} onOpen={() => selectTask(c.id)} />
              </li>
            ))}
          </ul>
        </DrawerSection>
      ) : null}

      {/* Thẻ */}
      <DrawerSection label={t('tasks:detail.tags')} secondary={t('tasks:detail.tagsSecondary')}>
        {task.tags.length === 0 ? (
          <p className="text-xs text-text-dim">{t('tasks:detail.noTags')}</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <li key={tag} className="inline-flex items-center gap-1 rounded-md border border-line bg-bg-deep/50 px-2 py-1 text-[11px] text-text">
                <Tag className="size-3 text-text-muted" aria-hidden="true" />
                {tag}
              </li>
            ))}
          </ul>
        )}
      </DrawerSection>

      {/* Thao tác */}
      <DrawerSection label={t('tasks:detail.actions')} secondary={t('tasks:detail.actionsSecondary')} className="pb-2">
        {error ? (
          <div className="mb-3">
            <ErrorBanner error={error} />
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('tasks:detail.changeStatus')} htmlFor={`${uid}-status`}>
            <Select
              id={`${uid}-status`}
              value={task.status}
              disabled={busy !== null}
              onChange={(e) => void patch('status', { status: e.target.value as TaskStatus })}
              options={TASK_STATUS_ORDER.map((s) => ({ value: s, label: bilingual(termIdForTaskStatus(s), locale).inline }))}
            />
          </Field>
          <Field label={t('tasks:detail.changePriority')} htmlFor={`${uid}-priority`}>
            <Select
              id={`${uid}-priority`}
              value={task.priority}
              disabled={busy !== null}
              onChange={(e) => void patch('priority', { priority: e.target.value as TaskPriority })}
              options={PRIORITY_ORDER.map((p) => ({ value: p, label: bilingual(termIdForPriority(p), locale).inline }))}
            />
          </Field>
          <Field label={t('tasks:detail.changeAssignee')} htmlFor={`${uid}-assignee`} className="sm:col-span-2">
            <Select
              id={`${uid}-assignee`}
              value={task.assigneeId ?? ''}
              disabled={busy !== null}
              onChange={(e) => void patch('assignee', { assigneeId: e.target.value || null })}
              options={[{ value: '', label: t('tasks:detail.unassigned') }, ...agents.map((a) => ({ value: a.id, label: displayName(a) }))]}
            />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Star className={clsx('size-4', task.focus && 'fill-current text-brand-gold')} aria-hidden="true" />}
            loading={busy === 'focus'}
            disabled={busy !== null}
            onClick={() => void patch('focus', { focus: !task.focus })}
            aria-pressed={!!task.focus}
            title={`${t('tasks:detail.focusOnSecondary')} – ${t('tasks:table.focusToday')}`}
          >
            {task.focus ? t('tasks:detail.focusOff') : t('tasks:detail.focusOn')}
          </Button>
          <Button
            variant="success"
            size="sm"
            icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
            loading={busy === 'complete'}
            disabled={busy !== null || done}
            onClick={() => void patch('complete', { status: 'completed', progress: 100 })}
            title={`${t('tasks:detail.completeSecondary')} – ${t('tasks:detail.complete')}`}
          >
            {done ? t('tasks:detail.completed') : t('tasks:detail.complete')}
          </Button>
          {busy ? (
            <span role="status" className="inline-flex items-center gap-1.5 text-xs text-text-muted">
              <CalendarClock className="size-3.5 animate-pulse-soft" aria-hidden="true" />
              {t('tasks:detail.saving')}
            </span>
          ) : null}
        </div>
      </DrawerSection>
    </div>
  );
}

function TaskLink({ task, onOpen, icon }: { task: Task; onOpen: () => void; icon?: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onOpen}
      title={t('tasks:detail.openTask', { title: task.title })}
      className="flex w-full items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-2.5 py-2 text-left transition hover:border-line-strong hover:bg-white/[0.06] focus-visible:focus-ring"
    >
      {icon}
      <span className="min-w-0 flex-1 truncate text-[13px] text-text">{task.title}</span>
      <span className="shrink-0 text-[11px] font-semibold tabular-nums text-text-muted">{task.progress}%</span>
      <TaskStatusBadge status={task.status} short />
    </button>
  );
}

import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { CalendarClock, Star } from 'lucide-react';
import type { Task } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName } from '@/components/domain/AgentName';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { PriorityBadge, StageBadge, TaskStatusBadge } from '@/components/domain/StatusBadges';
import { formatDateShort } from '@/lib/format';
import { TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { isTaskOverdue, overdueDays } from './selectors';

/** Thẻ công việc gọn – dùng cho danh sách di động và cột Kanban. */
export function TaskCard({ task, draggable, onDragStart, onDragEnd, dragging, compact }: { task: Task; draggable?: boolean; onDragStart?: (e: React.DragEvent) => void; onDragEnd?: () => void; dragging?: boolean; compact?: boolean }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const selectTask = useOfficeStore((s) => s.selectTask);
  const assignee = useOfficeStore((s) => (task.assigneeId ? s.agents[task.assigneeId] : undefined));
  const overdue = isTaskOverdue(task);
  const lateDays = overdueDays(task);
  const statusColor = TASK_STATUS_COLOR_VAR[task.status];

  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={clsx(
        'glass relative flex min-w-0 flex-col gap-2 p-3 transition',
        draggable && 'cursor-grab active:cursor-grabbing',
        dragging && 'opacity-40',
        task.status === 'completed' && 'opacity-80',
      )}
      style={{ boxShadow: `inset 3px 0 0 ${statusColor}` }}
    >
      <button type="button" onClick={() => selectTask(task.id)} title={t('tasks:table.openTask', { title: task.title })} className="absolute inset-0 rounded-card focus-visible:focus-ring" aria-label={t('tasks:table.openTask', { title: task.title })} />
      <div className="pointer-events-none relative flex items-start justify-between gap-2">
        <p className={clsx('min-w-0 flex-1 font-medium leading-snug text-text', compact ? 'line-clamp-2 text-[13px]' : 'line-clamp-2 text-sm')}>
          {task.focus ? <Star className="mr-1 inline size-3.5 fill-current text-brand-gold" aria-hidden="true" /> : null}
          {task.title}
        </p>
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="pointer-events-none relative flex flex-wrap items-center gap-1.5">
        {!compact ? <TaskStatusBadge status={task.status} /> : null}
        <StageBadge stage={task.stage} />
        <DepartmentName id={task.departmentId} format="short" withDot className="text-[11px] text-text-muted" />
      </div>
      <div className="pointer-events-none relative flex items-center gap-2">
        <ProgressBar value={task.progress} color={statusColor} size="xs" className="flex-1" label={`${t('tasks:table.progress')}: ${task.progress}%`} />
        <span className="w-9 text-right text-[11px] font-semibold tabular-nums text-text">{task.progress}%</span>
      </div>
      <div className="pointer-events-none relative flex items-center justify-between gap-2">
        {assignee ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <AgentAvatar agent={assignee} size={22} showStatus={false} />
            <AgentName agent={assignee} format="primary" className="truncate text-[11px] text-text-muted" />
          </span>
        ) : (
          <span className="text-[11px] text-text-dim">{t('tasks:table.unassigned')}</span>
        )}
        <span className={clsx('inline-flex shrink-0 items-center gap-1 text-[11px] tabular-nums', overdue ? 'font-bold text-brand-red' : 'text-text-muted')}>
          <CalendarClock className="size-3" aria-hidden="true" />
          {task.dueAt ? (overdue && lateDays > 0 ? t('tasks:table.overdueBy', { count: lateDays }) : formatDateShort(task.dueAt, locale)) : t('tasks:table.noDue')}
        </span>
      </div>
    </article>
  );
}

/** Danh sách thẻ công việc cho màn hình hẹp (< md). */
export function TaskCardList({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} />
        </li>
      ))}
    </ul>
  );
}

import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { ArrowDown, ArrowUp, ArrowUpDown, CornerDownRight, Star } from 'lucide-react';
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
import { isDueToday, isTaskOverdue, overdueDays, type SortDir, type SortKey } from './selectors';

interface Column {
  key: SortKey;
  labelKey: string;
  secondaryKey: string;
  className?: string;
}

const COLUMNS: Column[] = [
  { key: 'title', labelKey: 'tasks:table.task', secondaryKey: 'tasks:table.taskSecondary', className: 'min-w-[200px]' },
  { key: 'assignee', labelKey: 'tasks:table.assignee', secondaryKey: 'tasks:table.assigneeSecondary', className: 'min-w-[160px]' },
  { key: 'department', labelKey: 'tasks:table.department', secondaryKey: 'tasks:table.departmentSecondary', className: 'hidden min-w-[128px] 2xl:table-cell' },
  { key: 'stage', labelKey: 'tasks:table.stage', secondaryKey: 'tasks:table.stageSecondary' },
  { key: 'status', labelKey: 'tasks:table.status', secondaryKey: 'tasks:table.statusSecondary' },
  { key: 'priority', labelKey: 'tasks:table.priority', secondaryKey: 'tasks:table.prioritySecondary' },
  { key: 'progress', labelKey: 'tasks:table.progress', secondaryKey: 'tasks:table.progressSecondary', className: 'min-w-[118px]' },
  { key: 'due', labelKey: 'tasks:table.due', secondaryKey: 'tasks:table.dueSecondary', className: 'min-w-[96px]' },
];

export interface TaskTableProps {
  tasks: Task[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

/** Bảng công việc (≥ md): đầu cột song ngữ có thể sắp xếp, hạn quá hạn tô đỏ, bấm hàng → mở ngăn chi tiết. */
export function TaskTable({ tasks, sortKey, sortDir, onSort }: TaskTableProps) {
  const { t } = useTranslation();
  const selectTask = useOfficeStore((s) => s.selectTask);

  return (
    <div className="glass overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-white/[0.03] text-left">
              {COLUMNS.map((col) => {
                const active = sortKey === col.key;
                const label = t(col.labelKey);
                const secondary = t(col.secondaryKey);
                return (
                  <th key={col.key} scope="col" className={clsx('px-2.5 py-2.5 font-semibold', col.className)} aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      title={`${t('tasks:table.sortBy', { column: label })} (${active ? (sortDir === 'asc' ? t('tasks:table.sortAsc') : t('tasks:table.sortDesc')) : secondary})`}
                      className={clsx('group inline-flex items-center gap-1.5 rounded-md text-left focus-visible:focus-ring', active ? 'text-text' : 'text-text-muted hover:text-text')}
                    >
                      <span className="term-stack">
                        <span className="term-primary text-xs">{label}</span>
                        <span className="term-secondary">{secondary}</span>
                      </span>
                      {active ? (
                        sortDir === 'asc' ? <ArrowUp className="size-3.5 text-brand-cyan" aria-hidden="true" /> : <ArrowDown className="size-3.5 text-brand-cyan" aria-hidden="true" />
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-0 transition group-hover:opacity-60" aria-hidden="true" />
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onOpen={() => selectTask(task.id)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TaskRow({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const assignee = useOfficeStore((s) => (task.assigneeId ? s.agents[task.assigneeId] : undefined));
  const overdue = isTaskOverdue(task);
  const lateDays = overdueDays(task);
  const today = isDueToday(task);
  const statusColor = TASK_STATUS_COLOR_VAR[task.status];

  return (
    <tr
      tabIndex={0}
      role="link"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      title={t('tasks:table.openTask', { title: task.title })}
      className={clsx('cursor-pointer border-b border-line/60 transition last:border-b-0 hover:bg-white/[0.04] focus-visible:focus-ring focus-visible:relative', task.status === 'completed' && 'opacity-75')}
    >
      <td className="px-2.5 py-2.5 align-top">
        <div className="flex items-start gap-2">
          <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} aria-hidden="true" />
          <div className="min-w-0">
            <p className="line-clamp-2 font-medium leading-snug text-text">{task.title}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-text-muted">
              {task.focus ? (
                <span className="inline-flex items-center gap-1 text-brand-gold" title={`${t('tasks:detail.focusOnSecondary')} – ${t('tasks:table.focusToday')}`}>
                  <Star className="size-3 fill-current" aria-hidden="true" />
                  {t('tasks:table.focusToday')}
                </span>
              ) : null}
              {task.parentId ? (
                <span className="inline-flex items-center gap-1" title={t('tasks:table.subtask')}>
                  <CornerDownRight className="size-3" aria-hidden="true" />
                  {t('tasks:table.subtask')}
                </span>
              ) : null}
              {task.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded bg-white/[0.05] px-1.5 py-px">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </td>
      <td className="px-2.5 py-2.5 align-top">
        {assignee ? (
          <span className="flex items-center gap-2">
            <AgentAvatar agent={assignee} size={28} />
            <AgentName agent={assignee} className="min-w-0 text-xs" />
          </span>
        ) : (
          <span className="text-xs text-text-dim">{t('tasks:table.unassigned')}</span>
        )}
      </td>
      <td className="hidden px-2.5 py-2.5 align-top 2xl:table-cell">
        <DepartmentName id={task.departmentId} format="short" withDot className="text-xs text-text" />
      </td>
      <td className="px-2.5 py-2.5 align-top">
        <StageBadge stage={task.stage} />
      </td>
      <td className="px-2.5 py-2.5 align-top">
        <TaskStatusBadge status={task.status} />
      </td>
      <td className="px-2.5 py-2.5 align-top">
        <PriorityBadge priority={task.priority} />
      </td>
      <td className="px-2.5 py-2.5 align-top">
        <div className="flex items-center gap-2">
          <ProgressBar value={task.progress} color={statusColor} size="xs" className="flex-1" label={`${t('tasks:table.progress')}: ${task.progress}%`} />
          <span className="w-9 text-right text-xs font-semibold tabular-nums text-text">{task.progress}%</span>
        </div>
      </td>
      <td className="px-2.5 py-2.5 align-top">
        {task.dueAt ? (
          <span className={clsx('flex flex-col text-xs tabular-nums', overdue ? 'font-bold text-brand-red' : today ? 'font-semibold text-brand-amber' : 'text-text')}>
            {formatDateShort(task.dueAt, locale)}
            {overdue && lateDays > 0 ? <span className="text-[11px] font-medium">{t('tasks:table.overdueBy', { count: lateDays })}</span> : null}
            {!overdue && today ? <span className="text-[11px] font-medium">{t('tasks:table.dueToday')}</span> : null}
          </span>
        ) : (
          <span className="text-xs text-text-dim">{t('tasks:table.noDue')}</span>
        )}
      </td>
    </tr>
  );
}

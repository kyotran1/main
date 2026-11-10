import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { ArrowRight, SquareCheckBig } from 'lucide-react';
import type { Task } from '@ads-nolimit/shared';
import { isTaskOpen } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { formatDateShort, formatPercent } from '@/lib/format';
import { TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName } from '@/components/domain/AgentName';
import { PriorityBadge, TaskStatusBadge } from '@/components/domain/StatusBadges';
import { CEO_TASK_TABS, filterTasksByTab, selectCeoTaskBoard, type CeoTaskTab } from './selectors';

const ROW_LIMIT = 8;

/**
 * "Task Management – Quản lý công việc" rút gọn trên Trung tâm điều hành:
 * tab theo trạng thái (có đếm); bảng khi vùng chứa đủ rộng (container query ≥ 28rem),
 * cột "Phụ trách" tách riêng từ 40rem (hẹp hơn thì hiện dưới tên nhiệm vụ);
 * danh sách thẻ ở điện thoại. Bấm hàng → selectTask (mở ngăn chi tiết).
 */
export function CeoTaskTable({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<CeoTaskTab>('all');
  const board = useDerived(selectCeoTaskBoard);
  const rows = filterTasksByTab(board.all, tab).slice(0, ROW_LIMIT);

  return (
    <Card accent="green" className={clsx('@container', className)}>
      <CardHeader
        icon={<SquareCheckBig className="size-4.5" aria-hidden="true" />}
        title={t('glossary:module.task_management.label')}
        subtitle={t('glossary:module.task_management.secondary')}
        action={
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-cyan hover:underline focus-visible:focus-ring"
            title={`${t('ceo:tasks.viewAll')} – ${t('ceo:tasks.viewAllSecondary')}`}
          >
            {t('ceo:tasks.viewAll')}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <div role="tablist" aria-label={t('glossary:module.task_status.inline')} className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {CEO_TASK_TABS.map((key) => {
          const active = key === tab;
          return (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={clsx(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:focus-ring',
                active
                  ? 'border-brand-cyan/60 bg-brand-cyan/15 text-brand-cyan shadow-[0_0_14px_rgba(34,211,238,0.25)]'
                  : 'border-line bg-white/[0.03] text-text-muted hover:bg-white/[0.07] hover:text-text',
              )}
            >
              {t(`ceo:tasks.tabs.${key}`)}
              <span className={clsx('rounded-full px-1.5 py-px text-[10px] tabular-nums', active ? 'bg-brand-cyan/25 text-text' : 'bg-white/10 text-text-muted')}>
                {board.counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState title={t('ceo:tasks.empty')} icon={<SquareCheckBig className="size-7" aria-hidden="true" />} />
      ) : (
        <>
          {/* Bảng – vùng chứa ≥ 28rem */}
          <div className="hidden @min-[28rem]:block">
            <table className="w-full border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  <Th className="w-8">{t('ceo:tasks.columns.index')}</Th>
                  <Th>
                    <ColLabel primary={t('ceo:tasks.columns.task')} secondary={t('ceo:tasks.columns.taskSecondary')} />
                  </Th>
                  <Th className="hidden w-[26%] @min-[40rem]:table-cell">
                    <ColLabel primary={t('ceo:tasks.columns.assignee')} secondary={t('ceo:tasks.columns.assigneeSecondary')} />
                  </Th>
                  <Th className="w-[76px]">
                    <ColLabel primary={t('ceo:tasks.columns.priority')} secondary={t('ceo:tasks.columns.prioritySecondary')} />
                  </Th>
                  <Th className="w-[104px]">
                    <ColLabel primary={t('ceo:tasks.columns.progress')} secondary={t('ceo:tasks.columns.progressSecondary')} />
                  </Th>
                  <Th className="w-[56px]">
                    <ColLabel primary={t('ceo:tasks.columns.due')} secondary={t('ceo:tasks.columns.dueSecondary')} />
                  </Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((task, idx) => (
                  <TaskRow key={task.id} task={task} index={idx + 1} />
                ))}
              </tbody>
            </table>
          </div>
          {/* Danh sách thẻ – vùng chứa hẹp (điện thoại) */}
          <ul className="flex flex-col gap-2 @min-[28rem]:hidden">
            {rows.map((task, idx) => (
              <TaskCardRow key={task.id} task={task} index={idx + 1} />
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={clsx('border-b border-line px-1.5 pb-2 align-bottom text-[11px] font-semibold whitespace-nowrap text-text-muted', className)}>{children}</th>;
}

function ColLabel({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <span className="term-stack" title={`${secondary} – ${primary}`}>
      <span className="term-primary text-[11px] text-text-muted">{primary}</span>
      <span className="term-secondary text-[9px]">{secondary}</span>
    </span>
  );
}

function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={clsx('border-b border-line/50 px-1.5 py-2.5 align-middle', className)}>{children}</td>;
}

function useTaskMeta(task: Task) {
  const { t } = useTranslation();
  const locale = useLocale();
  const assignee = useOfficeStore((s) => (task.assigneeId ? s.agents[task.assigneeId] : undefined));
  const selectTask = useOfficeStore((s) => s.selectTask);
  const isLate = task.status === 'overdue' || (isTaskOpen(task.status) && !!task.dueAt && new Date(task.dueAt).getTime() < Date.now());
  const due = task.dueAt ? formatDateShort(task.dueAt, locale) : t('ceo:tasks.noDue');
  const color = TASK_STATUS_COLOR_VAR[task.status];
  return { t, locale, assignee, selectTask, isLate, due, color };
}

function TaskRow({ task, index }: { task: Task; index: number }) {
  const { t, locale, assignee, selectTask, isLate, due, color } = useTaskMeta(task);
  const open = () => selectTask(task.id);
  return (
    <tr className="group cursor-pointer transition hover:bg-white/[0.04]" onClick={open} title={t('ceo:tasks.openTask', { title: task.title })}>
      <Td className="text-xs text-text-dim tabular-nums">{String(index).padStart(2, '0')}</Td>
      <Td className="w-full max-w-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="block w-full truncate rounded text-left text-[13px] font-medium text-text group-hover:text-brand-cyan focus-visible:focus-ring"
        >
          {task.title}
        </button>
        {/* Người phụ trách hiện dưới tên khi chưa đủ rộng cho cột riêng */}
        <span className="mt-1 flex min-w-0 items-center gap-1.5 @min-[40rem]:hidden">
          {assignee ? (
            <>
              <AgentAvatar agent={assignee} size={16} showStatus={false} />
              <AgentName agent={assignee} format="primary" className="truncate text-[11px] text-text-muted" />
            </>
          ) : (
            <span className="text-[11px] text-text-dim">{t('ceo:tasks.unassigned')}</span>
          )}
        </span>
      </Td>
      <Td className="hidden @min-[40rem]:table-cell">
        {assignee ? (
          <span className="flex min-w-0 items-center gap-2">
            <AgentAvatar agent={assignee} size={24} showStatus={false} />
            <AgentName agent={assignee} format="primary" className="truncate text-xs text-text" />
          </span>
        ) : (
          <span className="text-xs text-text-dim">{t('ceo:tasks.unassigned')}</span>
        )}
      </Td>
      <Td>
        <PriorityBadge priority={task.priority} />
      </Td>
      <Td>
        <span className="flex items-center gap-2">
          <ProgressBar value={task.progress} color={color} size="xs" className="flex-1" label={t('ceo:tasks.progressValue', { percent: task.progress })} />
          <span className="w-9 shrink-0 text-right text-[11px] font-semibold text-text tabular-nums">{formatPercent(task.progress, locale)}</span>
        </span>
      </Td>
      <Td className={clsx('text-xs whitespace-nowrap tabular-nums', isLate ? 'font-bold text-brand-red' : 'text-text-muted')}>{due}</Td>
    </tr>
  );
}

function TaskCardRow({ task, index }: { task: Task; index: number }) {
  const { t, locale, assignee, selectTask, isLate, due, color } = useTaskMeta(task);
  return (
    <li>
      <button
        type="button"
        onClick={() => selectTask(task.id)}
        className="w-full rounded-xl border border-line bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06] focus-visible:focus-ring"
        title={t('ceo:tasks.openTask', { title: task.title })}
      >
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-[11px] text-text-dim tabular-nums">{String(index).padStart(2, '0')}</span>
          <p className="min-w-0 flex-1 line-clamp-2 text-[13px] font-semibold leading-snug text-text">{task.title}</p>
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          {assignee ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <AgentAvatar agent={assignee} size={20} showStatus={false} />
              <AgentName agent={assignee} format="primary" className="truncate text-[11px] text-text-muted" />
            </span>
          ) : (
            <span className="text-[11px] text-text-dim">{t('ceo:tasks.unassigned')}</span>
          )}
          <span className={clsx('shrink-0 text-[11px] tabular-nums', isLate ? 'font-bold text-brand-red' : 'text-text-muted')}>
            {t('common:time.dueOn', { date: due })}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar value={task.progress} color={color} size="xs" className="flex-1" label={t('ceo:tasks.progressValue', { percent: task.progress })} />
          <span className="w-9 text-right text-[11px] font-semibold text-text tabular-nums">{formatPercent(task.progress, locale)}</span>
          <TaskStatusBadge status={task.status} short />
        </div>
      </button>
    </li>
  );
}

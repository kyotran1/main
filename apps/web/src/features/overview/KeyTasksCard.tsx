import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Loader2, SquareCheckBig } from 'lucide-react';
import { clsx } from 'clsx';
import type { Task } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { AgentName } from '@/components/domain/AgentName';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { PriorityBadge } from '@/components/domain/StatusBadges';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { selectTodaysKeyTasks } from '@/store/selectors';
import { api } from '@/lib/api';
import { formatDateShort } from '@/lib/format';

/**
 * "Công việc trọng tâm hôm nay": 5 công việc từ selectTodaysKeyTasks(5).
 * Ô đánh dấu gọi api.updateTask(id, { status: 'completed' }); store tự cập nhật qua realtime.
 */
export function KeyTasksCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const tasks = useDerived(selectTodaysKeyTasks(5));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  const complete = async (task: Task) => {
    setBusyId(task.id);
    setError(null);
    try {
      await api.updateTask(task.id, { status: 'completed' });
    } catch (err) {
      setError(err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card accent="cyan" className={clsx('flex flex-col', className)}>
      <CardHeader
        icon={<SquareCheckBig className="size-4.5" />}
        title={<WrapTitle>{t('glossary:module.todays_key_tasks.label')}</WrapTitle>}
        subtitle={t('glossary:module.todays_key_tasks.secondary')}
        action={<ViewAllLink to="/tasks" label={t('glossary:action.view_all.label')} compact />}
      />
      {error ? (
        <div className="mb-3">
          <ErrorBanner error={error} />
        </div>
      ) : null}
      {tasks.length === 0 ? (
        <EmptyState title={t('overview:keyTasks.empty')} description={t('overview:keyTasks.emptyDescription')} icon={<SquareCheckBig className="size-7" />} />
      ) : (
        <ul className="divide-y divide-line/60">
          {tasks.map((task) => (
            <KeyTaskRow key={task.id} task={task} busy={busyId === task.id} onComplete={() => void complete(task)} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function KeyTaskRow({ task, busy, onComplete }: { task: Task; busy: boolean; onComplete: () => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const assignee = useOfficeStore((s) => (task.assigneeId ? s.agents[task.assigneeId] : undefined));
  const selectTask = useOfficeStore((s) => s.selectTask);
  const done = task.status === 'completed';
  const checkboxLabel = done ? t('overview:keyTasks.alreadyDone', { title: task.title }) : t('overview:keyTasks.markDone', { title: task.title });

  return (
    <li className="flex items-center gap-3 py-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={checkboxLabel}
        title={checkboxLabel}
        disabled={done || busy}
        onClick={onComplete}
        className={clsx(
          'flex size-5 shrink-0 items-center justify-center rounded-md border transition focus-visible:focus-ring',
          done
            ? 'border-brand-green bg-brand-green text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]'
            : 'border-line-strong bg-white/[0.03] text-transparent hover:border-brand-cyan hover:text-brand-cyan/60',
          busy && 'cursor-progress',
        )}
      >
        {busy ? <Loader2 className="size-3.5 animate-spin text-brand-cyan" /> : <Check className="size-3.5" strokeWidth={3} />}
      </button>

      <button type="button" className="min-w-0 flex-1 text-left focus-visible:focus-ring rounded-md" onClick={() => selectTask(task.id)} title={`${t('overview:keyTasks.openTask')}: ${task.title}`}>
        {/* Tiêu đề là dữ liệu từ backend – cho phép 2 dòng để đọc được, tooltip mang đủ nội dung */}
        <p className={clsx('line-clamp-2 text-sm leading-snug', done ? 'text-text-muted line-through' : 'text-text')}>
          <span className="font-semibold text-text">
            {assignee ? <AgentName agent={assignee} format="primary" /> : t('overview:keyTasks.unassigned')}
          </span>
          <span className="text-text-dim">: </span>
          {task.title}
        </p>
        <p className="mt-0.5 flex min-w-0 items-center gap-2 text-[11px] text-text-muted">
          <DepartmentName id={task.departmentId} format="short" className="min-w-0 truncate" />
          {task.dueAt ? <span className="shrink-0 text-text-dim">{t('common:time.dueOn', { date: formatDateShort(task.dueAt, locale) })}</span> : null}
        </p>
      </button>

      <PriorityBadge priority={task.priority} />
    </li>
  );
}

/**
 * Liên kết "Xem tất cả" chuẩn ở góc phải đầu thẻ. Với `compact` (thẻ chiếm 1/3 chiều rộng),
 * ở khoảng xl chỉ hiện mũi tên để tiêu đề song ngữ không bị cắt; tooltip/aria-label luôn mang nhãn.
 */
export function ViewAllLink({ to, label, compact }: { to: string; label: string; compact?: boolean }) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-semibold text-brand-cyan transition hover:bg-brand-cyan/10 focus-visible:focus-ring"
    >
      <span className={clsx(compact && 'xl:hidden 2xl:inline')}>{label}</span>
      <ArrowRight className="size-3.5" />
    </Link>
  );
}

/** Tiêu đề thẻ được phép xuống dòng (thay vì cắt bớt) khi thẻ nằm ở cột hẹp. */
export function WrapTitle({ children }: { children: string }) {
  return <span className="block whitespace-normal leading-tight">{children}</span>;
}

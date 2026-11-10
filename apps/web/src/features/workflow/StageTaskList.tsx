import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { ListTodo } from 'lucide-react';
import type { Task, WorkflowStage } from '@ads-nolimit/shared';
import { WORKFLOW_STAGES } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForStage } from '@ads-nolimit/i18n';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { formatPercent } from '@/lib/format';
import { TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { AgentName } from '@/components/domain/AgentName';
import { PriorityBadge, StageBadge, TaskStatusBadge } from '@/components/domain/StatusBadges';
import { selectTasksInStage } from './selectors';

/**
 * Danh sách công việc đang mở ở giai đoạn được chọn (hoặc tất cả giai đoạn):
 * trạng thái, tên (bấm → selectTask), người phụ trách, ưu tiên, tiến độ.
 */
export function StageTaskList({ stage, onSelectStage, className }: { stage: WorkflowStage | null; onSelectStage: (stage: WorkflowStage | null) => void; className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const tasks = useDerived(selectTasksInStage(stage), [stage]);
  const stageLabel = stage ? bilingual(termIdForStage(stage), locale) : null;

  return (
    <Card accent="cyan" className={className}>
      <CardHeader
        icon={<ListTodo className="size-4.5" aria-hidden="true" />}
        title={stageLabel ? `${t('workflow:stageTasks.title')}: ${stageLabel.primary}` : `${t('workflow:stageTasks.title')}: ${t('workflow:stageTasks.all')}`}
        subtitle={`${t('workflow:stageTasks.secondary')} · ${t('workflow:stageTasks.count', { count: tasks.length })}`}
      />

      <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label={t('glossary:module.workflow.inline')}>
        <Chip active={stage === null} onClick={() => onSelectStage(null)} title={t('workflow:stageTasks.all')}>
          {t('workflow:stageTasks.all')}
        </Chip>
        {WORKFLOW_STAGES.map((st) => {
          const label = bilingual(termIdForStage(st), locale);
          return (
            <Chip key={st} active={stage === st} onClick={() => onSelectStage(st)} title={label.inline}>
              {label.short}
            </Chip>
          );
        })}
      </div>

      {tasks.length === 0 ? (
        <EmptyState title={t('workflow:stageTasks.empty')} description={t('workflow:stageTasks.emptyDescription')} icon={<ListTodo className="size-7" aria-hidden="true" />} />
      ) : (
        <ul className="flex flex-col divide-y divide-line/60">
          {tasks.map((task) => (
            <StageTaskRow key={task.id} task={task} showStage={stage === null} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function Chip({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={title}
      className={clsx(
        'shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:focus-ring',
        active ? 'border-brand-cyan/60 bg-brand-cyan/15 text-brand-cyan' : 'border-line bg-white/[0.03] text-text-muted hover:bg-white/[0.07] hover:text-text',
      )}
    >
      {children}
    </button>
  );
}

function StageTaskRow({ task, showStage }: { task: Task; showStage: boolean }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const assignee = useOfficeStore((s) => (task.assigneeId ? s.agents[task.assigneeId] : undefined));
  const selectTask = useOfficeStore((s) => s.selectTask);
  const color = TASK_STATUS_COLOR_VAR[task.status];
  return (
    <li>
      <button
        type="button"
        onClick={() => selectTask(task.id)}
        className="group flex w-full flex-col gap-2 rounded-lg px-1 py-3 text-left transition hover:bg-white/[0.04] focus-visible:focus-ring sm:flex-row sm:items-center sm:gap-4"
        title={t('workflow:stageTasks.openTask', { title: task.title })}
      >
        <span className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5 flex shrink-0 flex-col items-start gap-1">
            <TaskStatusBadge status={task.status} short />
            {showStage ? <StageBadge stage={task.stage} /> : null}
          </span>
          <span className="min-w-0">
            <span className="block line-clamp-2 text-[13px] font-semibold leading-snug text-text group-hover:text-brand-cyan">{task.title}</span>
            <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-text-muted">
              {assignee ? (
                <>
                  <AgentAvatar agent={assignee} size={16} showStatus={false} />
                  <AgentName agent={assignee} format="inline" className="truncate" />
                </>
              ) : (
                <span className="text-text-dim">{t('workflow:stageTasks.unassigned')}</span>
              )}
            </span>
          </span>
        </span>
        <span className="flex w-full shrink-0 items-center gap-3 sm:w-[230px]">
          <PriorityBadge priority={task.priority} />
          <ProgressBar value={task.progress} color={color} size="xs" className="flex-1" label={t('glossary:metric.progress.inline')} />
          <span className="w-10 text-right text-xs font-semibold text-text tabular-nums">{formatPercent(task.progress, locale)}</span>
        </span>
      </button>
    </li>
  );
}

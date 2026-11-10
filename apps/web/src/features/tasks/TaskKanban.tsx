import { useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Loader2, MoveHorizontal } from 'lucide-react';
import type { Task, TaskStatus } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForTaskStatus } from '@ads-nolimit/i18n';
import { api } from '@/lib/api';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { TASK_STATUS_COLOR_VAR } from '@/lib/colors';
import { TaskCard } from './TaskCardList';
import { TASK_STATUS_ORDER, groupByStatus } from './selectors';

const DND_MIME = 'application/x-ads-nolimit-task';

/**
 * Bảng Kanban theo trạng thái: mỗi cột một thanh neon màu trạng thái; kéo-thả HTML5 →
 * api.updateTask({status}); store cập nhật qua realtime nên thẻ tự chuyển cột.
 */
export function TaskKanban({ tasks }: { tasks: Task[] }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const groups = groupByStatus(tasks);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  const onDrop = async (e: DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData(DND_MIME) || draggingId;
    setOverStatus(null);
    setDraggingId(null);
    if (!id) return;
    const task = tasks.find((x) => x.id === id);
    if (!task || task.status === status) return;
    setMovingId(id);
    setError(null);
    try {
      await api.updateTask(id, status === 'completed' ? { status, progress: 100 } : { status });
    } catch (err) {
      setError(err);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="inline-flex items-center gap-1.5 text-xs text-text-muted">
        <MoveHorizontal className="size-3.5" aria-hidden="true" />
        {t('tasks:kanban.dragHint')}
      </p>
      {error ? <ErrorBanner error={error} onRetry={() => setError(null)} /> : null}
      <div className="-mx-3 overflow-x-auto px-3 pb-2 md:mx-0 md:px-0">
        <ol className="flex min-w-max gap-3" aria-label={t('tasks:toolbar.viewKanban')}>
          {TASK_STATUS_ORDER.map((status) => {
            const label = bilingual(termIdForTaskStatus(status), locale);
            const color = TASK_STATUS_COLOR_VAR[status];
            const items = groups[status];
            const isOver = overStatus === status;
            return (
              <li
                key={status}
                className={clsx('glass flex w-[256px] shrink-0 flex-col overflow-hidden p-0 transition', isOver && 'ring-2 ring-brand-cyan/70')}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (overStatus !== status) setOverStatus(status);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOverStatus(null);
                }}
                onDrop={(e) => void onDrop(e, status)}
                aria-label={label.inline}
              >
                <span className="h-1 w-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} aria-hidden="true" />
                <header className="flex items-center justify-between gap-2 px-3 pb-2 pt-2.5" title={label.inline}>
                  <span className="term-stack min-w-0">
                    <span className="term-primary text-[13px]">{label.primary}</span>
                    <span className="term-secondary">{label.secondary}</span>
                  </span>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums" style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}>
                    {t('tasks:kanban.columnCount', { count: items.length })}
                  </span>
                </header>
                <ul className="flex min-h-[120px] flex-1 flex-col gap-2 px-2.5 pb-2.5">
                  {items.length === 0 ? (
                    <li className={clsx('flex flex-1 items-center justify-center rounded-xl border border-dashed px-3 text-center text-[11px]', isOver ? 'border-brand-cyan/70 text-brand-cyan' : 'border-line text-text-dim')}>
                      {isOver && draggingId ? t('tasks:kanban.dropHere', { status: label.primary }) : t('tasks:kanban.empty')}
                    </li>
                  ) : (
                    items.map((task) => (
                      <li key={task.id} className="relative">
                        <TaskCard
                          task={task}
                          compact
                          draggable={movingId === null}
                          dragging={draggingId === task.id}
                          onDragStart={(e) => {
                            e.dataTransfer.setData(DND_MIME, task.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggingId(task.id);
                          }}
                          onDragEnd={() => {
                            setDraggingId(null);
                            setOverStatus(null);
                          }}
                        />
                        {movingId === task.id ? (
                          <span className="absolute inset-0 flex items-center justify-center gap-2 rounded-card bg-bg-base/60 text-xs font-semibold text-text" role="status">
                            <Loader2 className="size-4 animate-spin text-brand-cyan" aria-hidden="true" />
                            {t('tasks:kanban.moving')}
                          </span>
                        ) : null}
                      </li>
                    ))
                  )}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

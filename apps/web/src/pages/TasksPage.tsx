import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, SquareCheckBig } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useAgentDisplayName } from '@/components/domain/AgentName';
import { useOfficeStore } from '@/store/officeStore';
import { useTasks } from '@/store/hooks';
import { TaskStats } from '@/features/tasks/TaskStats';
import { TaskToolbar } from '@/features/tasks/TaskToolbar';
import { TaskTable } from '@/features/tasks/TaskTable';
import { TaskCardList } from '@/features/tasks/TaskCardList';
import { TaskKanban } from '@/features/tasks/TaskKanban';
import { CreateTaskDialog } from '@/features/tasks/CreateTaskDialog';
import { EMPTY_TASK_FILTER, applyTaskFilter, isTaskFilterDirty, sortTasks, type SortDir, type SortKey, type TaskFilter, type TaskViewMode } from '@/features/tasks/selectors';

const VIEW_STORAGE_KEY = 'ads-nolimit.tasks.view';

function readStoredView(): TaskViewMode {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === 'kanban' ? 'kanban' : 'table';
  } catch {
    return 'table';
  }
}

/**
 * QUẢN LÝ CÔNG VIỆC (/tasks): thống kê (selectTaskCounts) → thanh công cụ (tìm, lọc, Bảng ⇄ Kanban, tạo)
 * → bảng sắp xếp được / danh sách thẻ (di động) / Kanban kéo-thả. Dữ liệu từ store duy nhất.
 */
export default function TasksPage() {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);
  const agents = useOfficeStore((s) => s.agents);
  const tasks = useTasks();
  const displayName = useAgentDisplayName();
  const [filter, setFilter] = useState<TaskFilter>(EMPTY_TASK_FILTER);
  const [view, setView] = useState<TaskViewMode>(readStoredView);
  const [sortKey, setSortKey] = useState<SortKey>('due');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [creating, setCreating] = useState(false);

  const changeView = (next: TaskViewMode) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      /* bộ nhớ trình duyệt không khả dụng – bỏ qua */
    }
  };

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => applyTaskFilter(tasks, filter), [tasks, filter]);
  const sorted = useMemo(
    () => sortTasks(filtered, sortKey, sortDir, (id) => (id ? displayName(agents[id]) : '')),
    // displayName thay đổi theo ngôn ngữ – agents thay đổi theo store
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, sortKey, sortDir, agents],
  );
  const closeCreate = useCallback(() => setCreating(false), []);

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-5">
      <PageHeader termId="module.task_management" icon={<SquareCheckBig className="size-5" />} description={t('tasks:description')} />

      {!hydrated ? (
        <div className="flex flex-col gap-4" role="status" aria-busy="true">
          <div className="glass flex items-center gap-3 px-4 py-3 text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin text-brand-cyan" aria-hidden="true" />
            <span>{t('tasks:loading')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-[76px]" />
            ))}
          </div>
          <div className="skeleton h-[140px]" />
          <div className="skeleton h-[360px]" />
        </div>
      ) : (
        <>
          <TaskStats active={filter.status} onSelect={(status) => setFilter((f) => ({ ...f, status }))} />
          <TaskToolbar filter={filter} onChange={setFilter} view={view} onViewChange={changeView} resultCount={filtered.length} onCreate={() => setCreating(true)} />

          {filtered.length === 0 ? (
            tasks.length === 0 ? (
              <EmptyState
                title={t('tasks:list.emptyAll')}
                description={t('tasks:list.emptyAllDescription')}
                icon={<SquareCheckBig className="size-7" aria-hidden="true" />}
                action={
                  <Button size="sm" onClick={() => setCreating(true)}>
                    {t('tasks:toolbar.create')}
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title={t('tasks:list.empty')}
                description={t('tasks:list.emptyDescription')}
                icon={<SquareCheckBig className="size-7" aria-hidden="true" />}
                action={
                  isTaskFilterDirty(filter) ? (
                    <Button variant="outline" size="sm" onClick={() => setFilter(EMPTY_TASK_FILTER)}>
                      {t('tasks:toolbar.reset')}
                    </Button>
                  ) : undefined
                }
              />
            )
          ) : view === 'kanban' ? (
            <TaskKanban tasks={filtered} />
          ) : (
            <>
              <div className="hidden md:block">
                <TaskTable tasks={sorted} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              </div>
              <div className="md:hidden">
                <TaskCardList tasks={sorted} />
              </div>
            </>
          )}
        </>
      )}

      <CreateTaskDialog open={creating} onClose={closeCreate} />
    </div>
  );
}

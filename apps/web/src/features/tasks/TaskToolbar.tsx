import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { FilterX, KanbanSquare, Plus, Search, Table2 } from 'lucide-react';
import type { DepartmentId, TaskPriority, TaskStatus } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForDepartment, termIdForPriority, termIdForTaskStatus } from '@ads-nolimit/i18n';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { Button } from '@/components/ui/Button';
import { useAgentDisplayName } from '@/components/domain/AgentName';
import { Select } from './FormControls';
import { EMPTY_TASK_FILTER, PRIORITY_ORDER, TASK_STATUS_ORDER, isTaskFilterDirty, selectAssignableAgents, type TaskFilter, type TaskViewMode } from './selectors';

export interface TaskToolbarProps {
  filter: TaskFilter;
  onChange: (next: TaskFilter) => void;
  view: TaskViewMode;
  onViewChange: (view: TaskViewMode) => void;
  resultCount: number;
  onCreate: () => void;
}

/** Thanh công cụ: tìm kiếm, bộ lọc (trạng thái/ưu tiên/phòng ban/phụ trách), đổi Bảng ⇄ Kanban, nút tạo. */
export function TaskToolbar({ filter, onChange, view, onViewChange, resultCount, onCreate }: TaskToolbarProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const displayName = useAgentDisplayName();
  const departments = useOfficeStore((s) => s.departments);
  const agents = useDerived(selectAssignableAgents);
  const dirty = isTaskFilterDirty(filter);

  const allLabel = t('tasks:toolbar.all');
  const set = <K extends keyof TaskFilter>(key: K, value: TaskFilter[K]) => onChange({ ...filter, [key]: value });

  return (
    <div className="glass flex flex-col gap-3 p-3 md:p-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-text-muted" aria-hidden="true" />
          <input
            type="search"
            value={filter.query}
            onChange={(e) => set('query', e.target.value)}
            placeholder={t('tasks:toolbar.searchPlaceholder')}
            aria-label={t('tasks:toolbar.searchLabel')}
            className="h-10 w-full rounded-xl border border-line bg-bg-deep/60 pl-9 pr-3 text-sm text-text placeholder:text-text-dim transition hover:border-line-strong focus:border-brand-cyan/70 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30"
          />
        </label>
        <div className="flex items-center gap-2">
          <div className="flex h-10 rounded-xl border border-line bg-bg-deep/60 p-1" role="group" aria-label={`${t('tasks:toolbar.view')} – ${t('tasks:toolbar.viewSecondary')}`}>
            <ViewButton active={view === 'table'} onClick={() => onViewChange('table')} icon={<Table2 className="size-4" aria-hidden="true" />} label={t('tasks:toolbar.viewTable')} secondary={t('tasks:toolbar.viewTableSecondary')} />
            <ViewButton active={view === 'kanban'} onClick={() => onViewChange('kanban')} icon={<KanbanSquare className="size-4" aria-hidden="true" />} label={t('tasks:toolbar.viewKanban')} secondary={t('tasks:toolbar.viewKanbanSecondary')} />
          </div>
          <Button icon={<Plus className="size-4" aria-hidden="true" />} onClick={onCreate} className="ml-auto" title={`${t('tasks:toolbar.createSecondary')} – ${t('tasks:toolbar.create')}`}>
            {t('tasks:toolbar.create')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <FilterSelect
          label={t('tasks:toolbar.status')}
          secondary={t('tasks:toolbar.statusSecondary')}
          value={filter.status}
          onChange={(v) => set('status', v as TaskStatus | 'all')}
          options={[{ value: 'all', label: allLabel }, ...TASK_STATUS_ORDER.map((s) => ({ value: s, label: bilingual(termIdForTaskStatus(s), locale).inline }))]}
        />
        <FilterSelect
          label={t('tasks:toolbar.priority')}
          secondary={t('tasks:toolbar.prioritySecondary')}
          value={filter.priority}
          onChange={(v) => set('priority', v as TaskPriority | 'all')}
          options={[{ value: 'all', label: allLabel }, ...PRIORITY_ORDER.map((p) => ({ value: p, label: bilingual(termIdForPriority(p), locale).inline }))]}
        />
        <FilterSelect
          label={t('tasks:toolbar.department')}
          secondary={t('tasks:toolbar.departmentSecondary')}
          value={filter.department}
          onChange={(v) => set('department', v as DepartmentId | 'all')}
          options={[{ value: 'all', label: allLabel }, ...departments.filter((d) => !d.functional).map((d) => ({ value: d.id, label: bilingual(termIdForDepartment(d.id), locale).inline }))]}
        />
        <FilterSelect
          label={t('tasks:toolbar.assignee')}
          secondary={t('tasks:toolbar.assigneeSecondary')}
          value={filter.assignee}
          onChange={(v) => set('assignee', v)}
          options={[{ value: 'all', label: allLabel }, ...agents.map((a) => ({ value: a.id, label: displayName(a) }))]}
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-text-muted">
        <span role="status">{t('tasks:toolbar.result', { count: resultCount })}</span>
        {dirty ? (
          <button type="button" onClick={() => onChange(EMPTY_TASK_FILTER)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-brand-cyan hover:bg-white/5 focus-visible:focus-ring">
            <FilterX className="size-3.5" aria-hidden="true" />
            {t('tasks:toolbar.reset')}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FilterSelect({ label, secondary, value, onChange, options }: { label: string; secondary: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="term-stack" title={`${secondary} – ${label}`}>
        <span className="term-primary text-[11px]">{label}</span>
      </span>
      <Select compact value={value} onChange={(e) => onChange(e.target.value)} options={options} aria-label={`${label} – ${secondary}`} className="w-full" />
    </label>
  );
}

function ViewButton({ active, onClick, icon, label, secondary }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; secondary: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={`${label} – ${secondary}`}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition focus-visible:focus-ring',
        active ? 'bg-brand-violet/30 text-text shadow-[0_0_14px_rgba(139,92,246,0.3)] ring-1 ring-brand-violet/60' : 'text-text-muted hover:bg-white/[0.05] hover:text-text',
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

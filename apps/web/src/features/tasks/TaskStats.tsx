import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { AlertTriangle, CheckCircle2, Clock3, Layers, PlayCircle, ShieldAlert } from 'lucide-react';
import type { TaskStatus } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForTaskStatus } from '@ads-nolimit/i18n';
import { useDerived } from '@/store/hooks';
import { selectTaskCounts } from '@/store/selectors';
import { TASK_STATUS_COLOR_VAR } from '@/lib/colors';

type Tile = { status: TaskStatus | 'all'; icon: React.ReactNode; color: string; hintKey: string };

const TILES: Tile[] = [
  { status: 'all', icon: <Layers className="size-4" aria-hidden="true" />, color: 'var(--color-brand-cyan)', hintKey: 'tasks:stats.totalHint' },
  { status: 'in_progress', icon: <PlayCircle className="size-4" aria-hidden="true" />, color: TASK_STATUS_COLOR_VAR.in_progress, hintKey: 'tasks:stats.inProgressHint' },
  { status: 'pending', icon: <Clock3 className="size-4" aria-hidden="true" />, color: TASK_STATUS_COLOR_VAR.pending, hintKey: 'tasks:stats.pendingHint' },
  { status: 'needs_approval', icon: <ShieldAlert className="size-4" aria-hidden="true" />, color: TASK_STATUS_COLOR_VAR.needs_approval, hintKey: 'tasks:stats.needsApprovalHint' },
  { status: 'completed', icon: <CheckCircle2 className="size-4" aria-hidden="true" />, color: TASK_STATUS_COLOR_VAR.completed, hintKey: 'tasks:stats.completedHint' },
  { status: 'overdue', icon: <AlertTriangle className="size-4" aria-hidden="true" />, color: TASK_STATUS_COLOR_VAR.overdue, hintKey: 'tasks:stats.overdueHint' },
];

/** Dải thống kê công việc (selectTaskCounts) – bấm ô để lọc nhanh theo trạng thái. */
export function TaskStats({ active, onSelect }: { active: TaskStatus | 'all'; onSelect: (status: TaskStatus | 'all') => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const counts = useDerived(selectTaskCounts);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6" role="group" aria-label={`${t('tasks:toolbar.status')} – ${t('tasks:toolbar.statusSecondary')}`}>
      {TILES.map((tile) => {
        const status = tile.status;
        const isAll = status === 'all';
        const label =
          status === 'all'
            ? { primary: t('tasks:stats.total'), secondary: t('tasks:stats.totalSecondary'), inline: `${t('tasks:stats.totalSecondary')} – ${t('tasks:stats.total')}` }
            : bilingual(termIdForTaskStatus(status), locale);
        const value = status === 'all' ? counts.total : counts.byStatus[status];
        const hint = t(tile.hintKey, { open: counts.open, rate: counts.completionRate });
        const selected = active === tile.status;
        return (
          <button
            key={tile.status}
            type="button"
            onClick={() => onSelect(selected && !isAll ? 'all' : tile.status)}
            aria-pressed={selected}
            title={label.inline}
            className={clsx('glass relative flex min-w-0 flex-col gap-1 overflow-hidden p-3 text-left transition focus-visible:focus-ring', selected ? 'border-transparent' : 'hover:bg-white/[0.04]')}
            style={selected ? { boxShadow: `0 0 0 1px ${tile.color}, 0 0 24px color-mix(in srgb, ${tile.color} 35%, transparent)` } : undefined}
          >
            <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: tile.color, opacity: selected ? 1 : 0.45 }} aria-hidden="true" />
            <span className="flex items-start justify-between gap-2">
              <span className="text-[26px] font-extrabold leading-none tabular-nums" style={{ color: tile.color }}>
                {value}
              </span>
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                style={{ color: tile.color, background: `color-mix(in srgb, ${tile.color} 16%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tile.color} 40%, transparent)` }}
              >
                {tile.icon}
              </span>
            </span>
            <span className="block truncate text-[13px] font-semibold leading-tight text-text">{label.primary}</span>
            <span className="block truncate text-[11px] text-text-muted">{label.secondary}</span>
            <span className="block truncate text-[11px] text-text-dim">{hint}</span>
          </button>
        );
      })}
    </div>
  );
}

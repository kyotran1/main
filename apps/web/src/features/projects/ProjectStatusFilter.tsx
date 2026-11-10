import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import type { ProjectStatus } from '@ads-nolimit/shared';
import { useTerms } from '@ads-nolimit/i18n/react';
import { termIdForProjectStatus } from '@ads-nolimit/i18n';
import { useDerived } from '@/store/hooks';
import { PROJECT_STATUS_COLOR_VAR } from './ProjectStatusBadge';
import { selectProjectStatusCounts } from './selectors';

export type ProjectFilter = ProjectStatus | 'all';

const ORDER: readonly ProjectStatus[] = ['active', 'planning', 'on_hold', 'completed'];

/** Dải chip lọc theo trạng thái dự án – mỗi chip hiển thị số lượng, tooltip song ngữ. */
export function ProjectStatusFilter({ value, onChange }: { value: ProjectFilter; onChange: (v: ProjectFilter) => void }) {
  const { t } = useTranslation();
  const terms = useTerms();
  const counts = useDerived(selectProjectStatusCounts);
  const total = ORDER.reduce((sum, st) => sum + counts[st], 0);

  const chip = (key: ProjectFilter, label: string, tooltip: string, count: number, color?: string) => {
    const active = value === key;
    return (
      <button
        key={key}
        type="button"
        role="radio"
        aria-checked={active}
        title={tooltip}
        onClick={() => onChange(key)}
        className={clsx(
          'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition focus-visible:focus-ring',
          active ? 'border-transparent text-bg-base' : 'border-line bg-white/[0.03] text-text-muted hover:text-text hover:bg-white/[0.07]',
        )}
        style={active ? { background: color ?? 'var(--color-brand-cyan)', boxShadow: `0 0 14px ${color ?? 'var(--color-brand-cyan)'}` } : undefined}
      >
        {color && !active ? <span className="size-1.5 rounded-full" style={{ background: color }} aria-hidden="true" /> : null}
        <span>{label}</span>
        <span className={clsx('tabular-nums', active ? 'opacity-80' : 'text-text-dim')}>{count}</span>
      </button>
    );
  };

  return (
    <div role="radiogroup" aria-label={`${t('projects:filter.label')} – ${t('projects:filter.secondary')}`} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
      {chip('all', t('projects:filter.all'), `${t('projects:filter.label')} – ${t('projects:filter.secondary')}`, total)}
      {ORDER.map((st) => {
        const label = terms(termIdForProjectStatus(st));
        return chip(st, label.primary, label.inline, counts[st], PROJECT_STATUS_COLOR_VAR[st]);
      })}
    </div>
  );
}

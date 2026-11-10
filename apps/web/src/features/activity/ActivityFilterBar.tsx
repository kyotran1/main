import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { Agent } from '@ads-nolimit/shared';
import { useAgentDisplayName } from '@/components/domain/AgentName';
import { Button } from '@/components/ui/Button';
import { ACTIVITY_KINDS, type ActivityFilterState, type ActivityKind } from './activityFilters';

/** Hộp chọn có nhãn song ngữ nổi phía trên – dùng cho bộ lọc nhân sự và loại sự kiện. */
function LabeledSelect({ id, label, secondary, value, onChange, children }: { id: string; label: string; secondary: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="flex min-w-0 flex-col gap-1" title={`${secondary} – ${label}`}>
      <span className="text-[11px] font-semibold text-text-muted">
        {label} <span className="font-medium text-text-dim">· {secondary}</span>
      </span>
      <span className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full appearance-none truncate rounded-xl border border-line bg-white/[0.04] pr-9 pl-3 text-sm text-text focus-visible:focus-ring">
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-dim" aria-hidden="true" />
      </span>
    </label>
  );
}

/** Thanh bộ lọc nhật ký: theo nhân sự AI, theo loại sự kiện, tìm kiếm; có nút xóa bộ lọc. */
export function ActivityFilterBar({ agents, value, onChange, shown, total }: { agents: Agent[]; value: ActivityFilterState; onChange: (v: ActivityFilterState) => void; shown: number; total: number }) {
  const { t } = useTranslation();
  const displayName = useAgentDisplayName();
  const dirty = value.agentId !== 'all' || value.kind !== 'all' || value.query.trim() !== '';

  return (
    <div className="glass flex flex-col gap-3 p-3 md:p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)]">
        <LabeledSelect id="activity-filter-agent" label={t('activity:filterBar.agent')} secondary={t('activity:filterBar.agentSecondary')} value={value.agentId} onChange={(agentId) => onChange({ ...value, agentId })}>
          <option value="all">{t('activity:filterBar.allAgents')}</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {displayName(a)}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect id="activity-filter-kind" label={t('activity:filterBar.kind')} secondary={t('activity:filterBar.kindSecondary')} value={value.kind} onChange={(kind) => onChange({ ...value, kind: kind as ActivityKind | 'all' })}>
          <option value="all">{t('activity:filterBar.allKinds')}</option>
          {ACTIVITY_KINDS.map((k) => (
            <option key={k} value={k}>
              {t(`activity:kinds.${k}`)}
            </option>
          ))}
        </LabeledSelect>
        <label htmlFor="activity-filter-search" className="flex min-w-0 flex-col gap-1" title={`${t('activity:filterBar.searchSecondary')} – ${t('activity:filterBar.search')}`}>
          <span className="text-[11px] font-semibold text-text-muted">
            {t('activity:filterBar.search')} <span className="font-medium text-text-dim">· {t('activity:filterBar.searchSecondary')}</span>
          </span>
          <span className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-dim" aria-hidden="true" />
            <input
              id="activity-filter-search"
              type="search"
              value={value.query}
              onChange={(e) => onChange({ ...value, query: e.target.value })}
              placeholder={t('activity:filterBar.searchPlaceholder')}
              className="h-10 w-full rounded-xl border border-line bg-white/[0.04] pr-3 pl-9 text-sm text-text placeholder:text-text-dim focus-visible:focus-ring"
            />
          </span>
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={clsx('text-xs tabular-nums', dirty ? 'font-semibold text-brand-cyan' : 'text-text-muted')}>{t('activity:filterBar.resultOf', { shown, total })}</p>
        {dirty ? (
          <Button variant="ghost" size="sm" icon={<X className="size-3.5" />} onClick={() => onChange({ agentId: 'all', kind: 'all', query: '' })}>
            {t('activity:filterBar.clear')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

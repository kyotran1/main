import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { AlertOctagon, Clock3, Coffee, PauseCircle, PlayCircle, Radio, Users } from 'lucide-react';
import type { AgentStatus } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForAgentStatus } from '@ads-nolimit/i18n';
import { useDerived } from '@/store/hooks';
import { selectAgentCounts } from '@/store/selectors';
import { AGENT_STATUS_COLOR_VAR } from '@/lib/colors';
import { selectStaffedDepartmentCount } from './selectors';

type Tile = { status: AgentStatus | 'all'; icon: React.ReactNode; color: string; hintKey: string };

const TILES: Tile[] = [
  { status: 'all', icon: <Users className="size-4" aria-hidden="true" />, color: 'var(--color-brand-cyan)', hintKey: 'agents:stats.totalHint' },
  { status: 'running', icon: <PlayCircle className="size-4" aria-hidden="true" />, color: AGENT_STATUS_COLOR_VAR.running, hintKey: 'agents:stats.runningHint' },
  { status: 'active', icon: <Radio className="size-4" aria-hidden="true" />, color: AGENT_STATUS_COLOR_VAR.active, hintKey: 'agents:stats.activeHint' },
  { status: 'waiting', icon: <Clock3 className="size-4" aria-hidden="true" />, color: AGENT_STATUS_COLOR_VAR.waiting, hintKey: 'agents:stats.waitingHint' },
  { status: 'idle', icon: <Coffee className="size-4" aria-hidden="true" />, color: AGENT_STATUS_COLOR_VAR.idle, hintKey: 'agents:stats.idleHint' },
  { status: 'paused', icon: <PauseCircle className="size-4" aria-hidden="true" />, color: AGENT_STATUS_COLOR_VAR.paused, hintKey: 'agents:stats.pausedHint' },
];

/** Dải thống kê nhân sự AI (selectAgentCounts) – bấm ô để lọc nhanh theo trạng thái. */
export function AgentStats({ active, onSelect }: { active: AgentStatus | 'all'; onSelect: (status: AgentStatus | 'all') => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const counts = useDerived(selectAgentCounts);
  const departments = useDerived(selectStaffedDepartmentCount);
  const errors = counts.byStatus.error;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6" role="group" aria-label={`${t('agents:filters.status')} – ${t('agents:filters.statusSecondary')}`}>
      {TILES.map((tile) => {
        const status = tile.status;
        const isAll = status === 'all';
        const label =
          status === 'all'
            ? { primary: t('agents:stats.total'), secondary: t('agents:stats.totalSecondary'), inline: `${t('agents:stats.totalSecondary')} – ${t('agents:stats.total')}` }
            : bilingual(termIdForAgentStatus(status), locale);
        const value = status === 'all' ? counts.total : counts.byStatus[status];
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
            <span className="block truncate text-[11px] text-text-dim">{t(tile.hintKey, { departments })}</span>
            {tile.status === 'paused' && errors > 0 ? (
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-brand-red/15 px-2 py-0.5 text-[11px] font-bold text-brand-red" title={`${bilingual(termIdForAgentStatus('error'), locale).inline}: ${errors}`}>
                <AlertOctagon className="size-3" aria-hidden="true" />
                {errors}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

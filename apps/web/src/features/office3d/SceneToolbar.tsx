import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { ChevronDown, Filter, Maximize2, Minimize2, RotateCcw, Tag, Tags, Wifi, WifiOff } from 'lucide-react';
import type { AgentStatus, DepartmentId } from '@ads-nolimit/shared';
import { bilingual, termIdForAgentStatus, termIdForDepartment } from '@ads-nolimit/i18n';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { AGENT_STATUS_COLOR_VAR } from '@/lib/colors';
import { formatTime } from '@/lib/format';
import { Button } from '@/components/ui/Button';

const LEGEND_STATUSES: readonly AgentStatus[] = ['running', 'active', 'waiting', 'idle', 'paused', 'error'];

/** Thanh công cụ nổi trên cảnh: đồng bộ realtime, lọc phòng ban, nhãn, góc nhìn, toàn màn hình. */
export function SceneToolbar({
  filterDepartmentId,
  onFilterChange,
  showLabels,
  onToggleLabels,
  onResetView,
  isFullscreen,
  onToggleFullscreen,
}: {
  filterDepartmentId: DepartmentId | null;
  onFilterChange: (id: DepartmentId | null) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  onResetView: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const departments = useOfficeStore((s) => s.departments);
  const resetLabel = bilingual('action.reset_view', locale);
  const fullscreenLabel = bilingual('module.full_screen', locale);
  const filterTitle = `${t('office3d:toolbar.filter.label')} – ${t('office3d:toolbar.filter.secondary')}`;
  const labelsText = showLabels ? t('office3d:toolbar.labels.hide') : t('office3d:toolbar.labels.show');
  const labelsTitle = `${labelsText} – ${t('office3d:toolbar.labels.secondary')}`;
  const fullscreenText = isFullscreen ? t('office3d:toolbar.fullscreen.exit') : fullscreenLabel.primary;
  const fullscreenTitle = `${fullscreenText} – ${isFullscreen ? t('office3d:toolbar.fullscreen.exitSecondary') : fullscreenLabel.secondary}`;

  return (
    <div className="pointer-events-none absolute inset-x-2 top-2 z-10 flex items-center gap-2 md:inset-x-3 md:top-3">
      <SyncIndicator />
      <label className="pointer-events-auto relative flex min-w-0 flex-1 items-center sm:flex-none" title={filterTitle}>
        <span className="sr-only">{t('office3d:toolbar.filter.label')}</span>
        <Filter className="pointer-events-none absolute left-2.5 size-3.5 text-brand-cyan" aria-hidden="true" />
        <select
          value={filterDepartmentId ?? ''}
          onChange={(e) => onFilterChange((e.target.value || null) as DepartmentId | null)}
          className="h-8 w-full min-w-0 appearance-none truncate rounded-lg border border-line bg-bg-panel/85 pl-8 pr-7 text-[11.5px] font-semibold text-text shadow-panel backdrop-blur-md focus-visible:focus-ring sm:w-auto sm:max-w-[240px]"
        >
          <option value="">{t('office3d:toolbar.filter.all')}</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {bilingual(termIdForDepartment(d.id), locale).inline}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-text-dim" aria-hidden="true" />
      </label>

      <div className="pointer-events-auto ml-auto flex shrink-0 items-center gap-1 rounded-xl bg-bg-panel/75 p-1 shadow-panel backdrop-blur-md">
        <Button variant="ghost" size="sm" className="!px-2 @4xl/scene:!px-3" icon={showLabels ? <Tags className="size-3.5" /> : <Tag className="size-3.5" />} onClick={onToggleLabels} aria-pressed={showLabels} aria-label={labelsTitle} title={labelsTitle}>
          <span className="hidden @4xl/scene:inline">{labelsText}</span>
        </Button>
        <Button variant="ghost" size="sm" className="!px-2 @4xl/scene:!px-3" icon={<RotateCcw className="size-3.5" />} onClick={onResetView} aria-label={resetLabel.inline} title={resetLabel.inline}>
          <span className="hidden @4xl/scene:inline">{resetLabel.primary}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="!px-2 @4xl/scene:!px-3"
          icon={isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          onClick={onToggleFullscreen}
          aria-label={fullscreenTitle}
          title={fullscreenTitle}
        >
          <span className="hidden @4xl/scene:inline">{fullscreenText}</span>
        </Button>
      </div>
    </div>
  );
}

/** Chỉ báo đồng bộ thời gian thực – đọc store.connection, nhãn song ngữ (rút gọn ở màn hẹp). */
export function SyncIndicator({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const connection = useOfficeStore((s) => s.connection);
  const updatedAt = useOfficeStore((s) => s.updatedAt);
  const live = connection === 'live';
  const color = live ? 'var(--color-status-active)' : connection === 'offline' ? 'var(--color-status-error)' : 'var(--color-status-waiting)';
  const label =
    connection === 'live'
      ? t('common:status.liveSync')
      : connection === 'connecting'
        ? t('office3d:sync.connecting')
        : connection === 'reconnecting'
          ? t('common:status.reconnecting')
          : t('common:status.systemOffline');
  const secondary = live ? t('common:status.liveSyncSecondary') : t('common:status.systemOfflineSecondary');
  const title = updatedAt ? `${label} – ${secondary} · ${t('office3d:sync.updatedAt', { time: formatTime(updatedAt, locale) })}` : `${label} – ${secondary}`;
  return (
    <div
      className={clsx('pointer-events-auto flex shrink-0 items-center gap-2 rounded-lg border bg-bg-panel/85 shadow-panel backdrop-blur-md', compact ? 'px-2 py-1' : 'h-8 px-2.5')}
      style={{ borderColor: `color-mix(in srgb, ${color} 45%, transparent)` }}
      title={title}
      aria-label={title}
      aria-live="polite"
    >
      <span className={clsx('size-2 shrink-0 rounded-full', live && 'animate-pulse-soft')} style={{ background: color, boxShadow: `0 0 8px ${color}` }} aria-hidden="true" />
      {live ? <Wifi className="size-3.5 shrink-0" style={{ color }} aria-hidden="true" /> : <WifiOff className="size-3.5 shrink-0" style={{ color }} aria-hidden="true" />}
      <span className={clsx('term-stack leading-none', !compact && 'hidden sm:inline-flex')}>
        <span className={clsx('whitespace-nowrap font-semibold text-text', compact ? 'text-[10px]' : 'text-[11px]')}>{label}</span>
        {!compact ? <span className="whitespace-nowrap text-[9px] font-medium text-text-muted">{secondary}</span> : null}
      </span>
    </div>
  );
}

/** Chú giải màu trạng thái nhân sự – nhãn tiếng Việt, tooltip song ngữ. */
export function SceneLegend() {
  const { t } = useTranslation();
  const locale = useLocale();
  // Khi bảng phòng ban đang mở, chú giải chỉ hiện nếu khung đủ rộng để hai bên không chồng nhau.
  const panelOpen = useOfficeStore((s) => s.selectedDepartmentId !== null);
  return (
    <ul
      className={clsx(
        'pointer-events-auto absolute inset-x-2 bottom-2 z-10 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-lg border border-line bg-bg-panel/85 px-2.5 py-1.5 backdrop-blur-md sm:left-auto sm:right-3 sm:bottom-3 sm:max-w-[calc(100%-1.5rem)] sm:justify-end',
        panelOpen ? 'hidden @4xl/scene:flex' : 'flex',
      )}
      aria-label={`${t('office3d:toolbar.legend.label')} – ${t('office3d:toolbar.legend.secondary')}`}
    >
      {LEGEND_STATUSES.map((status) => {
        const label = bilingual(termIdForAgentStatus(status), locale);
        const color = AGENT_STATUS_COLOR_VAR[status];
        return (
          <li key={status} className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold text-text-muted" title={label.inline}>
            <span className="size-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} aria-hidden="true" />
            {label.primary}
          </li>
        );
      })}
    </ul>
  );
}

/** Huy hiệu nhỏ cho chế độ thu nhỏ: chỉ chỉ báo đồng bộ. */
export function MiniSyncBadge() {
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-10">
      <SyncIndicator compact />
    </div>
  );
}

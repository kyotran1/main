import { useTranslation } from 'react-i18next';
import { Radio, WifiOff } from 'lucide-react';
import { clsx } from 'clsx';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore, type ConnectionStatus } from '@/store/officeStore';
import { formatTime } from '@/lib/format';

const COLOR: Record<ConnectionStatus, string> = {
  live: 'var(--color-status-active)',
  connecting: 'var(--color-status-waiting)',
  reconnecting: 'var(--color-status-waiting)',
  offline: 'var(--color-status-error)',
};

/** Chỉ báo kết nối thời gian thực (store.connection) + thời điểm cập nhật gần nhất (store.updatedAt). */
export function RealtimeIndicator({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const connection = useOfficeStore((s) => s.connection);
  const updatedAt = useOfficeStore((s) => s.updatedAt);
  const color = COLOR[connection];
  const label = t(`activity:realtime.${connection}`);
  const secondary = t(`activity:realtime.${connection}Secondary`);
  const Icon = connection === 'offline' ? WifiOff : Radio;
  return (
    <div
      className={clsx('inline-flex max-w-full items-center gap-2.5 rounded-xl border px-3 py-1.5', className)}
      style={{ borderColor: `color-mix(in srgb, ${color} 45%, transparent)`, background: `color-mix(in srgb, ${color} 10%, transparent)` }}
      title={`${secondary} – ${label}`}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex size-2.5 shrink-0">
        {connection === 'live' || connection === 'reconnecting' ? <span className="absolute inline-flex size-full animate-ping rounded-full opacity-60" style={{ background: color }} aria-hidden="true" /> : null}
        <span className="relative inline-flex size-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      </span>
      <Icon className="size-4 shrink-0" style={{ color }} aria-hidden="true" />
      <span className="term-stack min-w-0">
        <span className="term-primary truncate text-xs">{label}</span>
        <span className="term-secondary truncate">{updatedAt ? t('activity:realtime.updatedAt', { time: formatTime(updatedAt, locale) }) : t('activity:realtime.neverUpdated')}</span>
      </span>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { formatLongDate, formatTime } from '@/lib/format';

/** Viên trạng thái hệ thống + ngày giờ hiện tại ở góc phải đầu trang Trung tâm điều hành. */
export function CeoHeaderMeta() {
  const { t } = useTranslation();
  const locale = useLocale();
  const connection = useOfficeStore((s) => s.connection);
  const [now, setNow] = useState(() => new Date().toISOString());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toISOString()), 30_000);
    return () => clearInterval(id);
  }, []);

  const live = connection === 'live';
  const offline = connection === 'offline';
  const label = live ? t('ceo:header.statusLive') : offline ? t('ceo:header.statusOffline') : t('ceo:header.statusReconnecting');
  const secondary = live
    ? t('ceo:header.statusLiveSecondary')
    : offline
      ? t('ceo:header.statusOfflineSecondary')
      : t('ceo:header.statusReconnectingSecondary');
  const color = live ? 'var(--color-status-active)' : offline ? 'var(--color-status-error)' : 'var(--color-status-waiting)';
  // Dòng phụ hiển thị ngày theo ngôn ngữ còn lại để luôn song ngữ.
  const otherLocale = locale === 'vi-VN' ? 'en-US' : 'vi-VN';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="glass flex items-center gap-2.5 rounded-full px-3.5 py-1.5"
        style={{ borderColor: `color-mix(in srgb, ${color} 55%, transparent)`, boxShadow: `0 0 18px color-mix(in srgb, ${color} 30%, transparent)` }}
        role="status"
        title={`${label} – ${secondary}`}
      >
        <span className={live ? 'size-2.5 rounded-full animate-pulse-soft' : 'size-2.5 rounded-full'} style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
        <span className="term-stack">
          <span className="term-primary text-sm" style={{ color }}>
            {label}
          </span>
          <span className="term-secondary">{secondary}</span>
        </span>
      </div>
      <div className="glass flex items-center gap-3 px-3.5 py-1.5">
        <CalendarDays className="size-4 shrink-0 text-brand-cyan" aria-hidden="true" />
        <span className="term-stack">
          <span className="term-primary text-sm">{formatLongDate(now, locale)}</span>
          <span className="term-secondary">{formatLongDate(now, otherLocale)}</span>
        </span>
        <time dateTime={now} className="ml-1 border-l border-line pl-3 text-lg font-extrabold tabular-nums text-text">
          {formatTime(now, locale)}
        </time>
      </div>
    </div>
  );
}

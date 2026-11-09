import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bell, HelpCircle, Menu, Search, Settings, ChevronDown, Wifi, WifiOff } from 'lucide-react';
import { clsx } from 'clsx';
import { useOfficeStore } from '@/store/officeStore';
import { selectHeadlineStats } from '@/store/selectors';
import { useDerived } from '@/store/hooks';
import { useLocale } from '@ads-nolimit/i18n/react';
import { formatLongDate, formatTime } from '@/lib/format';

/** Thanh trên: lời chào, tìm kiếm, trạng thái hệ thống, thông báo, tài khoản Owner. */
export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const company = useOfficeStore((s) => s.company);
  const connection = useOfficeStore((s) => s.connection);
  const stats = useDerived(selectHeadlineStats);
  const [now, setNow] = useState(() => new Date().toISOString());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toISOString()), 30_000);
    return () => clearInterval(id);
  }, []);

  const live = connection === 'live';
  const statusLabel = live ? t('common:status.systemRunning') : connection === 'offline' ? t('common:status.systemOffline') : t('common:status.reconnecting');
  const statusSecondary = live ? t('common:status.systemRunningSecondary') : t('common:status.systemOfflineSecondary');

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg-deep/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-3 py-2.5 md:gap-3 md:px-5">
        <button type="button" className="rounded-xl p-2 text-text-muted hover:bg-white/5 lg:hidden" onClick={onOpenMenu} aria-label={t('common:a11y.openMenu')}>
          <Menu className="size-5" />
        </button>

        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm font-bold text-text">{t('common:greeting', { name: company?.ownerName ?? t('common:owner.title') })}</p>
          <p className="truncate text-[11px] text-text-muted">{t('common:greetingSecondary', { role: t('common:owner.secondary') })}</p>
        </div>

        <label className="relative ml-auto hidden min-w-0 flex-1 max-w-xl items-center md:flex">
          <Search className="pointer-events-none absolute left-3 size-4 text-text-dim" />
          <input
            type="search"
            placeholder={t('common:labels.searchPlaceholder')}
            className="h-10 w-full rounded-xl border border-line bg-white/[0.04] pl-9 pr-16 text-sm text-text placeholder:text-text-dim focus:border-brand-cyan/60 focus:outline-none"
            aria-label={t('common:labels.search')}
          />
          <kbd className="pointer-events-none absolute right-3 rounded-md border border-line px-1.5 py-0.5 text-[10px] text-text-dim">{t('common:labels.shortcut')}</kbd>
        </label>

        <div
          className={clsx(
            'ml-auto flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold md:ml-0',
            live ? 'border-brand-green/50 text-brand-green shadow-[0_0_16px_rgba(34,197,94,0.3)]' : 'border-brand-amber/50 text-brand-amber',
          )}
          title={`${statusLabel} – ${statusSecondary}`}
          aria-live="polite"
        >
          {live ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
          <span className="term-stack leading-none">
            <span className="whitespace-nowrap">{statusLabel}</span>
            <span className="hidden text-[10px] font-medium opacity-70 sm:block">{statusSecondary}</span>
          </span>
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          <MiniStat value={stats.running} label={t('nav:items.tasks.label')} secondary={t('glossary:task_status.in_progress.secondary')} color="var(--color-brand-cyan)" to="/tasks" />
          <MiniStat value={stats.needsApproval} label={t('glossary:module.approval_center.label')} secondary={t('glossary:module.approval_center.secondary')} color="var(--color-brand-amber)" to="/approvals" />
        </div>

        <div className="hidden text-right lg:block">
          <p className="text-xs font-semibold text-text">{formatLongDate(now, locale)}</p>
          <p className="text-[11px] text-text-muted">{formatTime(now, locale)}</p>
        </div>

        <Link to="/approvals" className="relative rounded-xl p-2 text-text-muted hover:bg-white/5" aria-label={t('common:a11y.notifications', { count: stats.needsApproval })}>
          <Bell className="size-5" />
          {stats.needsApproval > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white">{stats.needsApproval}</span>
          ) : null}
        </Link>
        <Link to="/knowledge" className="hidden rounded-xl p-2 text-text-muted hover:bg-white/5 sm:block" aria-label={t('glossary:module.help.inline')} title={t('glossary:module.help.inline')}>
          <HelpCircle className="size-5" />
        </Link>
        <Link to="/settings" className="hidden rounded-xl p-2 text-text-muted hover:bg-white/5 sm:block" aria-label={t('glossary:module.settings.inline')} title={t('glossary:module.settings.inline')}>
          <Settings className="size-5" />
        </Link>

        <Link to="/settings" className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-2 py-1.5 hover:bg-white/[0.06]" aria-label={t('common:a11y.userMenu')}>
          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-violet text-xs font-bold text-white">
            {(company?.ownerName ?? 'O').slice(0, 1).toUpperCase()}
          </span>
          <span className="term-stack hidden sm:inline-flex">
            <span className="term-primary text-xs">{t('common:owner.title')}</span>
            <span className="term-secondary">{t('common:owner.secondary')}</span>
          </span>
          <ChevronDown className="hidden size-4 text-text-dim sm:block" />
        </Link>
      </div>
    </header>
  );
}

function MiniStat({ value, label, secondary, color, to }: { value: number; label: string; secondary: string; color: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-2.5 py-1.5 hover:bg-white/[0.06]" title={`${label} – ${secondary}`}>
      <span className="flex size-7 items-center justify-center rounded-lg text-sm font-extrabold" style={{ color, background: `color-mix(in srgb, ${color} 18%, transparent)` }}>
        {value}
      </span>
      <span className="term-stack">
        <span className="term-primary text-[11px]">{label}</span>
        <span className="term-secondary">{secondary}</span>
      </span>
    </Link>
  );
}

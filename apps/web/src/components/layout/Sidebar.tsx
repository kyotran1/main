import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Rocket, X } from 'lucide-react';
import { useOfficeStore } from '@/store/officeStore';
import { NAV_GROUPS, ROUTES } from '@/app/routes';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForExecutionMode } from '@ads-nolimit/i18n';
import { Logo } from './Logo';

/**
 * Thanh điều hướng trái: mỗi mục có nhãn tiếng Việt (chính) + thuật ngữ tiếng Anh (phụ).
 * Trên di động hiển thị dạng ngăn kéo (drawer).
 */
export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const company = useOfficeStore((s) => s.company);
  const pendingApprovals = useOfficeStore((s) => Object.values(s.approvals).filter((a) => a.status === 'pending').length);
  const mode = company ? bilingual(termIdForExecutionMode(company.executionMode), locale) : null;

  return (
    <>
      {mobileOpen ? <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} aria-hidden="true" /> : null}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-line bg-bg-deep/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:bg-transparent',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label={t('nav:groups.operate')}
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
          <Logo />
          <button type="button" className="rounded-lg p-2 text-text-muted hover:bg-white/5 lg:hidden" onClick={onClose} aria-label={t('common:a11y.closeMenu')}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          {NAV_GROUPS.map((group) => {
            const items = ROUTES.filter((r) => r.group === group);
            return (
              <div key={group} className="mb-3">
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-text-dim">{t(`nav:groups.${group}`)}</p>
                <ul className="flex flex-col gap-0.5">
                  {items.map((r) => {
                    const Icon = r.icon;
                    const label = t(`nav:items.${r.key}.label`);
                    const secondary = t(`nav:items.${r.key}.secondary`);
                    const badge = r.key === 'approvals' && pendingApprovals > 0 ? pendingApprovals : null;
                    return (
                      <li key={r.key}>
                        <NavLink
                          to={r.path}
                          end={r.path === '/'}
                          onClick={onClose}
                          title={`${label} – ${secondary}`}
                          className={({ isActive }) =>
                            clsx(
                              'group flex items-center gap-3 rounded-xl px-3 py-2 transition focus-visible:focus-ring',
                              isActive
                                ? 'bg-gradient-to-r from-brand-violet/70 to-brand-purple/40 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                                : 'text-text-muted hover:bg-white/5 hover:text-text',
                            )
                          }
                        >
                          <Icon className="size-5 shrink-0" />
                          <span className="term-stack min-w-0 flex-1">
                            <span className="term-primary truncate text-[13.5px]">{label}</span>
                            <span className="term-secondary truncate">{secondary}</span>
                          </span>
                          {badge ? (
                            <span className="rounded-full bg-brand-red px-1.5 py-0.5 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.6)]">{badge}</span>
                          ) : null}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="m-3 glass neon-border-violet flex items-center gap-3 p-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-violet/30 text-brand-purple">
            <Rocket className="size-4" />
          </span>
          <div className="min-w-0 text-xs">
            <p className="truncate font-semibold text-text">{t('nav:footer.version', { version: company?.version ?? '…' })}</p>
            <p className="truncate text-text-muted" title={mode ? mode.inline : undefined}>
              {mode ? t('nav:footer.mode', { mode: mode.primary }) : t('nav:footer.modeSecondary')}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Logo({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5 focus-visible:focus-ring rounded-lg" aria-label={t('common:app.name')}>
      <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple shadow-[0_0_20px_rgba(34,211,238,0.45)]">
        <svg viewBox="0 0 64 64" className="size-7" aria-hidden="true">
          <path d="M32 10 L54 52 H44 L32 28 L20 52 H10 Z" fill="#0b1030" />
          <path d="M26 44 H38 L32 34 Z" fill="#67e8f9" />
        </svg>
      </span>
      {!compact ? (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[15px] font-extrabold tracking-wide text-text">ADS-NOLIMIT</span>
          <span className="block truncate text-[11px] font-semibold tracking-[0.18em] text-brand-cyan">{t('common:app.shortName')}</span>
        </span>
      ) : null}
    </Link>
  );
}

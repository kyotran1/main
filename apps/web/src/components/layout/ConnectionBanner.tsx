import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';
import { useOfficeStore } from '@/store/officeStore';

/** Dải cảnh báo khi mất đồng bộ thời gian thực – luôn có giải thích tiếng Việt. */
export function ConnectionBanner() {
  const { t } = useTranslation();
  const connection = useOfficeStore((s) => s.connection);
  const hydrated = useOfficeStore((s) => s.hydrated);
  if (connection === 'live' || connection === 'connecting') return null;
  const code = connection === 'offline' ? 'network' : 'websocket_disconnected';
  return (
    <div role="status" className="mx-3 mt-3 flex items-start gap-3 rounded-xl border border-brand-amber/50 bg-brand-amber/10 px-4 py-2.5 text-sm md:mx-5">
      <WifiOff className="mt-0.5 size-4 shrink-0 text-brand-amber" />
      <div className="min-w-0">
        <p className="font-semibold text-text">{t(`errors:codes.${code}.title`)}</p>
        <p className="text-xs text-text-muted">
          {t(`errors:codes.${code}.explain`)}
          {hydrated ? '' : ` ${t('common:labels.loading')}`}
        </p>
      </div>
    </div>
  );
}

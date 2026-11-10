import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, DatabaseZap, RefreshCw, Server } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { useOfficeStore, type ConnectionStatus } from '@/store/officeStore';
import { ApiError } from '@/lib/api';
import { refreshSnapshot } from '@/lib/realtime';
import { formatDate, formatNumber, formatRelative, formatTime } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SettingsCard } from './SettingsCard';
import { useAsyncAction } from './useAsyncAction';

const CONNECTION_COLOR: Record<ConnectionStatus, string> = {
  connecting: 'var(--color-status-waiting)',
  live: 'var(--color-status-active)',
  reconnecting: 'var(--color-status-waiting)',
  offline: 'var(--color-status-error)',
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/** Gửi lệnh đặt lại dữ liệu mẫu tới hệ thống nền (chỉ dùng cho môi trường trình diễn). */
async function resetDemoData(): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/admin/reset`, { method: 'POST', headers: { Accept: 'application/json' } });
  } catch (err) {
    throw new ApiError('network', 0, err instanceof Error ? err.message : 'Network request failed');
  }
  if (!res.ok) throw new ApiError('internal', res.status, res.statusText);
}

/**
 * Kết nối hệ thống nền: trạng thái realtime, số hiệu bản dữ liệu, thời điểm cập nhật,
 * nút Làm mới dữ liệu và Đặt lại dữ liệu mẫu (có xác nhận trước khi thực hiện).
 */
export function BackendCard() {
  const { t } = useTranslation();
  const locale = useLocale();
  const connection = useOfficeStore((s) => s.connection);
  const revision = useOfficeStore((s) => s.revision);
  const updatedAt = useOfficeStore((s) => s.updatedAt);
  const refresh = useAsyncAction();
  const reset = useAsyncAction();
  const [confirming, setConfirming] = useState(false);

  const endpoint = `${API_BASE || window.location.origin}/api`;
  const stateLabel = t(`settings:backend.states.${connection}`);
  const color = CONNECTION_COLOR[connection];

  const doRefresh = () => void refresh.run(refreshSnapshot, t('settings:backend.refreshed'));
  const doReset = async () => {
    const ok = await reset.run(resetDemoData, t('settings:backend.resetDone'));
    if (ok) setConfirming(false);
  };

  return (
    <SettingsCard
      icon={<Server className="size-4" aria-hidden="true" />}
      title={t('settings:backend.title')}
      secondary={t('settings:backend.secondary')}
      description={t('settings:backend.description')}
      accent="green"
      error={refresh.error ?? reset.error}
      success={refresh.success ?? reset.success}
    >
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Field label={t('settings:backend.status')} secondary={t('settings:backend.statusSecondary')}>
          <Badge color={color} dot pulse={connection === 'live' || connection === 'connecting'} title={`${t('settings:backend.statusSecondary')}: ${connection}`}>
            {stateLabel}
          </Badge>
        </Field>
        <Field label={t('settings:backend.revision')} secondary={t('settings:backend.revisionSecondary')}>
          <span className="font-mono text-base font-bold tabular-nums text-text">{formatNumber(revision, locale)}</span>
        </Field>
        <Field label={t('settings:backend.updatedAt')} secondary={t('settings:backend.updatedAtSecondary')}>
          {updatedAt ? (
            <span className="flex flex-col leading-tight">
              <span className="font-semibold text-text">{formatRelative(updatedAt, t)}</span>
              <span className="text-[11px] text-text-dim tabular-nums">
                {formatTime(updatedAt, locale)} · {formatDate(updatedAt, locale)}
              </span>
            </span>
          ) : (
            <span className="text-text-dim">{t('settings:backend.notYet')}</span>
          )}
        </Field>
        <Field label={t('settings:backend.endpoint')} secondary={t('settings:backend.endpointSecondary')}>
          <code className="block truncate font-mono text-xs text-brand-cyan" title={endpoint}>
            {endpoint}
          </code>
        </Field>
      </dl>

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <Button variant="outline" onClick={doRefresh} loading={refresh.loading} icon={<RefreshCw className="size-4" aria-hidden="true" />} title={`${t('settings:backend.refreshSecondary')} – ${t('settings:backend.refresh')}`}>
          {t('settings:backend.refresh')}
        </Button>
        {!confirming ? (
          <Button
            variant="ghost"
            onClick={() => setConfirming(true)}
            icon={<DatabaseZap className="size-4" aria-hidden="true" />}
            className="text-brand-red hover:text-brand-red"
            title={`${t('settings:backend.resetSecondary')} – ${t('settings:backend.reset')}`}
          >
            {t('settings:backend.reset')}
          </Button>
        ) : null}
      </div>

      {confirming ? (
        <div role="alertdialog" aria-labelledby="settings-reset-title" aria-describedby="settings-reset-body" className="glass neon-border-red flex flex-col gap-3 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-brand-red" aria-hidden="true" />
            <div className="min-w-0">
              <p id="settings-reset-title" className="font-semibold text-text">
                {t('settings:backend.resetConfirmTitle')}
              </p>
              <p id="settings-reset-body" className="text-sm leading-relaxed text-text-muted">
                {t('settings:backend.resetConfirmBody')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={reset.loading}>
              {t('common:labels.cancel')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => void doReset()} loading={reset.loading} icon={<DatabaseZap className="size-3.5" aria-hidden="true" />}>
              {t('settings:backend.resetConfirm')}
            </Button>
          </div>
        </div>
      ) : null}
    </SettingsCard>
  );
}

function Field({ label, secondary, children }: { label: string; secondary: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-white/[0.02] p-3">
      <dt className="term-stack" title={`${secondary} – ${label}`}>
        <span className="term-primary text-[11px] text-text-muted">{label}</span>
        <span className="term-secondary">{secondary}</span>
      </dt>
      <dd className="mt-1.5 min-w-0">{children}</dd>
    </div>
  );
}

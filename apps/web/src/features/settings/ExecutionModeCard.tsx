import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Check, Cloud, HardDrive, Layers } from 'lucide-react';
import type { ExecutionMode } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForExecutionMode } from '@ads-nolimit/i18n';
import { useOfficeStore } from '@/store/officeStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SettingsCard } from './SettingsCard';
import { useAsyncAction } from './useAsyncAction';

const MODES: readonly ExecutionMode[] = ['local', 'cloud', 'hybrid'] as const;

const MODE_META: Record<ExecutionMode, { icon: typeof Cloud; color: string }> = {
  local: { icon: HardDrive, color: 'var(--color-brand-amber)' },
  cloud: { icon: Cloud, color: 'var(--color-brand-violet)' },
  hybrid: { icon: Layers, color: 'var(--color-brand-cyan)' },
};

/**
 * Chế độ vận hành (Execution Mode): ba thẻ chọn Local / Cloud / Hybrid với mô tả tiếng Việt.
 * Giá trị hiện tại đọc từ store.company; lưu qua api.updateSettings – store tự cập nhật realtime.
 */
export function ExecutionModeCard() {
  const { t } = useTranslation();
  const locale = useLocale();
  const current = useOfficeStore((s) => s.company?.executionMode ?? null);
  const [selected, setSelected] = useState<ExecutionMode | null>(current);
  const action = useAsyncAction();
  const term = bilingual('tech.execution_mode', locale);

  // Đồng bộ lựa chọn khi backend đổi chế độ (từ nơi khác) và người dùng chưa chọn khác.
  useEffect(() => {
    setSelected((prev) => (prev === null || prev === current ? current : prev));
  }, [current]);

  const dirty = selected !== null && selected !== current;
  const currentLabel = current ? bilingual(termIdForExecutionMode(current), locale) : null;

  const apply = () => {
    if (!selected || !dirty) return;
    const label = bilingual(termIdForExecutionMode(selected), locale);
    void action.run(() => api.updateSettings({ executionMode: selected }), t('settings:executionMode.applied', { mode: label.inline }));
  };

  return (
    <SettingsCard
      icon={<Layers className="size-4" aria-hidden="true" />}
      title={term.primary}
      secondary={term.secondary}
      description={t('settings:executionMode.description')}
      accent="violet"
      error={action.error}
      success={action.success}
      onRetry={apply}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span className="term-stack" title={`${t('settings:executionMode.currentSecondary')} – ${t('settings:executionMode.current')}`}>
          <span className="term-primary text-xs">{t('settings:executionMode.current')}</span>
        </span>
        {currentLabel && current ? (
          <Badge color={MODE_META[current].color} dot pulse title={currentLabel.inline}>
            {currentLabel.inline}
          </Badge>
        ) : (
          <span className="text-text-dim">{t('common:labels.loading')}</span>
        )}
      </div>

      <div role="radiogroup" aria-label={term.inline} className="grid gap-3 md:grid-cols-3">
        {MODES.map((mode) => {
          const label = bilingual(termIdForExecutionMode(mode), locale);
          const meta = MODE_META[mode];
          const Icon = meta.icon;
          const active = selected === mode;
          const isCurrent = current === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(mode)}
              className={clsx(
                'relative flex min-w-0 flex-col gap-2 rounded-2xl border p-4 text-left transition focus-visible:focus-ring',
                active ? 'bg-white/[0.06]' : 'border-line bg-white/[0.02] hover:bg-white/[0.05]',
              )}
              style={active ? { borderColor: `color-mix(in srgb, ${meta.color} 70%, transparent)`, boxShadow: `0 0 20px color-mix(in srgb, ${meta.color} 25%, transparent)` } : undefined}
            >
              <span className="flex items-center justify-between gap-2">
                <span
                  className="flex size-9 items-center justify-center rounded-xl"
                  style={{ color: meta.color, background: `color-mix(in srgb, ${meta.color} 16%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${meta.color} 40%, transparent)` }}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </span>
                <span className="flex items-center gap-1.5">
                  {isCurrent ? (
                    <Badge color={meta.color} size="sm">
                      {t('settings:executionMode.current')}
                    </Badge>
                  ) : null}
                  <span
                    className={clsx('flex size-5 items-center justify-center rounded-full border', active ? 'text-bg-base' : 'border-line-strong')}
                    style={active ? { background: meta.color, borderColor: meta.color } : undefined}
                    aria-hidden="true"
                  >
                    {active ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                </span>
              </span>
              <span className="term-stack" title={label.inline}>
                <span className="term-primary text-sm leading-tight">{label.primary}</span>
                <span className="term-secondary">{label.secondary}</span>
              </span>
              <span className="text-sm font-semibold leading-snug text-text">{t(`settings:executionMode.modes.${mode}.title`)}</span>
              <span className="text-xs leading-relaxed text-text-muted">{t(`settings:executionMode.modes.${mode}.body`)}</span>
              <span className="mt-auto pt-1 text-[11px] font-semibold" style={{ color: meta.color }}>
                {t(`settings:executionMode.modes.${mode}.badge`)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="primary" onClick={apply} disabled={!dirty} loading={action.loading} icon={<Check className="size-4" aria-hidden="true" />}>
          {action.loading ? t('settings:saving') : t('settings:executionMode.apply')}
        </Button>
      </div>
    </SettingsCard>
  );
}

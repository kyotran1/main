import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Check, Languages } from 'lucide-react';
import type { Locale } from '@ads-nolimit/shared';
import { SUPPORTED_LOCALES } from '@ads-nolimit/i18n';
import { useLocale } from '@ads-nolimit/i18n/react';
import { changeLocale } from '@/i18n';
import { SettingsCard } from './SettingsCard';
import { useAsyncAction } from './useAsyncAction';

/** Chọn ngôn ngữ giao diện: vi-VN mặc định, en-US bản xem trước. Lưu vào localStorage qua changeLocale. */
export function LanguageCard() {
  const { t } = useTranslation();
  const current = useLocale();
  const action = useAsyncAction();

  const pick = (locale: Locale) => {
    if (locale === current) return;
    void action.run(() => changeLocale(locale), t('settings:language.applied'));
  };

  return (
    <SettingsCard
      icon={<Languages className="size-4" aria-hidden="true" />}
      title={t('common:language.label')}
      secondary={t('common:language.secondary')}
      description={t('settings:language.description')}
      accent="cyan"
      error={action.error}
      success={action.success}
    >
      <div role="radiogroup" aria-label={t('common:language.label')} className="grid gap-2 sm:grid-cols-2">
        {SUPPORTED_LOCALES.map((locale) => {
          const active = locale === current;
          return (
            <button
              key={locale}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => pick(locale)}
              className={clsx(
                'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition focus-visible:focus-ring',
                active
                  ? 'border-brand-cyan/70 bg-brand-cyan/10 shadow-[0_0_16px_rgba(34,211,238,0.2)]'
                  : 'border-line bg-white/[0.02] hover:bg-white/[0.06]',
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-text">{t(`common:language.${locale}`)}</span>
                <span className="block text-[11px] text-text-dim">{locale}</span>
              </span>
              <span
                className={clsx(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border',
                  active ? 'border-brand-cyan bg-brand-cyan text-bg-base' : 'border-line-strong',
                )}
                aria-hidden="true"
              >
                {active ? <Check className="size-3" strokeWidth={3} /> : null}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs leading-relaxed text-text-muted">{t('common:language.note')}</p>
    </SettingsCard>
  );
}

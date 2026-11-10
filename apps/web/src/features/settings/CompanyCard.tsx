import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Save } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual } from '@ads-nolimit/i18n';
import { useOfficeStore } from '@/store/officeStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { FieldLabel, INPUT_CLASS, SettingsCard } from './SettingsCard';
import { useAsyncAction } from './useAsyncAction';

/** Thông tin công ty: tên công ty, tên Chủ doanh nghiệp (sửa được); khẩu hiệu và phiên bản (chỉ đọc). */
export function CompanyCard() {
  const { t } = useTranslation();
  const locale = useLocale();
  const company = useOfficeStore((s) => s.company);
  const action = useAsyncAction();
  // Giá trị đang gõ: null = người dùng chưa chạm vào ô → luôn theo dữ liệu backend (realtime từ client khác).
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [ownerDraft, setOwnerDraft] = useState<string | null>(null);
  const versionTerm = bilingual('tech.version', locale);

  const name = nameDraft ?? company?.name ?? '';
  const ownerName = ownerDraft ?? company?.ownerName ?? '';
  const trimmedName = name.trim();
  const trimmedOwner = ownerName.trim();
  // Chỉ ô người dùng đã sửa mới được coi là thay đổi và được gửi đi.
  const nameDirty = nameDraft !== null && !!company && trimmedName !== company.name;
  const ownerDirty = ownerDraft !== null && !!company && trimmedOwner !== company.ownerName;
  const dirty = nameDirty || ownerDirty;
  const valid = trimmedName.length > 0 && trimmedOwner.length > 0;

  // Sau khi lưu thành công, bỏ bản nháp để ô nhập theo lại backend.
  useEffect(() => {
    if (action.success) {
      setNameDraft(null);
      setOwnerDraft(null);
    }
  }, [action.success]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!company || !dirty || !valid) return;
    const patch: { companyName?: string; ownerName?: string } = {};
    if (nameDirty) patch.companyName = trimmedName;
    if (ownerDirty) patch.ownerName = trimmedOwner;
    void action.run(() => api.updateSettings(patch), t('settings:company.saved'));
  };

  return (
    <SettingsCard
      icon={<Building2 className="size-4" aria-hidden="true" />}
      title={t('settings:company.title')}
      secondary={t('settings:company.secondary')}
      description={t('settings:company.description')}
      accent="amber"
      error={action.error}
      success={action.success}
      onRetry={() => submit()}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="settings-company-name" label={t('settings:company.name')} secondary={t('settings:company.nameSecondary')} />
            <input
              id="settings-company-name"
              className={INPUT_CLASS}
              value={name}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder={t('settings:company.namePlaceholder')}
              disabled={!company}
              maxLength={80}
              autoComplete="organization"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="settings-owner-name" label={t('settings:company.ownerName')} secondary={t('settings:company.ownerNameSecondary')} />
            <input
              id="settings-owner-name"
              className={INPUT_CLASS}
              value={ownerName}
              onChange={(e) => setOwnerDraft(e.target.value)}
              placeholder={t('settings:company.ownerNamePlaceholder')}
              disabled={!company}
              maxLength={80}
              autoComplete="name"
            />
          </div>
        </div>

        <dl className="grid gap-3 rounded-xl border border-line bg-white/[0.02] p-3 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="term-stack" title={`${t('settings:company.taglineSecondary')} – ${t('settings:company.tagline')}`}>
              <span className="term-primary text-[11px] text-text-muted">{t('settings:company.tagline')}</span>
            </dt>
            <dd className="mt-0.5 line-clamp-2 font-medium text-text">{company?.tagline ?? t('common:labels.loading')}</dd>
          </div>
          <div className="min-w-0">
            <dt className="term-stack" title={versionTerm.inline}>
              <span className="term-primary text-[11px] text-text-muted">{t('settings:company.version')}</span>
            </dt>
            <dd className="mt-0.5 font-mono text-sm font-semibold text-brand-cyan">{company?.version ?? '—'}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-text-dim">{dirty ? '' : t('settings:company.unchanged')}</span>
          <Button type="submit" variant="primary" disabled={!dirty || !valid} loading={action.loading} icon={<Save className="size-4" aria-hidden="true" />}>
            {action.loading ? t('settings:saving') : t('settings:company.save')}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { FilterX } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForApprovalStatus, termIdForApprovalType } from '@ads-nolimit/i18n';
import { APPROVAL_STATUSES, APPROVAL_TYPES, type ApprovalFilter } from './selectors';

/** Bộ lọc theo trạng thái và loại yêu cầu – dạng viên bấm, có nút xóa bộ lọc và số kết quả. */
export function ApprovalFilters({ filter, onChange, resultCount }: { filter: ApprovalFilter; onChange: (next: ApprovalFilter) => void; resultCount: number }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const dirty = filter.status !== 'all' || filter.type !== 'all';

  return (
    <div className="glass flex flex-col gap-3 p-3 md:p-4">
      <FilterRow label={t('approvals:filters.status')} secondary={t('approvals:filters.statusSecondary')}>
        <Pill active={filter.status === 'all'} onClick={() => onChange({ ...filter, status: 'all' })} title={t('approvals:filters.all')}>
          {t('approvals:filters.all')}
        </Pill>
        {APPROVAL_STATUSES.map((s) => {
          const label = bilingual(termIdForApprovalStatus(s), locale);
          return (
            <Pill key={s} active={filter.status === s} onClick={() => onChange({ ...filter, status: s })} title={label.inline}>
              {label.primary}
            </Pill>
          );
        })}
      </FilterRow>
      <FilterRow label={t('approvals:filters.type')} secondary={t('approvals:filters.typeSecondary')}>
        <Pill active={filter.type === 'all'} onClick={() => onChange({ ...filter, type: 'all' })} title={t('approvals:filters.all')}>
          {t('approvals:filters.all')}
        </Pill>
        {APPROVAL_TYPES.map((ty) => {
          const label = bilingual(termIdForApprovalType(ty), locale);
          return (
            <Pill key={ty} active={filter.type === ty} onClick={() => onChange({ ...filter, type: ty })} title={label.inline}>
              {label.primary}
            </Pill>
          );
        })}
      </FilterRow>
      <div className="flex items-center justify-between gap-3 text-xs text-text-muted">
        <span role="status">{t('approvals:filters.result', { count: resultCount })}</span>
        {dirty ? (
          <button
            type="button"
            onClick={() => onChange({ status: 'all', type: 'all' })}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-brand-cyan hover:bg-white/5 focus-visible:focus-ring"
          >
            <FilterX className="size-3.5" aria-hidden="true" />
            {t('approvals:filters.reset')}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FilterRow({ label, secondary, children }: { label: string; secondary: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <span className="term-stack w-28 shrink-0" title={`${secondary} – ${label}`}>
        <span className="term-primary text-xs">{label}</span>
        <span className="term-secondary">{secondary}</span>
      </span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

function Pill({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      title={title}
      className={clsx(
        'rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:focus-ring',
        active
          ? 'border-brand-violet/70 bg-brand-violet/20 text-text shadow-[0_0_14px_rgba(139,92,246,0.3)]'
          : 'border-line bg-white/[0.03] text-text-muted hover:bg-white/[0.07] hover:text-text',
      )}
    >
      {children}
    </button>
  );
}

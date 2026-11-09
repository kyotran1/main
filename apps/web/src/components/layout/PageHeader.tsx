import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { useTerm } from '@ads-nolimit/i18n/react';

export interface PageHeaderProps {
  /** Id thuật ngữ của phân hệ (glossary), vd 'module.dashboard'. */
  termId: string;
  /** Mô tả ngắn (tiếng Việt) dưới tiêu đề. */
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Tiêu đề trang chuẩn: "Tên tiếng Việt – English Term" trên một dòng ở màn hình rộng,
 * tách hai dòng ở màn hình hẹp. Tooltip luôn mang đủ song ngữ.
 */
export function PageHeader({ termId, description, icon, actions, className }: PageHeaderProps) {
  const label = useTerm(termId);
  return (
    <header className={clsx('mb-4 flex flex-col gap-3 md:mb-5 md:flex-row md:items-end md:justify-between', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-violet/40 to-brand-cyan/20 text-brand-cyan ring-1 ring-white/10">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold leading-tight tracking-tight md:text-2xl" title={`${label.term} – ${label.meaning}`}>
            <span className="text-gradient-brand">{label.primary}</span>
            <span className="ml-2 hidden text-base font-semibold text-text-muted md:inline">– {label.secondary}</span>
          </h1>
          <span className="block text-xs font-medium text-text-muted md:hidden">{label.secondary}</span>
          {description ? <p className="mt-0.5 text-sm text-text-muted">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

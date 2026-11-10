import { clsx } from 'clsx';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Điều khiển biểu mẫu dùng chung cho gói công việc/nhân sự: nhãn song ngữ, viền kính,
 * vòng tiêu điểm chuẩn. Mọi nhãn/placeholder truyền từ i18n ở nơi gọi.
 */

const FIELD_BASE =
  'w-full rounded-xl border border-line bg-bg-deep/60 px-3 text-sm text-text placeholder:text-text-dim transition hover:border-line-strong focus:border-brand-cyan/70 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 disabled:cursor-not-allowed disabled:opacity-60';

export function Field({ label, secondary, hint, htmlFor, children, className }: { label: string; secondary?: string; hint?: ReactNode; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={clsx('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="term-stack" title={secondary ? `${secondary} – ${label}` : label}>
        <span className="term-primary text-xs">{label}</span>
        {secondary ? <span className="term-secondary">{secondary}</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-text-muted">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(FIELD_BASE, 'h-10', className)} {...rest} />;
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(FIELD_BASE, 'min-h-[88px] resize-y py-2 leading-relaxed', className)} {...rest} />;
}

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({ options, className, compact, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[]; compact?: boolean }) {
  return (
    <span className={clsx('relative inline-flex min-w-0', className)}>
      <select className={clsx(FIELD_BASE, 'appearance-none pr-8', compact ? 'h-9 text-xs' : 'h-10')} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-bg-panel text-text">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
    </span>
  );
}

/** Chuyển giá trị <input type="date"> (YYYY-MM-DD) thành ISO cuối ngày theo giờ địa phương. */
export function dateInputToIso(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T23:59:00`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Chuyển ISO sang giá trị <input type="date"> theo giờ địa phương. */
export function isoToDateInput(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

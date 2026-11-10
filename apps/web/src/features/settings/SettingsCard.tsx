import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

/** Khung chuẩn cho một khối cài đặt: tiêu đề song ngữ, mô tả, nội dung, thông báo lỗi/thành công. */
export function SettingsCard({
  icon,
  title,
  secondary,
  description,
  accent = 'none',
  error,
  success,
  onRetry,
  className,
  children,
}: {
  icon: ReactNode;
  title: string;
  secondary: string;
  description?: string;
  accent?: 'none' | 'cyan' | 'violet' | 'green' | 'amber' | 'red';
  error?: unknown;
  success?: string | null;
  onRetry?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card accent={accent} className={clsx('flex min-w-0 flex-col gap-4', className)}>
      <div>
        <CardHeader icon={icon} title={title} subtitle={secondary} className="mb-1" />
        {description ? <p className="text-sm leading-relaxed text-text-muted">{description}</p> : null}
      </div>
      {children}
      {error ? <ErrorBanner error={error} onRetry={onRetry} /> : null}
      {success ? <SuccessNote>{success}</SuccessNote> : null}
    </Card>
  );
}

/** Thông báo thành công nhỏ, tiếng Việt, tự ẩn (do hook useAsyncAction điều khiển). */
export function SuccessNote({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="inline-flex items-center gap-2 self-start rounded-lg border border-status-active/40 bg-status-active/10 px-3 py-1.5 text-xs font-semibold text-status-active">
      <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** Nhãn trường nhập song ngữ: tiếng Việt chính, thuật ngữ tiếng Anh nhỏ phía dưới. */
export function FieldLabel({ htmlFor, label, secondary }: { htmlFor?: string; label: string; secondary: string }) {
  return (
    <label htmlFor={htmlFor} className="term-stack" title={`${secondary} – ${label}`}>
      <span className="term-primary text-sm">{label}</span>
      <span className="term-secondary">{secondary}</span>
    </label>
  );
}

export const INPUT_CLASS =
  'w-full rounded-xl border border-line bg-white/[0.03] px-3 py-2.5 text-sm text-text placeholder:text-text-dim transition focus:border-brand-cyan/60 focus-visible:focus-ring disabled:opacity-60';

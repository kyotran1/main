import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { Card } from './Card';

export interface StatCardProps {
  icon: ReactNode;
  value: ReactNode;
  /** Nhãn chính tiếng Việt. */
  label: string;
  /** Thuật ngữ tiếng Anh đi kèm. */
  secondary?: string;
  accent?: 'cyan' | 'violet' | 'green' | 'amber' | 'red';
  color?: string;
  onClick?: () => void;
  className?: string;
  trend?: ReactNode;
}

/** Thẻ thống kê lớn – số nổi bật, nhãn song ngữ (chính tiếng Việt, phụ tiếng Anh). */
export function StatCard({ icon, value, label, secondary, accent = 'cyan', color = 'var(--color-brand-cyan)', onClick, className, trend }: StatCardProps) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Card accent={accent} padded={false} className={clsx('relative overflow-hidden', className)}>
      <Comp
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={clsx('flex w-full items-center gap-3 p-3.5 text-left md:gap-4 md:p-4', onClick && 'cursor-pointer transition hover:bg-white/[0.04] focus-visible:focus-ring rounded-card')}
      >
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl md:size-12"
          style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 40%, transparent)` }}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-2xl font-extrabold leading-none tracking-tight md:text-[28px]" style={{ color }}>
            {value}
          </span>
          <span className="mt-1 line-clamp-2 text-sm font-semibold leading-tight text-text">{label}</span>
          {secondary ? <span className="block truncate text-[11px] text-text-muted">{secondary}</span> : null}
        </span>
        {trend ? <span className="shrink-0 self-start">{trend}</span> : null}
      </Comp>
    </Card>
  );
}

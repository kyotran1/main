import { clsx } from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

type Accent = 'none' | 'cyan' | 'violet' | 'green' | 'amber' | 'red';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: Accent;
  strong?: boolean;
  padded?: boolean;
}

const ACCENT_CLASS: Record<Accent, string> = {
  none: '',
  cyan: 'neon-border-cyan',
  violet: 'neon-border-violet',
  green: 'neon-border-green',
  amber: 'neon-border-amber',
  red: 'neon-border-red',
};

export function Card({ accent = 'none', strong, padded = true, className, children, ...rest }: CardProps) {
  return (
    <div
      className={clsx(strong ? 'glass-strong' : 'glass', ACCENT_CLASS[accent], padded && 'p-4 md:p-5', 'min-w-0', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Đầu thẻ chuẩn: icon tròn + tiêu đề song ngữ (chính/phụ) + hành động bên phải. */
export function CardHeader({ icon, title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={clsx('mb-3 flex items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-brand-cyan ring-1 ring-white/10">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold leading-tight text-text md:text-base">{title}</h2>
          {subtitle ? <p className="truncate text-xs text-text-muted">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

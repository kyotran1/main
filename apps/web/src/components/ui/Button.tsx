import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'success' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary:
    'text-white bg-gradient-to-r from-brand-violet to-brand-purple shadow-[0_0_18px_rgba(139,92,246,0.45)] hover:brightness-110',
  success: 'text-white bg-gradient-to-r from-brand-emerald to-brand-green shadow-[0_0_18px_rgba(34,197,94,0.35)] hover:brightness-110',
  danger: 'text-white bg-gradient-to-r from-brand-red to-brand-pink shadow-[0_0_18px_rgba(239,68,68,0.35)] hover:brightness-110',
  ghost: 'text-text-muted hover:text-text hover:bg-white/5',
  outline: 'text-text border border-line-strong bg-white/[0.03] hover:bg-white/[0.07]',
};

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-base gap-2 rounded-xl',
};

export function Button({ variant = 'primary', size = 'md', icon, iconRight, loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center font-semibold transition focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : icon}
      {children ? <span className="truncate">{children}</span> : null}
      {iconRight}
    </button>
  );
}

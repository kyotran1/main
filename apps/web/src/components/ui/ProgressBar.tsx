import { clsx } from 'clsx';
import { clampPercent } from '@/lib/format';

export interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  label?: string;
}

export function ProgressBar({ value, color = 'var(--color-brand-cyan)', className, size = 'sm', label }: ProgressBarProps) {
  const pct = clampPercent(value);
  return (
    <div
      className={clsx('w-full overflow-hidden rounded-full bg-white/8', size === 'xs' ? 'h-1' : size === 'sm' ? 'h-1.5' : 'h-2.5', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 55%, white))`, boxShadow: `0 0 10px ${color}` }}
      />
    </div>
  );
}

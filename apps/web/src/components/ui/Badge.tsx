import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Màu dạng CSS var hoặc hex – nên dùng token từ lib/colors. */
  color?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({ color = 'var(--color-brand-cyan)', size = 'md', dot, pulse, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex max-w-full items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
      {...rest}
    >
      {dot ? (
        <span
          className={clsx('size-1.5 shrink-0 rounded-full', pulse && 'animate-pulse-soft')}
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      ) : null}
      <span className="truncate">{children}</span>
    </span>
  );
}

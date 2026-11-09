import { clsx } from 'clsx';
import type { DepartmentId } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForDepartment } from '@ads-nolimit/i18n';
import { DEPARTMENT_COLOR_VAR } from '@/lib/colors';

export function DepartmentName({ id, format = 'stacked', className, withDot }: { id: DepartmentId; format?: 'stacked' | 'inline' | 'short' | 'primary'; className?: string; withDot?: boolean }) {
  const locale = useLocale();
  const label = bilingual(termIdForDepartment(id), locale);
  const color = DEPARTMENT_COLOR_VAR[id];
  const dot = withDot ? <span className="inline-block size-2 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} /> : null;
  if (format === 'inline' || format === 'short' || format === 'primary') {
    const text = format === 'inline' ? label.inline : format === 'short' ? label.short : label.primary;
    return (
      <span className={clsx('inline-flex items-center gap-1.5', className)} title={label.inline}>
        {dot}
        <span className="truncate">{text}</span>
      </span>
    );
  }
  return (
    <span className={clsx('inline-flex items-center gap-2', className)} title={label.inline}>
      {dot}
      <span className="term-stack">
        <span className="term-primary truncate">{label.primary}</span>
        <span className="term-secondary truncate">{label.secondary}</span>
      </span>
    </span>
  );
}

import type { ReactNode } from 'react';

export interface ReportTooltipRow {
  color: string;
  kind?: 'bar' | 'line' | 'hatch';
  label: string;
  secondary?: string;
  value: ReactNode;
}

/** Tooltip HTML dùng chung cho biểu đồ trang Báo cáo: tiêu đề + các dòng "tên (phụ) – giá trị". */
export function ReportTooltip({ title, subtitle, rows }: { title: ReactNode; subtitle?: ReactNode; rows: ReportTooltipRow[] }) {
  return (
    <div className="glass-strong min-w-[180px] max-w-[260px] px-3 py-2.5 text-xs shadow-panel">
      <p className="font-semibold text-text">{title}</p>
      {subtitle ? <p className="mb-1.5 text-[11px] text-text-muted">{subtitle}</p> : <span className="block h-1.5" />}
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={row.kind === 'line' ? 'h-0.5 w-3 shrink-0 rounded-full' : 'size-2.5 shrink-0 rounded-[3px]'}
              style={{
                background:
                  row.kind === 'hatch'
                    ? `repeating-linear-gradient(45deg, ${row.color} 0 2px, transparent 2px 4px)`
                    : row.color,
                boxShadow: row.kind === 'hatch' ? `inset 0 0 0 1px ${row.color}` : undefined,
              }}
            />
            <span className="min-w-0 flex-1 truncate text-text-muted" title={row.secondary ? `${row.label} – ${row.secondary}` : row.label}>
              {row.label}
            </span>
            <span className="shrink-0 font-bold text-text tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

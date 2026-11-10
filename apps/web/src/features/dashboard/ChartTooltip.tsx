import type { ReactNode } from 'react';

export interface ChartTooltipRow {
  /** Màu khóa nhận diện (vệt/ô) – chữ không mang màu dữ liệu. */
  color: string;
  /** Khóa dạng vạch (đường) hay ô (cột). */
  kind?: 'bar' | 'line';
  label: string;
  secondary?: string;
  value: ReactNode;
}

/**
 * Nội dung tooltip dùng chung cho mọi biểu đồ recharts: tiêu đề + các dòng
 * "giá trị (đậm) – tên chuỗi (phụ)". Là HTML, không phải SVG.
 */
export function ChartTooltip({ title, rows }: { title: ReactNode; rows: ChartTooltipRow[] }) {
  return (
    <div className="glass-strong min-w-[180px] max-w-[260px] px-3 py-2.5 text-xs shadow-panel">
      <p className="mb-1.5 font-semibold text-text">{title}</p>
      <ul className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={row.kind === 'line' ? 'h-0.5 w-3 shrink-0 rounded-full' : 'size-2.5 shrink-0 rounded-[3px]'}
              style={{ background: row.color }}
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

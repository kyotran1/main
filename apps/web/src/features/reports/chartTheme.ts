import { useMemo } from 'react';
import type { AgentRole, TaskStatus } from '@ads-nolimit/shared';
import { AGENT_ROLES, TASK_STATUSES } from '@ads-nolimit/shared';
import { ROLE_COLOR_VAR, TASK_STATUS_COLOR_VAR } from '@/lib/colors';

/**
 * Giải mã token màu `var(--x)` thành giá trị thật để SVG của recharts dùng được
 * (SVG không nhận CSS var ở một số thuộc tính). Ngoài trình duyệt trả về nguyên chuỗi.
 */
export function resolveCssColor(value: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return value;
  const match = /^var\((--[\w-]+)\)$/.exec(value.trim());
  if (!match || !match[1]) return value;
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return resolved || value;
}

export interface ReportChartTheme {
  /** Chữ trục/chú giải – token chữ, không dùng màu dữ liệu. */
  text: string;
  textDim: string;
  grid: string;
  /** Nền thẻ – dùng cho khe 2px giữa các đoạn xếp chồng và vân gạch chéo. */
  surface: string;
  leads: string;
  conversion: string;
  reach: string;
  status: Record<TaskStatus, string>;
  role: Record<AgentRole, string>;
}

/** Bộ màu biểu đồ trang Báo cáo – giải mã một lần cho mỗi lần gắn component. */
export function useReportChartTheme(): ReportChartTheme {
  return useMemo(
    () => ({
      text: resolveCssColor('var(--color-text-muted)'),
      textDim: resolveCssColor('var(--color-text-dim)'),
      grid: resolveCssColor('var(--color-line)'),
      surface: resolveCssColor('var(--color-bg-panel)'),
      leads: resolveCssColor('var(--color-brand-blue)'),
      conversion: resolveCssColor('var(--color-brand-orange)'),
      reach: resolveCssColor('var(--color-brand-violet)'),
      status: Object.fromEntries(TASK_STATUSES.map((st) => [st, resolveCssColor(TASK_STATUS_COLOR_VAR[st])])) as Record<TaskStatus, string>,
      role: Object.fromEntries(AGENT_ROLES.map((r) => [r, resolveCssColor(ROLE_COLOR_VAR[r])])) as Record<AgentRole, string>,
    }),
    [],
  );
}

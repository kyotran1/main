import { useMemo } from 'react';

/**
 * Giải mã token màu `var(--x)` thành giá trị thật cho SVG của recharts (SVG không nhận CSS var
 * trong một số thuộc tính). Ngoài trình duyệt trả về nguyên chuỗi.
 */
export function resolveCssColor(value: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return value;
  const match = /^var\((--[\w-]+)\)$/.exec(value.trim());
  if (!match || !match[1]) return value;
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return resolved || value;
}

export interface CeoChartTheme {
  text: string;
  grid: string;
  surface: string;
  /** Khách hàng tiềm năng (cột) – một chuỗi, một màu. */
  leads: string;
  /** Tỷ lệ chuyển đổi (đường) – màu ấm, tách biệt với cột. */
  conversion: string;
}

export function useCeoChartTheme(): CeoChartTheme {
  return useMemo(
    () => ({
      text: resolveCssColor('var(--color-text-muted)'),
      grid: resolveCssColor('var(--color-line)'),
      surface: resolveCssColor('var(--color-bg-panel)'),
      leads: resolveCssColor('var(--color-brand-blue)'),
      conversion: resolveCssColor('var(--color-brand-orange)'),
    }),
    [],
  );
}

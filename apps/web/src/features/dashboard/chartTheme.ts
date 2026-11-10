import { useMemo } from 'react';

/**
 * Giải mã token màu dạng `var(--x)` thành giá trị thực (hex/rgba) để SVG của recharts dùng được.
 * Trả về nguyên chuỗi nếu không phải token hoặc đang chạy ngoài trình duyệt.
 */
export function resolveCssColor(value: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return value;
  const match = /^var\((--[\w-]+)\)$/.exec(value.trim());
  if (!match) return value;
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(match[1]!).trim();
  return resolved || value;
}

export interface ChartTheme {
  /** Chữ trục/chú giải – luôn dùng token chữ, không dùng màu dữ liệu. */
  text: string;
  textDim: string;
  /** Lưới hairline, một bậc so với nền. */
  grid: string;
  /** Nền thẻ – dùng cho khe 2px giữa các mảng và vòng quanh điểm. */
  surface: string;
  /** Chuỗi dữ liệu (đã kiểm tra tách biệt màu cho người mù màu): leads, tỷ lệ chuyển đổi, reach. */
  leads: string;
  conversion: string;
  reach: string;
}

/** Bộ màu biểu đồ đã giải mã một lần cho mỗi lần gắn component. */
export function useChartTheme(): ChartTheme {
  return useMemo(
    () => ({
      text: resolveCssColor('var(--color-text-muted)'),
      textDim: resolveCssColor('var(--color-text-dim)'),
      grid: resolveCssColor('var(--color-line)'),
      surface: resolveCssColor('var(--color-bg-panel)'),
      leads: resolveCssColor('var(--color-brand-blue)'),
      conversion: resolveCssColor('var(--color-brand-orange)'),
      reach: resolveCssColor('var(--color-brand-violet)'),
    }),
    [],
  );
}

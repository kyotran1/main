import { useMemo } from 'react';
import type { AgentRole, AgentStatus } from '@ads-nolimit/shared';
import { AGENT_STATUS_COLOR_VAR, ROLE_COLOR_VAR } from '@/lib/colors';

/**
 * Bảng màu cho cảnh 3D – toàn bộ trỏ về token thiết kế trong styles/index.css.
 * three.js không hiểu `var(--color-*)`, nên ta đọc giá trị đã tính trên :root và ghi nhớ.
 * Chỉ dùng token màu đặc (hex); không dùng token rgba vì three bỏ alpha và cảnh báo.
 */
const cache = new Map<string, string>();

export function cssColor(token: string): string {
  const name = token.startsWith('var(') ? token.slice(4, -1).trim() : token;
  const hit = cache.get(name);
  if (hit) return hit;
  const value =
    typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() : '';
  const resolved = value || 'white';
  cache.set(name, resolved);
  return resolved;
}

export function buildScenePalette() {
  return {
    base: cssColor('--color-bg-base'),
    floor: cssColor('--color-bg-deep'),
    panel: cssColor('--color-bg-panel'),
    roomFloor: cssColor('--color-bg-panel-2'),
    furniture: cssColor('--color-bg-elevated'),
    furnitureLight: cssColor('--color-bg-hover'),
    text: cssColor('--color-text'),
    textMuted: cssColor('--color-text-muted'),
    textDim: cssColor('--color-text-dim'),
    cyan: cssColor('--color-brand-cyan'),
    blue: cssColor('--color-brand-blue'),
    violet: cssColor('--color-brand-violet'),
    purple: cssColor('--color-brand-purple'),
    magenta: cssColor('--color-brand-magenta'),
    emerald: cssColor('--color-brand-emerald'),
    green: cssColor('--color-brand-green'),
    amber: cssColor('--color-brand-amber'),
    teal: cssColor('--color-brand-teal'),
  };
}

export type ScenePalette = ReturnType<typeof buildScenePalette>;

/** Hook ghi nhớ bảng màu cho một component trong Canvas. */
export function usePalette(): ScenePalette {
  return useMemo(buildScenePalette, []);
}

export const statusColor = (status: AgentStatus): string => cssColor(AGENT_STATUS_COLOR_VAR[status]);
export const roleColor = (role: AgentRole): string => cssColor(ROLE_COLOR_VAR[role]);

/** Mesh trang trí không cần bắt sự kiện chuột – bỏ qua raycast để tiết kiệm. */
export const NO_RAYCAST = () => null;

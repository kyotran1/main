import type { Agent, Connector } from '@ads-nolimit/shared';
import type { OfficeStore } from '@/store/officeStore';

/**
 * Bộ chọn cho trang Kỹ năng & Kết nối. Mọi số liệu lấy từ store duy nhất
 * (connectors + agents) để khớp với các trang khác.
 */

export type ConnectorCategory = Connector['category'];

/** Thứ tự hiển thị nhóm – mô hình AI lên đầu vì là nền tảng của mọi nhân sự. */
export const CONNECTOR_CATEGORIES: readonly ConnectorCategory[] = [
  'ai_model',
  'ads',
  'analytics',
  'crm',
  'communication',
  'storage',
] as const;

/** Màu nhóm công cụ – chỉ dùng token, không hard-code hex. */
export const CONNECTOR_CATEGORY_COLOR_VAR: Record<ConnectorCategory, string> = {
  ai_model: 'var(--color-brand-violet)',
  ads: 'var(--color-brand-blue)',
  analytics: 'var(--color-brand-emerald)',
  crm: 'var(--color-brand-orange)',
  communication: 'var(--color-brand-cyan)',
  storage: 'var(--color-brand-teal)',
};

export interface ConnectorStats {
  total: number;
  connected: number;
  local: number;
  cloud: number;
}

export const selectConnectorStats = (s: OfficeStore): ConnectorStats => {
  const list = s.connectors;
  return {
    total: list.length,
    connected: list.filter((c) => c.connected).length,
    local: list.filter((c) => c.mode === 'local').length,
    cloud: list.filter((c) => c.mode === 'cloud').length,
  };
};

export interface ConnectorGroup {
  category: ConnectorCategory;
  connectors: Connector[];
}

/** Gom công cụ theo nhóm, bỏ nhóm rỗng; trong nhóm: đã kết nối trước, rồi theo tên. */
export const selectConnectorGroups = (s: OfficeStore): ConnectorGroup[] =>
  CONNECTOR_CATEGORIES.map((category) => ({
    category,
    connectors: s.connectors
      .filter((c) => c.category === category)
      .sort((a, b) => Number(b.connected) - Number(a.connected) || a.vendor.localeCompare(b.vendor)),
  })).filter((g) => g.connectors.length > 0);

/** Ánh xạ connectorId → nhân sự AI đang được cấp quyền dùng công cụ đó. */
export const selectConnectorUsers = (s: OfficeStore): Record<string, Agent[]> => {
  const out: Record<string, Agent[]> = {};
  for (const agent of Object.values(s.agents)) {
    for (const id of agent.connectorIds) (out[id] ??= []).push(agent);
  }
  return out;
};

export interface SkillSummary {
  id: string;
  owners: Agent[];
  /** Trung bình cộng mức thành thạo của các nhân sự sở hữu (0..100). */
  avgLevel: number;
}

/** Tổng hợp kỹ năng của toàn đội: nhiều người sở hữu xếp trước, rồi mức trung bình cao hơn. */
export const selectSkillSummary = (s: OfficeStore): SkillSummary[] => {
  const map = new Map<string, { owners: Agent[]; total: number }>();
  for (const agent of Object.values(s.agents)) {
    for (const skill of agent.skills) {
      const entry = map.get(skill.id) ?? { owners: [], total: 0 };
      entry.owners.push(agent);
      entry.total += skill.level;
      map.set(skill.id, entry);
    }
  }
  return [...map.entries()]
    .map(([id, { owners, total }]) => ({ id, owners, avgLevel: Math.round(total / owners.length) }))
    .sort((a, b) => b.owners.length - a.owners.length || b.avgLevel - a.avgLevel || a.id.localeCompare(b.id));
};

/** Chữ cái đầu dùng làm biểu tượng công cụ (vd "Meta Ads" → "MA"). */
export function connectorMonogram(vendor: string): string {
  const parts = vendor.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  return vendor.slice(0, 2).toUpperCase();
}

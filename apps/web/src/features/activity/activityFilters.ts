import type { ActivityEvent } from '@ads-nolimit/shared';

/** Các loại sự kiện hoạt động – thứ tự hiển thị trong bộ lọc (khớp ActivityEvent['kind']). */
export const ACTIVITY_KINDS: readonly ActivityEvent['kind'][] = [
  'owner_request',
  'plan_created',
  'tasks_created',
  'task_started',
  'task_progress',
  'task_completed',
  'review_passed',
  'review_failed',
  'approval_requested',
  'approval_decided',
  'agent_message',
  'agent_paused',
  'agent_resumed',
  'system',
] as const;

export type ActivityKind = ActivityEvent['kind'];

export interface ActivityFilterState {
  agentId: string | 'all';
  kind: ActivityKind | 'all';
  query: string;
}

export const EMPTY_FILTER: ActivityFilterState = { agentId: 'all', kind: 'all', query: '' };

/** Bỏ dấu tiếng Việt + chữ thường để tìm kiếm không phân biệt dấu. */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/** Lọc hoạt động theo nhân sự, loại sự kiện và từ khóa (so khớp trên văn bản đã diễn giải). */
export function filterActivities(items: ActivityEvent[], filter: ActivityFilterState, toText: (a: ActivityEvent) => string): ActivityEvent[] {
  const q = normalizeSearch(filter.query);
  return items.filter((a) => {
    if (filter.agentId !== 'all' && a.agentId !== filter.agentId) return false;
    if (filter.kind !== 'all' && a.kind !== filter.kind) return false;
    if (!q) return true;
    const haystack = normalizeSearch(`${toText(a)} ${a.text ?? ''} ${Object.values(a.params).join(' ')}`);
    return haystack.includes(q);
  });
}

export interface ActivityDayGroup {
  /** Khóa ngày dạng YYYY-MM-DD theo giờ địa phương. */
  dayKey: string;
  /** Ngày đại diện (ISO của sự kiện đầu tiên trong nhóm). */
  sampleIso: string;
  items: ActivityEvent[];
}

function localDayKey(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Gom nhóm theo ngày (giữ thứ tự mới nhất trước). */
export function groupByDay(items: ActivityEvent[]): ActivityDayGroup[] {
  const groups: ActivityDayGroup[] = [];
  let current: ActivityDayGroup | null = null;
  for (const a of items) {
    const key = localDayKey(a.createdAt);
    if (!current || current.dayKey !== key) {
      current = { dayKey: key, sampleIso: a.createdAt, items: [] };
      groups.push(current);
    }
    current.items.push(a);
  }
  return groups;
}

/** 'today' | 'yesterday' | null – để chọn nhãn nhóm ngày. */
export function relativeDayLabel(dayKey: string, now: Date = new Date()): 'today' | 'yesterday' | null {
  const todayKey = localDayKey(now.toISOString());
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const yesterdayKey = localDayKey(y.toISOString());
  if (dayKey === todayKey) return 'today';
  if (dayKey === yesterdayKey) return 'yesterday';
  return null;
}

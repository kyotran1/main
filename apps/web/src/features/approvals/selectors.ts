import type { Approval, ApprovalStatus, ApprovalType } from '@ads-nolimit/shared';
import type { OfficeStore } from '@/store/officeStore';

/** Bộ chọn cho Trung tâm phê duyệt – tính từ store duy nhất (store.approvals). */

export const APPROVAL_STATUSES: readonly ApprovalStatus[] = ['pending', 'approved', 'rejected'];
export const APPROVAL_TYPES: readonly ApprovalType[] = ['plan', 'budget', 'content', 'publish', 'connector'];

export type ApprovalStats = Record<ApprovalStatus, number> & { total: number };

export const selectApprovalStats = (s: OfficeStore): ApprovalStats => {
  const out: ApprovalStats = { pending: 0, approved: 0, rejected: 0, total: 0 };
  for (const a of Object.values(s.approvals)) {
    out[a.status] += 1;
    out.total += 1;
  }
  return out;
};

/** Thời điểm dùng để sắp xếp: đã quyết định → decidedAt, còn lại → createdAt. */
const sortKey = (a: Approval) => (a.status === 'pending' ? a.createdAt : (a.decidedAt ?? a.createdAt));

/** Toàn bộ yêu cầu: đang chờ trước (mới nhất lên đầu), sau đó là đã quyết định (mới nhất lên đầu). */
export const selectApprovalsSorted = (s: OfficeStore): Approval[] =>
  Object.values(s.approvals).sort((a, b) => {
    const ap = a.status === 'pending';
    const bp = b.status === 'pending';
    if (ap !== bp) return ap ? -1 : 1;
    return sortKey(b).localeCompare(sortKey(a));
  });

/** Lịch sử quyết định – chỉ các yêu cầu đã duyệt/từ chối, mới nhất trước. */
export const selectDecidedApprovals = (s: OfficeStore): Approval[] =>
  Object.values(s.approvals)
    .filter((a) => a.status !== 'pending')
    .sort((a, b) => (b.decidedAt ?? b.createdAt).localeCompare(a.decidedAt ?? a.createdAt));

export interface ApprovalFilter {
  status: ApprovalStatus | 'all';
  type: ApprovalType | 'all';
}

export function applyApprovalFilter(items: Approval[], filter: ApprovalFilter): Approval[] {
  return items.filter((a) => (filter.status === 'all' || a.status === filter.status) && (filter.type === 'all' || a.type === filter.type));
}

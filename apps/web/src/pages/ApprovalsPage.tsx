import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { ApprovalStats } from '@/features/approvals/ApprovalStats';
import { ApprovalFilters } from '@/features/approvals/ApprovalFilters';
import { ApprovalCard } from '@/features/approvals/ApprovalCard';
import { ApprovalHistory } from '@/features/approvals/ApprovalHistory';
import { applyApprovalFilter, selectApprovalsSorted, type ApprovalFilter } from '@/features/approvals/selectors';

/**
 * TRUNG TÂM PHÊ DUYỆT (/approvals): thống kê → bộ lọc → danh sách yêu cầu (đang chờ trước)
 * với nút Duyệt / Từ chối kèm ghi chú; cột phải là lịch sử quyết định. Dữ liệu từ store duy nhất.
 */
export default function ApprovalsPage() {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);
  const all = useDerived(selectApprovalsSorted);
  const [filter, setFilter] = useState<ApprovalFilter>({ status: 'all', type: 'all' });
  const visible = applyApprovalFilter(all, filter);

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-5">
      <PageHeader termId="module.approval_center" icon={<ShieldCheck className="size-5" />} description={t('approvals:description')} />

      {!hydrated ? (
        <div className="flex flex-col gap-4" role="status" aria-busy="true">
          <div className="glass flex items-center gap-3 px-4 py-3 text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin text-brand-cyan" aria-hidden="true" />
            <span>{t('approvals:loading')}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="skeleton h-[84px]" />
            <div className="skeleton h-[84px]" />
            <div className="skeleton h-[84px]" />
          </div>
          <div className="skeleton h-[320px]" />
        </div>
      ) : (
        <>
          <ApprovalStats active={filter.status} onSelect={(status) => setFilter((f) => ({ ...f, status }))} />
          <ApprovalFilters filter={filter} onChange={setFilter} resultCount={visible.length} />

          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="flex min-w-0 flex-col gap-3" aria-label={`${t('approvals:list.title')} – ${t('approvals:list.secondary')}`}>
              {visible.length === 0 ? (
                all.length === 0 ? (
                  <EmptyState title={t('approvals:list.emptyAll')} description={t('approvals:list.emptyAllDescription')} icon={<ShieldCheck className="size-7" aria-hidden="true" />} />
                ) : (
                  <EmptyState title={t('approvals:list.empty')} description={t('approvals:list.emptyDescription')} icon={<ShieldCheck className="size-7" aria-hidden="true" />} />
                )
              ) : (
                visible.map((a) => <ApprovalCard key={a.id} approval={a} />)
              )}
            </section>
            <ApprovalHistory className="self-start xl:sticky xl:top-[84px]" />
          </div>
        </>
      )}
    </div>
  );
}

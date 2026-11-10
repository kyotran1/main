import { useTranslation } from 'react-i18next';
import { Crown, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { CeoHeaderMeta } from '@/features/ceo/CeoHeaderMeta';
import { CeoCommandPanel } from '@/features/ceo/CeoCommandPanel';
import { MiniOfficeCard } from '@/features/ceo/MiniOfficeCard';
import { CeoTaskTable } from '@/features/ceo/CeoTaskTable';
import { CeoKpiPanel } from '@/features/ceo/CeoKpiPanel';
import { CeoMarketingChart } from '@/features/ceo/CeoMarketingChart';
import { CeoQuickReport } from '@/features/ceo/CeoQuickReport';
import { CeoConnectorsCard } from '@/features/ceo/CeoConnectorsCard';
import { AgentRegistryStrip } from '@/features/ceo/AgentRegistryStrip';
import { selectCeoAgent } from '@/features/ceo/selectors';

/**
 * TRUNG TÂM ĐIỀU HÀNH AI CEO (/ceo) – bố cục 3 cột ở màn rộng:
 * trái: bàn làm việc với AI CEO (hội thoại, kế hoạch, ô yêu cầu);
 * giữa: văn phòng 3D thu nhỏ + bảng công việc; phải: KPI, hiệu suất tiếp thị, báo cáo nhanh, công cụ kết nối;
 * hàng dưới: danh sách nhân sự AI. Toàn bộ dữ liệu từ store duy nhất (realtime).
 */
export default function CeoCenterPage() {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);
  const ceo = useDerived(selectCeoAgent);

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-5">
      <PageHeader termId="module.ceo_command_center" icon={<Crown className="size-5" />} description={t('ceo:description')} actions={<CeoHeaderMeta />} />

      {!hydrated ? (
        <CeoLoading message={t('ceo:loading')} />
      ) : !ceo ? (
        <EmptyState title={t('ceo:header.ceoMissing')} icon={<Crown className="size-7" aria-hidden="true" />} />
      ) : (
        <>
          <div className="grid min-w-0 gap-4 lg:grid-cols-12 xl:grid-cols-[minmax(0,3.2fr)_minmax(0,5.3fr)_minmax(0,3.5fr)]">
            <section className="flex min-w-0 flex-col gap-4 lg:col-span-5 xl:col-span-1" aria-label={t('glossary:role.ai_ceo.inline')}>
              <CeoCommandPanel ceo={ceo} />
            </section>
            <section className="flex min-w-0 flex-col gap-4 lg:col-span-7 xl:col-span-1">
              <MiniOfficeCard />
              <CeoTaskTable />
            </section>
            <section className="grid min-w-0 content-start gap-4 lg:col-span-12 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
              <CeoKpiPanel />
              <CeoMarketingChart />
              <CeoQuickReport />
              <CeoConnectorsCard />
            </section>
          </div>
          <AgentRegistryStrip />
        </>
      )}
    </div>
  );
}

/** Trạng thái đang nạp: thông điệp tiếng Việt + khung xương theo bố cục 3 cột. */
function CeoLoading({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-busy="true">
      <div className="glass flex items-center gap-3 px-4 py-3 text-sm text-text-muted">
        <Loader2 className="size-4 animate-spin text-brand-cyan" aria-hidden="true" />
        <span>{message}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-12 xl:grid-cols-[minmax(0,3.2fr)_minmax(0,5.3fr)_minmax(0,3.5fr)]">
        <div className="skeleton h-[520px] lg:col-span-5 xl:col-span-1" />
        <div className="flex flex-col gap-4 lg:col-span-7 xl:col-span-1">
          <div className="skeleton h-[300px]" />
          <div className="skeleton h-[220px]" />
        </div>
        <div className="grid gap-4 lg:col-span-12 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
          <div className="skeleton h-[200px]" />
          <div className="skeleton h-[240px]" />
        </div>
      </div>
    </div>
  );
}

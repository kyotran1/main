import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { useOfficeStore } from '@/store/officeStore';
import { PageLoading } from '@/features/overview/PageLoading';
import { HeadlineStats } from '@/features/overview/HeadlineStats';
import { OfficePreviewCard } from '@/features/overview/OfficePreviewCard';
import { MainFunctionsGrid } from '@/features/overview/MainFunctionsGrid';
import { KeyTasksCard } from '@/features/overview/KeyTasksCard';
import { RecentActivitiesCard } from '@/features/overview/RecentActivitiesCard';
import { OverallProgressCard } from '@/features/overview/OverallProgressCard';

/**
 * TRANG TỔNG QUAN (Overview) – bức tranh toàn cảnh công ty AI hôm nay.
 * Mọi số liệu lấy từ các selector dùng chung (store/selectors) để khớp với Bảng điều khiển,
 * Sơ đồ tổ chức và Văn phòng 3D.
 */
export default function OverviewPage() {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader termId="module.overview" icon={<Home className="size-5" />} description={t('overview:subtitle')} />

      {!hydrated ? (
        <PageLoading message={t('overview:loading')} />
      ) : (
        <>
          <HeadlineStats />

          <div className="grid gap-4 xl:grid-cols-3">
            <OfficePreviewCard className="xl:col-span-2" />
            <MainFunctionsGrid />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <KeyTasksCard />
            <RecentActivitiesCard />
            <OverallProgressCard className="lg:col-span-2 xl:col-span-1" />
          </div>
        </>
      )}
    </div>
  );
}

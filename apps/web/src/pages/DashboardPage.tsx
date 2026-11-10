import { LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { useOfficeStore } from '@/store/officeStore';
import { PageLoading } from '@/features/overview/PageLoading';
import { KpiRow, PeriodChip } from '@/features/dashboard/KpiRow';
import { MarketingPerformanceChart } from '@/features/dashboard/MarketingPerformanceChart';
import { TaskStatusPanel } from '@/features/dashboard/TaskStatusPanel';
import { WorkflowPipeline } from '@/features/dashboard/WorkflowPipeline';
import { AgentGrid } from '@/features/dashboard/AgentGrid';
import { ApprovalsQuickPanel } from '@/features/dashboard/ApprovalsQuickPanel';

/**
 * TRANG BẢNG ĐIỀU KHIỂN (Dashboard) – KPI, hiệu suất tiếp thị, trạng thái công việc,
 * quy trình, nhân sự AI và phê duyệt rút gọn. Dùng CÙNG selectors với trang Tổng quan,
 * Sơ đồ tổ chức và Văn phòng 3D để số liệu luôn khớp nhau.
 */
export default function DashboardPage() {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        termId="module.dashboard"
        icon={<LayoutDashboard className="size-5" />}
        description={t('dashboard:description')}
        actions={<PeriodChip />}
      />

      {!hydrated ? (
        <PageLoading message={t('dashboard:loading')} />
      ) : (
        <>
          <KpiRow />

          <div className="grid gap-4 xl:grid-cols-3">
            <MarketingPerformanceChart className="xl:col-span-2" />
            <TaskStatusPanel />
          </div>

          <WorkflowPipeline />

          <div className="grid gap-4 xl:grid-cols-3">
            <AgentGrid className="xl:col-span-2" />
            <ApprovalsQuickPanel />
          </div>
        </>
      )}
    </div>
  );
}

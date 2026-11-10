import { BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/PageHeader';
import { useOfficeStore } from '@/store/officeStore';
import { PageLoading } from '@/features/overview/PageLoading';
import { KpiRow, PeriodChip } from '@/features/dashboard/KpiRow';
import { WeeklyKpiChart } from '@/features/reports/WeeklyKpiChart';
import { DepartmentTaskChart } from '@/features/reports/DepartmentTaskChart';
import { AgentPerformanceChart } from '@/features/reports/AgentPerformanceChart';
import { DepartmentSummaryTable } from '@/features/reports/DepartmentSummaryTable';
import { CooInsights } from '@/features/reports/CooInsights';
import { ExportMenu } from '@/features/reports/ExportMenu';

/**
 * TRANG BÁO CÁO & PHÂN TÍCH – KPI (dùng chung KpiRow với Bảng điều khiển để số liệu khớp),
 * biểu đồ theo tuần, công việc theo phòng ban, hiệu suất nhân sự, bảng tổng hợp,
 * nhận định của AI COO và xuất dữ liệu (JSON/CSV) phía trình duyệt.
 */
export default function ReportsPage() {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        termId="module.reports_analytics"
        icon={<BarChart3 className="size-5" />}
        description={t('reports:description')}
        actions={
          <>
            <PeriodChip />
            <ExportMenu />
          </>
        }
      />

      {!hydrated ? (
        <PageLoading message={t('reports:loading')} />
      ) : (
        <>
          <KpiRow />

          <div className="grid items-start gap-4 xl:grid-cols-3">
            <WeeklyKpiChart className="xl:col-span-2" />
            <CooInsights />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <DepartmentTaskChart />
            <AgentPerformanceChart />
          </div>

          <DepartmentSummaryTable />
        </>
      )}
    </div>
  );
}

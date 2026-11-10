import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Boxes, Users } from 'lucide-react';
import { Term } from '@ads-nolimit/i18n/react';
import { PageHeader } from '@/components/layout/PageHeader';
import { OfficeScene } from '@/features/office3d/OfficeScene';
import { OfficeStatsRow } from '@/features/office3d/side/OfficeStatsRow';
import { WorkflowPipelineCard } from '@/features/office3d/side/WorkflowPipelineCard';
import { ApprovalQueueCard } from '@/features/office3d/side/ApprovalQueueCard';
import { ActivityLogCard } from '@/features/office3d/side/ActivityLogCard';
import { TaskStatusTiles } from '@/features/office3d/side/TaskStatusTiles';

/**
 * Trang Văn phòng ảo 3D: cảnh 3D chiếm phần lớn (dính khi cuộn ở màn rộng), cột phải gồm
 * thống kê, quy trình, phê duyệt, nhật ký và trạng thái công việc – tất cả từ store duy nhất.
 */
export default function Office3DPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 flex-col">
      <PageHeader
        termId="module.virtual_office_3d"
        icon={<Boxes className="size-5" />}
        description={t('office3d:page.description')}
        actions={
          <Link
            to="/agents"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-line-strong bg-white/[0.03] px-3 text-xs font-semibold text-text hover:bg-white/[0.07] focus-visible:focus-ring"
          >
            <Users className="size-3.5 text-brand-cyan" aria-hidden="true" />
            <Term id="module.agent_registry" format="short" />
          </Link>
        }
      />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_368px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
        <OfficeScene
          mode="full"
          className="h-[440px] sm:h-[520px] md:h-[640px] xl:sticky xl:top-[84px] xl:h-[calc(100vh-150px)] xl:min-h-[600px] xl:self-start"
        />
        <aside className="flex min-w-0 flex-col gap-4">
          <OfficeStatsRow />
          <WorkflowPipelineCard />
          <ApprovalQueueCard />
          <ActivityLogCard />
          <TaskStatusTiles />
        </aside>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, Loader2 } from 'lucide-react';
import type { WorkflowStage } from '@ads-nolimit/shared';
import { PageHeader } from '@/components/layout/PageHeader';
import { useOfficeStore } from '@/store/officeStore';
import { PipelineDiagram } from '@/features/workflow/PipelineDiagram';
import { StageTaskList } from '@/features/workflow/StageTaskList';
import { GovernanceRules } from '@/features/workflow/GovernanceRules';
import { RecentFlow } from '@/features/workflow/RecentFlow';

/**
 * QUY TRÌNH LÀM VIỆC (/workflow): sơ đồ 6 giai đoạn (bấm để lọc) → danh sách công việc
 * ở giai đoạn đó; bên phải: quy tắc quản trị và luồng hoạt động gần đây. Dữ liệu từ store duy nhất.
 */
export default function WorkflowPage() {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);
  const [stage, setStage] = useState<WorkflowStage | null>(null);

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-5">
      <PageHeader termId="module.workflow" icon={<GitBranch className="size-5" />} description={t('workflow:description')} />

      {!hydrated ? (
        <div className="flex flex-col gap-4" role="status" aria-busy="true">
          <div className="glass flex items-center gap-3 px-4 py-3 text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin text-brand-cyan" aria-hidden="true" />
            <span>{t('workflow:loading')}</span>
          </div>
          <div className="skeleton h-[260px]" />
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="skeleton h-[320px] xl:col-span-2" />
            <div className="skeleton h-[320px]" />
          </div>
        </div>
      ) : (
        <>
          <PipelineDiagram selected={stage} onSelect={setStage} />
          <div className="grid min-w-0 gap-4 xl:grid-cols-3">
            <StageTaskList stage={stage} onSelectStage={setStage} className="xl:col-span-2" />
            <div className="flex min-w-0 flex-col gap-4">
              <GovernanceRules />
              <RecentFlow />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { Loader2, Lock, Plug } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useOfficeStore } from '@/store/officeStore';
import { ConnectorStats } from '@/features/connectors/ConnectorStats';
import { ConnectorGroups } from '@/features/connectors/ConnectorGroups';
import { SkillsPanel } from '@/features/connectors/SkillsPanel';

/**
 * KỸ NĂNG & KẾT NỐI (/connectors): thống kê → công cụ kết nối gom theo nhóm (trái)
 * + kỹ năng toàn đội (phải, dính khi cuộn). Nút "Yêu cầu cấp quyền kết nối" chỉ hiển thị (chưa mở).
 */
export default function ConnectorsPage() {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);
  const requestHint = t('connectors:request.hint');

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-5">
      <PageHeader
        termId="module.skill_connector"
        icon={<Plug className="size-5" />}
        description={t('connectors:description')}
        actions={
          <span className="inline-flex" title={requestHint}>
            <Button variant="outline" size="md" icon={<Lock className="size-4" aria-hidden="true" />} disabled aria-describedby="connector-request-hint">
              {t('connectors:request.button')}
            </Button>
            <span id="connector-request-hint" className="sr-only">
              {requestHint}
            </span>
          </span>
        }
      />

      {!hydrated ? (
        <div className="flex flex-col gap-4" role="status" aria-busy="true">
          <div className="glass flex items-center gap-3 px-4 py-3 text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin text-brand-cyan" aria-hidden="true" />
            <span>{t('connectors:loading')}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-[84px]" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="skeleton h-[420px]" />
            <div className="skeleton h-[420px]" />
          </div>
        </div>
      ) : (
        <>
          <ConnectorStats />
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="min-w-0" aria-label={`${t('connectors:list.title')} – ${t('connectors:list.secondary')}`}>
              <ConnectorGroups />
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-line px-3 py-2.5 text-xs leading-relaxed text-text-muted">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-text-dim" aria-hidden="true" />
                <span>{requestHint}</span>
              </p>
            </section>
            <SkillsPanel className="self-start xl:sticky xl:top-[84px]" />
          </div>
        </>
      )}
    </div>
  );
}

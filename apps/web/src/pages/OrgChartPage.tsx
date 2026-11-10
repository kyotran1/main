import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Building2, ChevronsDownUp, ChevronsUpDown, Loader2, Network, ZoomIn, ZoomOut } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useOfficeStore } from '@/store/officeStore';
import { useAgents, useDerived } from '@/store/hooks';
import { selectOrgTree } from '@/store/selectors';
import { groupAgentsByDepartment, selectOpenTaskCounts } from '@/features/agents/selectors';
import { OrgTree, collectParentIds, treeDepth } from '@/features/orgchart/OrgTree';
import { OrgDepartmentView } from '@/features/orgchart/OrgDepartmentView';
import { OrgLegend } from '@/features/orgchart/OrgLegend';

type OrgView = 'tree' | 'department';
const ZOOM_STEPS = [0.6, 0.75, 0.9, 1, 1.15] as const;

/**
 * SƠ ĐỒ TỔ CHỨC (/org-chart): cây báo cáo từ selectOrgTree (Chủ doanh nghiệp → AI CEO → AI COO → …),
 * thu gọn nhánh, thu phóng, hoặc xem theo phòng ban. Bấm nút → mở ngăn hồ sơ nhân sự AI.
 */
export default function OrgChartPage() {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);
  const departments = useOfficeStore((s) => s.departments);
  const ownerName = useOfficeStore((s) => s.company?.ownerName ?? '');
  const agents = useAgents();
  const roots = useDerived(selectOrgTree);
  const openCounts = useDerived(selectOpenTaskCounts);
  const [view, setView] = useState<OrgView>('tree');
  const [zoomIdx, setZoomIdx] = useState(2);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const groups = useMemo(() => groupAgentsByDepartment(agents, departments, openCounts.byDepartment), [agents, departments, openCounts]);
  const parentIds = useMemo(() => collectParentIds(roots), [roots]);
  const levels = useMemo(() => treeDepth(roots), [roots]);
  const totalOpen = useMemo(() => Object.values(openCounts.byAgent).reduce((a, b) => a + b, 0), [openCounts]);
  const allCollapsed = parentIds.length > 0 && parentIds.every((id) => collapsed.has(id));

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const zoom = ZOOM_STEPS[zoomIdx] ?? 1;

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-5">
      <PageHeader
        termId="module.org_chart"
        icon={<Network className="size-5" />}
        description={t('orgchart:description')}
        actions={
          hydrated ? (
            <>
              <div className="flex h-9 rounded-xl border border-line bg-bg-deep/60 p-1" role="group" aria-label={`${t('orgchart:view.label')} – ${t('orgchart:view.labelSecondary')}`}>
                <SegButton active={view === 'tree'} onClick={() => setView('tree')} icon={<Network className="size-3.5" aria-hidden="true" />} label={t('orgchart:view.tree')} secondary={t('orgchart:view.treeSecondary')} />
                <SegButton active={view === 'department'} onClick={() => setView('department')} icon={<Building2 className="size-3.5" aria-hidden="true" />} label={t('orgchart:view.department')} secondary={t('orgchart:view.departmentSecondary')} />
              </div>
              {view === 'tree' ? (
                <>
                  <div className="flex h-9 items-center rounded-xl border border-line bg-bg-deep/60 p-1" role="group" aria-label={`${t('orgchart:zoom.label')} – ${t('orgchart:zoom.labelSecondary')}`}>
                    <IconButton onClick={() => setZoomIdx((i) => Math.max(0, i - 1))} disabled={zoomIdx === 0} label={t('orgchart:zoom.out')}>
                      <ZoomOut className="size-3.5" aria-hidden="true" />
                    </IconButton>
                    <button type="button" onClick={() => setZoomIdx(2)} title={t('orgchart:zoom.reset')} className="min-w-[44px] rounded-lg px-1 text-[11px] font-bold tabular-nums text-text-muted hover:text-text focus-visible:focus-ring">
                      {Math.round(zoom * 100)}%
                    </button>
                    <IconButton onClick={() => setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))} disabled={zoomIdx === ZOOM_STEPS.length - 1} label={t('orgchart:zoom.in')}>
                      <ZoomIn className="size-3.5" aria-hidden="true" />
                    </IconButton>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(parentIds))}
                    disabled={parentIds.length === 0}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-bg-deep/60 px-3 text-xs font-semibold text-text-muted transition hover:text-text focus-visible:focus-ring disabled:opacity-50"
                  >
                    {allCollapsed ? <ChevronsUpDown className="size-3.5" aria-hidden="true" /> : <ChevronsDownUp className="size-3.5" aria-hidden="true" />}
                    {allCollapsed ? t('orgchart:tree.expandAll') : t('orgchart:tree.collapseAll')}
                  </button>
                </>
              ) : null}
            </>
          ) : undefined
        }
      />

      {!hydrated ? (
        <div className="flex flex-col gap-4" role="status" aria-busy="true">
          <div className="glass flex items-center gap-3 px-4 py-3 text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin text-brand-cyan" aria-hidden="true" />
            <span>{t('orgchart:loading')}</span>
          </div>
          <div className="skeleton h-[520px]" />
        </div>
      ) : agents.length === 0 ? (
        <EmptyState title={t('orgchart:empty')} description={t('orgchart:emptyDescription')} icon={<Network className="size-7" aria-hidden="true" />} />
      ) : (
        <>
          {/* Tóm tắt cấu trúc – cùng nguồn selectOrgTree / selectOpenTaskCounts */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Summary value={levels} label={t('orgchart:summary.levels')} secondary={t('orgchart:summary.levelsSecondary')} color="var(--color-brand-violet)" />
            <Summary value={agents.length} label={t('orgchart:summary.agents')} secondary={t('orgchart:summary.agentsSecondary')} color="var(--color-brand-cyan)" />
            <Summary value={groups.length} label={t('orgchart:summary.departments')} secondary={t('orgchart:summary.departmentsSecondary')} color="var(--color-brand-blue)" />
            <Summary value={totalOpen} label={t('orgchart:summary.openTasks')} secondary={t('orgchart:summary.openTasksSecondary')} color="var(--color-brand-green)" />
          </div>

          {view === 'tree' ? (
            <OrgTree roots={roots} openTasksByAgent={openCounts.byAgent} collapsed={collapsed} onToggle={toggle} zoom={zoom} ownerName={ownerName} />
          ) : (
            <OrgDepartmentView groups={groups} openTasksByAgent={openCounts.byAgent} />
          )}
          <OrgLegend />
        </>
      )}
    </div>
  );
}

function Summary({ value, label, secondary, color }: { value: number; label: string; secondary: string; color: string }) {
  return (
    <div className="glass flex items-center gap-3 p-3" title={`${secondary} – ${label}`}>
      <span className="text-2xl font-extrabold leading-none tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="term-stack min-w-0">
        <span className="term-primary truncate text-[13px]">{label}</span>
        <span className="term-secondary truncate">{secondary}</span>
      </span>
    </div>
  );
}

function SegButton({ active, onClick, icon, label, secondary }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; secondary: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={`${label} – ${secondary}`}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition focus-visible:focus-ring',
        active ? 'bg-brand-violet/30 text-text shadow-[0_0_14px_rgba(139,92,246,0.3)] ring-1 ring-brand-violet/60' : 'text-text-muted hover:bg-white/[0.05] hover:text-text',
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function IconButton({ onClick, disabled, label, children }: { onClick: () => void; disabled?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className="flex size-7 items-center justify-center rounded-lg text-text-muted transition hover:bg-white/[0.06] hover:text-text focus-visible:focus-ring disabled:opacity-40">
      {children}
    </button>
  );
}

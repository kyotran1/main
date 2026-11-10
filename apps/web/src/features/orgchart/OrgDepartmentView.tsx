import { useTranslation } from 'react-i18next';
import type { DepartmentGroup } from '@/features/agents/selectors';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { DEPARTMENT_COLOR_VAR } from '@/lib/colors';
import { OrgNodeCard } from './OrgNodeCard';

/** Chế độ xem theo phòng ban: mỗi phòng một khối với màu accent, nhân sự xếp theo cấp bậc. */
export function OrgDepartmentView({ groups, openTasksByAgent }: { groups: DepartmentGroup[]; openTasksByAgent: Record<string, number> }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {groups.map((group) => {
        const color = DEPARTMENT_COLOR_VAR[group.department.id];
        return (
          <section
            key={group.department.id}
            className="glass relative flex min-w-0 flex-col gap-3 overflow-hidden p-3.5"
            style={{ boxShadow: `inset 0 3px 0 ${color}, var(--shadow-panel)` }}
            aria-labelledby={`org-dept-${group.department.id}`}
          >
            <span className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-20 blur-2xl" style={{ background: color }} aria-hidden="true" />
            <header className="relative flex items-start justify-between gap-3">
              <h2 id={`org-dept-${group.department.id}`} className="min-w-0 max-w-full">
                <DepartmentName id={group.department.id} withDot className="max-w-full text-[15px]" />
              </h2>
              <span className="shrink-0 text-right text-[11px] leading-tight text-text-muted">
                <span className="block font-semibold text-text">{t('orgchart:department.members', { count: group.agents.length })}</span>
                {t('orgchart:department.openTasks', { count: group.openTasks })}
              </span>
            </header>
            {group.agents.length === 0 ? (
              <p className="text-xs text-text-muted">{t('orgchart:department.empty')}</p>
            ) : (
              <ul className="relative flex flex-wrap justify-center gap-3">
                {group.agents.map((agent) => (
                  <li key={agent.id}>
                    <OrgNodeCard agent={agent} openTasks={openTasksByAgent[agent.id] ?? 0} size="sm" />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

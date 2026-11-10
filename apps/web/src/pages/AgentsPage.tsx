import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Button } from '@/components/ui/Button';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { useOfficeStore } from '@/store/officeStore';
import { useAgents, useDerived } from '@/store/hooks';
import { DEPARTMENT_COLOR_VAR } from '@/lib/colors';
import { AgentStats } from '@/features/agents/AgentStats';
import { AgentFilters } from '@/features/agents/AgentFilters';
import { AgentCard } from '@/features/agents/AgentCard';
import { EMPTY_AGENT_FILTER, applyAgentFilter, groupAgentsByDepartment, isAgentFilterDirty, selectOpenTaskCounts, type AgentFilter } from '@/features/agents/selectors';

/**
 * NHÂN SỰ AI (/agents, /agents/:agentId): thống kê (selectAgentCounts) → bộ lọc → lưới thẻ theo phòng ban.
 * Có :agentId trên URL → tự mở ngăn hồ sơ (selectAgent); đóng ngăn → trả URL về /agents.
 */
export default function AgentsPage() {
  const { t } = useTranslation();
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const hydrated = useOfficeStore((s) => s.hydrated);
  const departments = useOfficeStore((s) => s.departments);
  const selectedAgentId = useOfficeStore((s) => s.selectedAgentId);
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const agentExists = useOfficeStore((s) => (agentId ? !!s.agents[agentId] : false));
  const agents = useAgents();
  const openCounts = useDerived(selectOpenTaskCounts);
  const [filter, setFilter] = useState<AgentFilter>(EMPTY_AGENT_FILTER);
  const [error, setError] = useState<unknown>(null);
  const openedFromUrl = useRef(false);

  // URL /agents/:agentId → mở ngăn hồ sơ khi dữ liệu đã sẵn sàng.
  useEffect(() => {
    if (!agentId || !hydrated) return;
    if (agentExists) {
      openedFromUrl.current = true;
      selectAgent(agentId);
    } else {
      navigate('/agents', { replace: true });
    }
  }, [agentId, hydrated, agentExists, selectAgent, navigate]);

  // Đóng ngăn đã mở từ URL → trả về /agents để URL khớp trạng thái.
  useEffect(() => {
    if (openedFromUrl.current && agentId && selectedAgentId === null) {
      openedFromUrl.current = false;
      navigate('/agents', { replace: true });
    }
  }, [selectedAgentId, agentId, navigate]);

  const filtered = useMemo(() => applyAgentFilter(agents, filter), [agents, filter]);
  const groups = useMemo(() => groupAgentsByDepartment(filtered, departments, openCounts.byDepartment), [filtered, departments, openCounts]);
  const onError = useCallback((err: unknown) => setError(err), []);

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-5">
      <PageHeader termId="module.ai_agents" icon={<Users className="size-5" />} description={t('agents:description')} />

      {!hydrated ? (
        <div className="flex flex-col gap-4" role="status" aria-busy="true">
          <div className="glass flex items-center gap-3 px-4 py-3 text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin text-brand-cyan" aria-hidden="true" />
            <span>{t('agents:loading')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-[76px]" />
            ))}
          </div>
          <div className="skeleton h-[96px]" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-[220px]" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <AgentStats active={filter.status} onSelect={(status) => setFilter((f) => ({ ...f, status }))} />
          <AgentFilters filter={filter} onChange={setFilter} resultCount={filtered.length} />
          {error ? <ErrorBanner error={error} onRetry={() => setError(null)} /> : null}

          {filtered.length === 0 ? (
            agents.length === 0 ? (
              <EmptyState title={t('agents:list.emptyAll')} description={t('agents:list.emptyAllDescription')} icon={<Users className="size-7" aria-hidden="true" />} />
            ) : (
              <EmptyState
                title={t('agents:list.empty')}
                description={t('agents:list.emptyDescription')}
                icon={<Users className="size-7" aria-hidden="true" />}
                action={
                  isAgentFilterDirty(filter) ? (
                    <Button variant="outline" size="sm" onClick={() => setFilter(EMPTY_AGENT_FILTER)}>
                      {t('agents:filters.reset')}
                    </Button>
                  ) : undefined
                }
              />
            )
          ) : (
            <div className="flex flex-col gap-5">
              {groups.map((group) => {
                const color = DEPARTMENT_COLOR_VAR[group.department.id];
                return (
                  <section key={group.department.id} className="relative min-w-0 pl-3.5" aria-labelledby={`dept-${group.department.id}`}>
                    {/* Rail màu phòng ban – nối tiêu đề nhóm với các thẻ bên dưới */}
                    <span className="absolute inset-y-1 left-0 w-0.5 rounded-full" style={{ background: `linear-gradient(180deg, ${color}, transparent)`, boxShadow: `0 0 10px ${color}` }} aria-hidden="true" />
                    <header className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                      <h2 id={`dept-${group.department.id}`} className="min-w-0 max-w-full">
                        <DepartmentName id={group.department.id} withDot className="max-w-full text-base" />
                      </h2>
                      <p className="text-xs text-text-muted">
                        {t('agents:group.count', { count: group.agents.length })} · {t('agents:group.openTasks', { count: group.openTasks })}
                      </p>
                    </header>
                    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {group.agents.map((agent) => (
                        <li key={agent.id} className="min-w-0">
                          <AgentCard agent={agent} openTasks={openCounts.byAgent[agent.id] ?? 0} onError={onError} />
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { FilterX } from 'lucide-react';
import type { AgentRole, AgentStatus, DepartmentId } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForAgentStatus, termIdForDepartment, termIdForRole } from '@ads-nolimit/i18n';
import { useOfficeStore } from '@/store/officeStore';
import { Select } from '@/features/tasks/FormControls';
import { AGENT_ROLE_ORDER, AGENT_STATUS_ORDER, EMPTY_AGENT_FILTER, isAgentFilterDirty, type AgentFilter } from './selectors';

/** Bộ lọc nhân sự AI theo chức vụ / trạng thái / phòng ban – ô chọn song ngữ, có nút xóa bộ lọc. */
export function AgentFilters({ filter, onChange, resultCount }: { filter: AgentFilter; onChange: (next: AgentFilter) => void; resultCount: number }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const departments = useOfficeStore((s) => s.departments);
  const dirty = isAgentFilterDirty(filter);
  const allLabel = t('agents:filters.all');

  return (
    <div className="glass flex flex-col gap-3 p-3 md:flex-row md:items-end md:p-4">
      <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
        <FilterSelect
          label={t('agents:filters.role')}
          secondary={t('agents:filters.roleSecondary')}
          value={filter.role}
          onChange={(v) => onChange({ ...filter, role: v as AgentRole | 'all' })}
          options={[{ value: 'all', label: allLabel }, ...AGENT_ROLE_ORDER.map((r) => ({ value: r, label: bilingual(termIdForRole(r), locale).inline }))]}
        />
        <FilterSelect
          label={t('agents:filters.status')}
          secondary={t('agents:filters.statusSecondary')}
          value={filter.status}
          onChange={(v) => onChange({ ...filter, status: v as AgentStatus | 'all' })}
          options={[{ value: 'all', label: allLabel }, ...AGENT_STATUS_ORDER.map((s) => ({ value: s, label: bilingual(termIdForAgentStatus(s), locale).inline }))]}
        />
        <FilterSelect
          label={t('agents:filters.department')}
          secondary={t('agents:filters.departmentSecondary')}
          value={filter.department}
          onChange={(v) => onChange({ ...filter, department: v as DepartmentId | 'all' })}
          options={[{ value: 'all', label: allLabel }, ...departments.filter((d) => !d.functional).map((d) => ({ value: d.id, label: bilingual(termIdForDepartment(d.id), locale).inline }))]}
        />
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-text-muted md:h-9 md:justify-end">
        <span role="status" className="whitespace-nowrap">
          {t('agents:filters.result', { count: resultCount })}
        </span>
        {dirty ? (
          <button type="button" onClick={() => onChange(EMPTY_AGENT_FILTER)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-1 font-semibold text-brand-cyan hover:bg-white/5 focus-visible:focus-ring">
            <FilterX className="size-3.5" aria-hidden="true" />
            {t('agents:filters.reset')}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FilterSelect({ label, secondary, value, onChange, options }: { label: string; secondary: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="term-stack" title={`${secondary} – ${label}`}>
        <span className="term-primary text-[11px]">{label}</span>
      </span>
      <Select compact value={value} onChange={(e) => onChange(e.target.value)} options={options} aria-label={`${label} – ${secondary}`} className="w-full" />
    </label>
  );
}

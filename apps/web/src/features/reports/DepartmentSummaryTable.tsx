import { useTranslation } from 'react-i18next';
import { Table2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useLocale } from '@ads-nolimit/i18n/react';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { formatPercent } from '@/lib/format';
import { DEPARTMENT_COLOR_VAR } from '@/lib/colors';
import { selectDepartmentTable } from './selectors';

/** Tiêu đề cột song ngữ: tiếng Việt chính, tiếng Anh phụ (ẩn ở màn hẹp, vẫn có tooltip). */
function Th({ label, secondary, align = 'right', className }: { label: string; secondary?: string; align?: 'left' | 'right'; className?: string }) {
  return (
    <th scope="col" className={clsx('py-2 font-semibold', align === 'right' ? 'text-right' : 'text-left', className)} title={secondary ? `${secondary} – ${label}` : label}>
      <span className="block text-text">{label}</span>
      {secondary ? <span className="hidden text-[10px] font-medium text-text-dim md:block">{secondary}</span> : null}
    </th>
  );
}

/** Bảng tổng hợp theo phòng ban: nhân sự, việc mở, hoàn thành, tỷ lệ hoàn thành + dòng toàn công ty. */
export function DepartmentSummaryTable({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { rows, total } = useDerived(selectDepartmentTable);
  const selectDepartment = useOfficeStore((s) => s.selectDepartment);

  return (
    <Card accent="amber" className={clsx('flex flex-col', className)}>
      <CardHeader icon={<Table2 className="size-4.5" />} title={t('reports:table.title')} subtitle={t('reports:table.secondary')} />
      {rows.length === 0 ? (
        <EmptyState title={t('reports:table.empty')} icon={<Table2 className="size-7" />} />
      ) : (
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[320px] text-xs">
            <thead>
              <tr className="text-text-muted">
                <Th label={t('reports:table.department')} align="left" className="pr-2" />
                <Th label={t('reports:table.agents')} secondary={t('reports:table.agentsSecondary')} className="px-2" />
                <Th label={t('reports:table.open')} secondary={t('reports:table.openSecondary')} className="px-2" />
                <Th label={t('reports:table.completed')} secondary={t('reports:table.completedSecondary')} className="px-2" />
                <Th label={t('reports:table.rate')} secondary={t('reports:table.rateSecondary')} className="w-[34%] pl-2" />
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {rows.map((r) => {
                const color = DEPARTMENT_COLOR_VAR[r.departmentId];
                return (
                  <tr key={r.departmentId} className="border-t border-line/50 transition hover:bg-white/[0.03]">
                    <th scope="row" className="py-2 pr-2 text-left font-medium">
                      <button type="button" onClick={() => selectDepartment(r.departmentId)} className="rounded-md text-left focus-visible:focus-ring">
                        <DepartmentName id={r.departmentId} format="short" withDot className="max-w-[140px] text-text sm:max-w-none" />
                      </button>
                    </th>
                    <td className="px-2 py-2 text-right text-text">{r.agents}</td>
                    <td className="px-2 py-2 text-right text-text">{r.open}</td>
                    <td className="px-2 py-2 text-right text-text">{r.completed}</td>
                    <td className="py-2 pl-2">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={r.completionRate} color={color} size="xs" className="min-w-10" label={`${t('reports:table.rate')}: ${r.completionRate}%`} />
                        <span className="w-10 shrink-0 text-right font-bold text-text">{formatPercent(r.completionRate, locale)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-line-strong/60 font-bold text-text">
                <th scope="row" className="py-2.5 pr-2 text-left" title={`${t('reports:table.totalRowSecondary')} – ${t('reports:table.totalRow')}`}>
                  <span className="block">{t('reports:table.totalRow')}</span>
                  <span className="block text-[10px] font-medium text-text-dim">{t('reports:table.totalRowSecondary')}</span>
                </th>
                <td className="px-2 py-2.5 text-right">{total.agents}</td>
                <td className="px-2 py-2.5 text-right">{total.open}</td>
                <td className="px-2 py-2.5 text-right">{total.completed}</td>
                <td className="py-2.5 pl-2">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={total.completionRate} color="var(--color-brand-cyan)" size="xs" className="min-w-10" label={`${t('reports:table.rate')}: ${total.completionRate}%`} />
                    <span className="w-10 shrink-0 text-right text-brand-cyan">{formatPercent(total.completionRate, locale)}</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
}

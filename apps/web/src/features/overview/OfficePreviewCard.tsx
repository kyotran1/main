import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { DepartmentId } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForDepartment } from '@ads-nolimit/i18n';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DepartmentName } from '@/components/domain/DepartmentName';
import { OfficeScene } from '@/features/office3d/OfficeScene';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { DEPARTMENT_COLOR_VAR } from '@/lib/colors';

/**
 * Khối "Văn phòng ảo 3D" trên trang Tổng quan: cảnh thu nhỏ (OfficeScene mode="mini")
 * + dải phòng ban song ngữ bên dưới. Bấm phòng ban → chọn phòng trong store và mở trang 3D.
 */
export function OfficePreviewCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const connection = useOfficeStore((s) => s.connection);
  const selectDepartment = useOfficeStore((s) => s.selectDepartment);
  const departments = useDerived((s) => s.departments.filter((d) => !d.functional));
  const agentCount = useDerived((s) => Object.keys(s.agents).length);
  const agentsByDepartment = useDerived((s) => {
    const out: Partial<Record<DepartmentId, number>> = {};
    for (const agent of Object.values(s.agents)) out[agent.departmentId] = (out[agent.departmentId] ?? 0) + 1;
    return out;
  });

  const live = connection === 'live';

  return (
    <Card accent="violet" className={clsx('flex flex-col', className)}>
      <CardHeader
        icon={<Building2 className="size-4.5" />}
        title={t('glossary:module.virtual_office_3d.label')}
        subtitle={t('glossary:module.virtual_office_3d.secondary')}
        action={
          // Trên điện thoại nút chuyển xuống dưới cảnh để tiêu đề không bị cắt
          <span className="hidden sm:block">
            <Button size="sm" iconRight={<ArrowRight className="size-3.5" />} onClick={() => navigate('/office')}>
              {t('glossary:action.enter_office.label')}
            </Button>
          </span>
        }
      />
      <div className="relative overflow-hidden rounded-xl border border-line bg-bg-deep/60">
        <OfficeScene mode="mini" className="h-[320px] md:h-[380px]" />
        <div
          className={clsx(
            'pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-bg-base/70 px-2.5 py-1 text-[11px] font-semibold ring-1 backdrop-blur',
            live ? 'text-brand-green ring-brand-green/40' : 'text-brand-amber ring-brand-amber/40',
          )}
          title={live ? `${t('overview:office.liveLabel')} – ${t('overview:office.liveSecondary')}` : t('common:status.reconnecting')}
        >
          <span className={clsx('size-1.5 rounded-full', live ? 'bg-brand-green animate-pulse-soft' : 'bg-brand-amber')} aria-hidden="true" />
          <span>{live ? t('overview:office.liveLabel') : t('common:status.reconnecting')}</span>
          {live ? <span className="text-text-dim">{t('overview:office.liveSecondary')}</span> : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {departments.map((dept) => {
          const label = bilingual(termIdForDepartment(dept.id), locale);
          const color = DEPARTMENT_COLOR_VAR[dept.id];
          const count = agentsByDepartment[dept.id] ?? 0;
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => {
                selectDepartment(dept.id);
                navigate('/office');
              }}
              title={t('overview:office.goToDepartment', { name: label.inline })}
              className="flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold text-text transition hover:bg-white/[0.06] focus-visible:focus-ring"
              style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)`, background: `color-mix(in srgb, ${color} 10%, transparent)` }}
            >
              <DepartmentName id={dept.id} format="short" withDot className="min-w-0" />
              {count > 0 ? (
                <span className="rounded-full px-1.5 text-[10px] font-bold tabular-nums" style={{ background: `color-mix(in srgb, ${color} 22%, transparent)`, color }}>
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
        <span className="ml-auto text-xs text-text-muted">
          {t('overview:office.departments', { count: departments.length })} · {t('overview:office.agentsPresent', { count: agentCount })}
        </span>
      </div>
      <p className="mt-2 text-xs text-text-dim">{t('overview:office.description')}</p>
      <Button className="mt-3 w-full sm:hidden" iconRight={<ArrowRight className="size-4" />} onClick={() => navigate('/office')}>
        {t('glossary:action.enter_office.label')}
      </Button>
    </Card>
  );
}

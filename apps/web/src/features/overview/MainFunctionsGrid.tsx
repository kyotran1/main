import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader } from '@/components/ui/Card';
import { ROUTES, type RouteDef } from '@/app/routes';

/** Ánh xạ accent của tuyến đường → token màu (không hard-code hex). */
const ACCENT_COLOR: Record<NonNullable<RouteDef['accent']>, string> = {
  cyan: 'var(--color-brand-cyan)',
  violet: 'var(--color-brand-violet)',
  green: 'var(--color-brand-green)',
  amber: 'var(--color-brand-amber)',
  red: 'var(--color-brand-red)',
  blue: 'var(--color-brand-blue)',
  magenta: 'var(--color-brand-magenta)',
};

const FEATURED = ROUTES.filter((r) => r.featured);

/** Lưới "Chức năng chính": 8 lối tắt song ngữ tới các phân hệ được đánh dấu featured. */
export function MainFunctionsGrid({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card className={clsx('flex flex-col', className)}>
      <CardHeader
        icon={<LayoutGrid className="size-4.5" />}
        title={t('glossary:module.main_functions.label')}
        subtitle={t('glossary:module.main_functions.secondary')}
      />
      <ul className="grid flex-1 grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-2">
        {FEATURED.map((route) => {
          const Icon = route.icon;
          const color = ACCENT_COLOR[route.accent ?? 'cyan'];
          const label = t(`nav:items.${route.key}.label`);
          const secondary = t(`nav:items.${route.key}.secondary`);
          return (
            <li key={route.key} className="min-w-0">
              <Link
                to={route.path}
                title={`${label} – ${secondary}`}
                aria-label={t('overview:functions.open', { name: label, secondary })}
                className="group flex h-full items-center gap-3 rounded-xl border p-3 transition hover:-translate-y-0.5 hover:bg-white/[0.05] focus-visible:focus-ring"
                style={{
                  borderColor: `color-mix(in srgb, ${color} 38%, transparent)`,
                  background: `linear-gradient(135deg, color-mix(in srgb, ${color} 14%, transparent), transparent 70%)`,
                }}
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ color, background: `color-mix(in srgb, ${color} 18%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 45%, transparent)` }}
                >
                  <Icon className="size-5" />
                </span>
                <span className="term-stack min-w-0 flex-1">
                  {/* Nhãn chính được phép xuống 2 dòng; dòng phụ cắt gọn */}
                  <span className="term-primary line-clamp-2 text-[13px] leading-tight">{label}</span>
                  <span className="term-secondary truncate">{secondary}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-text-dim">{t('overview:functions.description')}</p>
    </Card>
  );
}

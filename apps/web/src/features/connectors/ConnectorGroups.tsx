import { useTranslation } from 'react-i18next';
import { Plug } from 'lucide-react';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual } from '@ads-nolimit/i18n';
import { useDerived } from '@/store/hooks';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConnectorCard } from './ConnectorCard';
import { CONNECTOR_CATEGORY_COLOR_VAR, selectConnectorGroups, selectConnectorUsers } from './selectors';

/** Danh sách công cụ kết nối gom theo nhóm (connector_category) – mỗi nhóm một tiêu đề song ngữ + lưới thẻ. */
export function ConnectorGroups() {
  const { t } = useTranslation();
  const locale = useLocale();
  const groups = useDerived(selectConnectorGroups);
  const users = useDerived(selectConnectorUsers);

  if (groups.length === 0) {
    return (
      <EmptyState
        title={t('connectors:list.empty')}
        description={t('connectors:list.emptyDescription')}
        icon={<Plug className="size-7" aria-hidden="true" />}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ category, connectors }) => {
        const label = bilingual(`connector_category.${category}`, locale);
        const color = CONNECTOR_CATEGORY_COLOR_VAR[category];
        return (
          <section key={category} aria-label={label.inline} className="flex min-w-0 flex-col gap-3">
            <header className="flex items-center gap-3">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} aria-hidden="true" />
              <h2 className="term-stack min-w-0" title={label.inline}>
                <span className="term-primary text-base leading-tight">{label.primary}</span>
                <span className="term-secondary">{label.secondary}</span>
              </h2>
              <span className="ml-auto shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11px] font-semibold text-text-muted">
                {t('connectors:list.count', { count: connectors.length })}
              </span>
            </header>
            <div className="grid gap-3 sm:grid-cols-2">
              {connectors.map((c) => (
                <ConnectorCard key={c.id} connector={c} users={users[c.id] ?? []} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

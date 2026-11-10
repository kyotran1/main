import { useTranslation } from 'react-i18next';
import { Clock3, Users } from 'lucide-react';
import type { Agent, Connector } from '@ads-nolimit/shared';
import { useLocale } from '@ads-nolimit/i18n/react';
import { bilingual, termIdForExecutionMode } from '@ads-nolimit/i18n';
import { useOfficeStore } from '@/store/officeStore';
import { formatRelative } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { useAgentDisplayName } from '@/components/domain/AgentName';
import { CONNECTOR_CATEGORY_COLOR_VAR, connectorMonogram } from './selectors';

const MAX_AVATARS = 5;

/**
 * Thẻ một công cụ kết nối: biểu tượng chữ cái màu theo nhóm, tên thương hiệu (không dịch),
 * mô tả tiếng Việt, trạng thái kết nối, chế độ Local/Cloud, đồng bộ lần cuối và nhân sự đang dùng.
 */
export function ConnectorCard({ connector, users }: { connector: Connector; users: Agent[] }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const displayName = useAgentDisplayName();

  const color = CONNECTOR_CATEGORY_COLOR_VAR[connector.category];
  const category = bilingual(`connector_category.${connector.category}`, locale);
  const mode = bilingual(termIdForExecutionMode(connector.mode), locale);
  const state = bilingual(connector.connected ? 'tech.connected' : 'tech.disconnected', locale);
  const stateColor = connector.connected ? 'var(--color-status-active)' : 'var(--color-status-not-started)';
  // Màu chế độ vận hành: cục bộ = hổ phách, đám mây = tím, kết hợp = cyan (token, không hex).
  const modeColor =
    connector.mode === 'local' ? 'var(--color-brand-amber)' : connector.mode === 'cloud' ? 'var(--color-brand-violet)' : 'var(--color-brand-cyan)';
  const description = t(`connectors:vendors.${connector.id}`, { defaultValue: category.primary });
  const visible = users.slice(0, MAX_AVATARS);
  const hidden = users.length - visible.length;

  return (
    <article
      className={`glass flex min-w-0 flex-col gap-3 p-4 transition ${connector.connected ? '' : 'opacity-80 saturate-50'}`}
      aria-label={connector.vendor}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold tracking-wide text-white"
          style={{
            background: `linear-gradient(145deg, ${color}, color-mix(in srgb, ${color} 55%, var(--color-bg-panel)))`,
            boxShadow: connector.connected ? `0 0 18px color-mix(in srgb, ${color} 45%, transparent)` : 'none',
          }}
          aria-hidden="true"
        >
          {connectorMonogram(connector.vendor)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold leading-tight text-text">{connector.vendor}</h3>
          <p className="line-clamp-2 text-xs leading-snug text-text-muted" title={category.inline}>
            {description}
          </p>
        </div>
        <Badge color={stateColor} size="sm" dot pulse={connector.connected} title={state.inline} className="shrink-0">
          {state.primary}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div className="min-w-0">
          <dt className="term-stack" title={`${t('connectors:card.modeSecondary')} – ${t('connectors:card.mode')}`}>
            <span className="term-primary text-[11px] text-text-muted">{t('connectors:card.mode')}</span>
          </dt>
          <dd className="mt-1 flex items-start gap-1.5" title={mode.inline}>
            <span
              className="mt-1 size-2 shrink-0 rounded-full"
              style={{ background: modeColor, boxShadow: `0 0 8px ${modeColor}` }}
              aria-hidden="true"
            />
            <span className="term-stack min-w-0">
              <span className="term-primary text-xs leading-tight">{mode.primary}</span>
              <span className="term-secondary">{mode.secondary}</span>
            </span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="term-stack" title={`${t('connectors:card.lastSyncSecondary')} – ${t('connectors:card.lastSync')}`}>
            <span className="term-primary text-[11px] text-text-muted">{t('connectors:card.lastSync')}</span>
          </dt>
          <dd className="mt-1 inline-flex items-center gap-1.5 font-semibold text-text">
            <Clock3 className="size-3.5 shrink-0 text-text-dim" aria-hidden="true" />
            <span className="truncate">{connector.lastSyncAt ? formatRelative(connector.lastSyncAt, t) : t('connectors:card.neverSynced')}</span>
          </dd>
        </div>
      </dl>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-text-muted" title={`${t('connectors:card.usedBySecondary')} – ${t('connectors:card.usedBy')}`}>
          <Users className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{users.length === 0 ? t('connectors:card.noUsers') : t('connectors:card.usedBy')}</span>
        </span>
        {users.length > 0 ? (
          <ul className="flex shrink-0 items-center -space-x-1.5" aria-label={t('connectors:card.usedBy')}>
            {visible.map((agent) => (
              <li key={agent.id}>
                <button
                  type="button"
                  onClick={() => selectAgent(agent.id)}
                  title={`${displayName(agent)} · ${t('connectors:card.openAgent')}`}
                  aria-label={`${t('connectors:card.openAgent')}: ${displayName(agent)}`}
                  className="block rounded-full transition hover:z-10 hover:scale-110 focus-visible:focus-ring"
                >
                  <AgentAvatar agent={agent} size={26} showStatus={false} />
                </button>
              </li>
            ))}
            {hidden > 0 ? (
              <li className="flex size-[26px] items-center justify-center rounded-full bg-bg-elevated text-[10px] font-bold text-text-muted ring-2 ring-bg-panel">
                {t('connectors:card.moreUsers', { count: hidden })}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

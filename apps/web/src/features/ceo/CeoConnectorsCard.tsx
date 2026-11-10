import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Plug } from 'lucide-react';
import type { Connector } from '@ads-nolimit/shared';
import { useTerms } from '@ads-nolimit/i18n/react';
import { useOfficeStore } from '@/store/officeStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';

const MAX_TILES = 8;

/** Chữ viết tắt cho logo-chữ của nhà cung cấp (tên thương hiệu – không dịch). */
function vendorMark(vendor: string): string {
  const words = vendor.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0]?.[0] ?? ''}${words[1]?.[0] ?? ''}`.toUpperCase();
  return vendor.slice(0, 2).toUpperCase();
}

/** Màu ổn định theo định danh công cụ để các logo-chữ phân biệt nhau. */
const MARK_COLORS = [
  'var(--color-brand-blue)',
  'var(--color-brand-violet)',
  'var(--color-brand-magenta)',
  'var(--color-brand-green)',
  'var(--color-brand-amber)',
  'var(--color-brand-cyan)',
  'var(--color-brand-orange)',
  'var(--color-brand-teal)',
];
function markColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return MARK_COLORS[h % MARK_COLORS.length] ?? MARK_COLORS[0]!;
}

/**
 * "Skill & Connector – Kỹ năng và công cụ kết nối": lưới logo-chữ của các công cụ (store.connectors)
 * với trạng thái Đã kết nối/Chưa kết nối; mọi ô dẫn tới trang /connectors.
 */
export function CeoConnectorsCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  const terms = useTerms();
  const connectors = useOfficeStore((s) => s.connectors);
  const connectedCount = useMemo(() => connectors.filter((c) => c.connected).length, [connectors]);
  const tiles = connectors.slice(0, MAX_TILES);
  const connected = terms('tech.connected');
  const disconnected = terms('tech.disconnected');

  return (
    <Card accent="green" className={className}>
      <CardHeader
        icon={<Plug className="size-4.5" aria-hidden="true" />}
        title={t('glossary:module.skill_connector.label')}
        subtitle={
          connectors.length
            ? `${t('glossary:module.skill_connector.secondary')} · ${t('ceo:connectors.description', { connected: connectedCount, total: connectors.length })}`
            : t('glossary:module.skill_connector.secondary')
        }
      />
      {tiles.length === 0 ? (
        <EmptyState title={t('ceo:connectors.empty')} icon={<Plug className="size-7" aria-hidden="true" />} />
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
            {tiles.map((c) => (
              <ConnectorTile key={c.id} connector={c} connectedLabel={connected.primary} disconnectedLabel={disconnected.primary} connectedTooltip={connected.inline} disconnectedTooltip={disconnected.inline} />
            ))}
          </ul>
          <Link
            to="/connectors"
            className="mt-3 inline-flex items-center gap-1 rounded text-xs font-semibold text-brand-cyan hover:underline focus-visible:focus-ring"
            title={`${t('ceo:connectors.viewAll')} – ${t('ceo:connectors.viewAllSecondary')}`}
          >
            {t('ceo:connectors.viewAll')}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </>
      )}
    </Card>
  );
}

function ConnectorTile({
  connector,
  connectedLabel,
  disconnectedLabel,
  connectedTooltip,
  disconnectedTooltip,
}: {
  connector: Connector;
  connectedLabel: string;
  disconnectedLabel: string;
  connectedTooltip: string;
  disconnectedTooltip: string;
}) {
  const terms = useTerms();
  const category = terms(`connector_category.${connector.category}`);
  const color = markColor(connector.id);
  const statusColor = connector.connected ? 'var(--color-status-done)' : 'var(--color-status-idle)';
  return (
    <li>
      <Link
        to="/connectors"
        className="flex h-full items-center gap-2.5 rounded-xl border border-line bg-white/[0.03] p-2.5 transition hover:bg-white/[0.07] focus-visible:focus-ring"
        title={`${connector.vendor} · ${category.inline} · ${connector.connected ? connectedTooltip : disconnectedTooltip}`}
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white"
          style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 55%, black))`, boxShadow: `0 0 14px color-mix(in srgb, ${color} 45%, transparent)` }}
          aria-hidden="true"
        >
          {vendorMark(connector.vendor)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block line-clamp-2 text-xs leading-tight font-semibold text-text">{connector.vendor}</span>
          <span className="block truncate text-[10px] text-text-muted">{category.short}</span>
          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold" style={{ color: statusColor }}>
            <span className="size-1.5 rounded-full" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} aria-hidden="true" />
            {connector.connected ? connectedLabel : disconnectedLabel}
          </span>
        </span>
      </Link>
    </li>
  );
}

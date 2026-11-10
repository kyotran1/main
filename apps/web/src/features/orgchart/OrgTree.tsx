import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Crown, MoveHorizontal } from 'lucide-react';
import type { OrgNode } from '@/store/selectors';
import { OrgNodeCard } from './OrgNodeCard';

/*
 * Cây tổ chức bằng CSS thuần (không phụ thuộc thư viện): mỗi <ul> là một tầng, các đường nối
 * vẽ bằng ::before/::after của <li>. Màu đường nối lấy từ token --color-line-strong.
 * Kiểu được nhúng một lần qua <style> và phạm vi theo lớp .org-tree.
 */
const TREE_CSS = `
.org-tree ul{display:flex;justify-content:center;align-items:flex-start;padding-top:28px;position:relative;margin:0;list-style:none}
.org-tree ul::before{content:'';position:absolute;top:0;left:50%;width:0;height:28px;border-left:2px solid var(--color-line-strong)}
.org-tree > ul{padding-top:0}
.org-tree > ul::before{display:none}
.org-tree li{position:relative;display:flex;flex-direction:column;align-items:center;padding:28px 6px 0}
.org-tree li::before,.org-tree li::after{content:'';position:absolute;top:0;right:50%;width:50%;height:28px;border-top:2px solid var(--color-line-strong)}
.org-tree li::after{right:auto;left:50%;border-left:2px solid var(--color-line-strong)}
.org-tree li:only-child::before,.org-tree li:only-child::after{display:none}
.org-tree li:only-child{padding-top:0}
.org-tree li:first-child::before,.org-tree li:last-child::after{border:0 none}
.org-tree li:last-child::before{border-right:2px solid var(--color-line-strong);border-radius:0 12px 0 0}
.org-tree li:first-child::after{border-radius:12px 0 0 0}
.org-tree .org-root{padding-top:0}
.org-tree .org-root::before,.org-tree .org-root::after{display:none}
.org-tree .org-owner-link{width:0;height:26px;border-left:2px dashed var(--color-line-strong)}
`;

export interface OrgTreeProps {
  roots: OrgNode[];
  openTasksByAgent: Record<string, number>;
  collapsed: Set<string>;
  onToggle: (agentId: string) => void;
  zoom: number;
  ownerName: string;
  className?: string;
}

/** Khung cây tổ chức: Chủ doanh nghiệp (nút gốc) → AI CEO → … Cuộn ngang bên trong khung ở màn hẹp. */
export function OrgTree({ roots, openTasksByAgent, collapsed, onToggle, zoom, ownerName, className }: OrgTreeProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Căn giữa khung cuộn vào trục gốc (Chủ doanh nghiệp → AI CEO) khi dựng cây hoặc đổi thu phóng.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
  }, [zoom, roots.length]);

  return (
    <div className={clsx('glass relative overflow-hidden p-0', className)}>
      <style>{TREE_CSS}</style>
      <p className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-bg-deep/70 px-2.5 py-1 text-[11px] text-text-muted ring-1 ring-white/10 xl:hidden">
        <MoveHorizontal className="size-3.5" aria-hidden="true" />
        {t('orgchart:tree.scrollHint')}
      </p>
      <div ref={scrollRef} className="overflow-x-auto overflow-y-hidden px-4 pb-6 pt-12 xl:pt-6">
        <div className="org-tree mx-auto w-max min-w-full" style={{ zoom }}>
          <ul>
            <li className="org-root">
              {/* Nút gốc: Chủ doanh nghiệp – người ra yêu cầu và phê duyệt */}
              <div className="flex w-[184px] flex-col items-center gap-1.5 rounded-card border border-dashed border-brand-gold/60 bg-brand-gold/10 px-3 py-2.5 text-center" title={`${t('orgchart:tree.ownerSecondary')} – ${t('orgchart:tree.owner')}`}>
                <span className="flex size-9 items-center justify-center rounded-full bg-brand-gold/20 text-brand-gold ring-1 ring-brand-gold/60">
                  <Crown className="size-4" aria-hidden="true" />
                </span>
                <span className="term-stack items-center">
                  <span className="term-primary text-[13px]">{ownerName || t('orgchart:tree.owner')}</span>
                  <span className="term-secondary">{t('orgchart:tree.owner')} · {t('orgchart:tree.ownerSecondary')}</span>
                </span>
                <span className="text-[10px] leading-tight text-text-muted">{t('orgchart:tree.ownerHint')}</span>
              </div>
              <span className="org-owner-link" aria-hidden="true" />
              <ul className="!pt-0">
                {roots.map((node) => (
                  <Branch key={node.agent.id} node={node} openTasksByAgent={openTasksByAgent} collapsed={collapsed} onToggle={onToggle} depth={0} />
                ))}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

interface BranchProps {
  node: OrgNode;
  openTasksByAgent: Record<string, number>;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
}

function Branch({ node, openTasksByAgent, collapsed, onToggle, depth }: BranchProps) {
  const isCollapsed = collapsed.has(node.agent.id);
  const hasChildren = node.children.length > 0;
  return (
    <li>
      <OrgNodeCard
        agent={node.agent}
        openTasks={openTasksByAgent[node.agent.id] ?? 0}
        childCount={countDescendants(node)}
        collapsed={isCollapsed}
        onToggle={hasChildren ? () => onToggle(node.agent.id) : undefined}
        size={depth >= 2 ? 'sm' : 'md'}
      />
      {hasChildren && !isCollapsed ? (
        <ul>
          {node.children.map((child) => (
            <Branch key={child.agent.id} node={child} openTasksByAgent={openTasksByAgent} collapsed={collapsed} onToggle={onToggle} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function countDescendants(node: OrgNode): number {
  return node.children.reduce((sum, c) => sum + 1 + countDescendants(c), 0);
}

export function treeDepth(nodes: OrgNode[]): number {
  return nodes.length === 0 ? 0 : 1 + Math.max(...nodes.map((n) => treeDepth(n.children)));
}

/** Mọi id có nhánh con – dùng cho "Thu gọn tất cả". */
export function collectParentIds(nodes: OrgNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.children.length) {
      acc.push(n.agent.id);
      collectParentIds(n.children, acc);
    }
  }
  return acc;
}

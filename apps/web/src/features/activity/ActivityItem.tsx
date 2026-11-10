import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import type { ActivityEvent } from '@ads-nolimit/shared';
import { useOfficeStore } from '@/store/officeStore';
import { useAgentDisplayName } from '@/components/domain/AgentName';
import { AgentAvatar } from '@/components/domain/AgentAvatar';
import { formatRelative } from '@/lib/format';
import { ROLE_COLOR_VAR } from '@/lib/colors';

/**
 * Diễn giải một sự kiện hoạt động thành câu tiếng Việt.
 * - templateKey → activity:templates.<key> (bản dịch giao diện)
 * - params.agent là id nhân sự → thay bằng tên hiển thị song ngữ
 * - text (nếu có) là văn bản do Agent tự viết – dữ liệu, giữ nguyên.
 */
export function useActivityText() {
  const { t } = useTranslation();
  const agents = useOfficeStore((s) => s.agents);
  const displayName = useAgentDisplayName();
  return (activity: ActivityEvent): string => {
    const params: Record<string, string | number> = { ...activity.params };
    if (typeof params.agent === 'string' && agents[params.agent]) {
      params.agent = displayName(agents[params.agent]);
    }
    const key = `activity:templates.${activity.templateKey}`;
    const text = t(key, { ...params, defaultValue: '' });
    return text || activity.text || t('activity:templates.system', { message: activity.kind });
  };
}

export function ActivityItem({ activity, compact }: { activity: ActivityEvent; compact?: boolean }) {
  const { t } = useTranslation();
  const toText = useActivityText();
  const agent = useOfficeStore((s) => (activity.agentId ? s.agents[activity.agentId] : undefined));
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const selectTask = useOfficeStore((s) => s.selectTask);
  const color = agent ? ROLE_COLOR_VAR[agent.role] : 'var(--color-brand-cyan)';
  const text = toText(activity);
  return (
    <li className={clsx('flex items-start gap-3', compact ? 'py-2' : 'py-2.5')}>
      {agent ? (
        <button type="button" onClick={() => selectAgent(agent.id)} className="shrink-0 rounded-full focus-visible:focus-ring" aria-label={text}>
          <AgentAvatar agent={agent} size={compact ? 28 : 34} showStatus={false} />
        </button>
      ) : (
        <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      )}
      <div className="min-w-0 flex-1">
        <p className={clsx('leading-snug text-text', compact ? 'text-[13px]' : 'text-sm')}>
          {activity.taskId ? (
            <button type="button" className="text-left hover:underline" onClick={() => selectTask(activity.taskId!)}>
              {text}
            </button>
          ) : activity.approvalId ? (
            <Link to="/approvals" className="hover:underline">
              {text}
            </Link>
          ) : (
            text
          )}
        </p>
        {activity.text ? <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{activity.text}</p> : null}
      </div>
      <time dateTime={activity.createdAt} className="shrink-0 whitespace-nowrap text-[11px] text-text-dim" title={new Date(activity.createdAt).toLocaleString()}>
        {formatRelative(activity.createdAt, t)}
      </time>
    </li>
  );
}

export function ActivityList({ items, compact, emptyLabel }: { items: ActivityEvent[]; compact?: boolean; emptyLabel?: string }) {
  const { t } = useTranslation();
  if (!items.length) return <p className="py-6 text-center text-sm text-text-muted">{emptyLabel ?? t('activity:empty')}</p>;
  return (
    <ul className="divide-y divide-line/60">
      {items.map((a) => (
        <ActivityItem key={a.id} activity={a} compact={compact} />
      ))}
    </ul>
  );
}

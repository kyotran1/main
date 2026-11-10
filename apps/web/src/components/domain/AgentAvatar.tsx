import { clsx } from 'clsx';
import type { Agent } from '@ads-nolimit/shared';
import { AGENT_STATUS_COLOR_VAR, ROLE_COLOR_VAR } from '@/lib/colors';
import { initialsFromRole } from '@/lib/format';

/** Ảnh đại diện nhân sự AI: vòng màu theo chức vụ, chấm trạng thái theo backend. */
export function AgentAvatar({ agent, size = 40, className, showStatus = true }: { agent: Agent; size?: number; className?: string; showStatus?: boolean }) {
  const roleColor = ROLE_COLOR_VAR[agent.role];
  const statusColor = AGENT_STATUS_COLOR_VAR[agent.status];
  const hue = hashHue(agent.avatarSeed);
  return (
    <span className={clsx('relative inline-flex shrink-0', className)} style={{ width: size, height: size }}>
      <span
        className="flex size-full items-center justify-center rounded-full font-bold text-white"
        style={{
          fontSize: Math.max(10, size * 0.34),
          background: `radial-gradient(circle at 30% 25%, hsl(${hue} 85% 70%), hsl(${(hue + 40) % 360} 70% 40%))`,
          boxShadow: `0 0 0 2px var(--color-bg-panel), 0 0 0 4px ${roleColor}, 0 0 16px ${roleColor}`,
        }}
        aria-hidden="true"
      >
        {initialsFromRole(agent.role)}
      </span>
      {showStatus ? (
        <span
          className={clsx('absolute -right-0.5 -bottom-0.5 rounded-full ring-2 ring-bg-panel', (agent.status === 'running' || agent.status === 'active') && 'animate-pulse-soft')}
          style={{ width: Math.max(8, size * 0.28), height: Math.max(8, size * 0.28), background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
        />
      ) : null}
    </span>
  );
}

function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

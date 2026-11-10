import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  BookOpen,
  Boxes,
  Crown,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  Home,
  Network,
  Plug,
  Settings,
  ShieldCheck,
  SquareCheckBig,
  Users,
} from 'lucide-react';

/**
 * Định nghĩa tuyến đường + điều hướng. Đường dẫn URL là định danh kỹ thuật (tiếng Anh),
 * nhãn hiển thị lấy từ nav:items.<key> (song ngữ) – không hard-code chữ ở đây.
 */
export type NavGroup = 'operate' | 'manage' | 'insight' | 'system';

export interface RouteDef {
  key: string;
  path: string;
  group: NavGroup;
  icon: LucideIcon;
  /** Id thuật ngữ dùng cho tiêu đề trang (glossary). */
  termId: string;
  /** Hiển thị trong ô "Chức năng chính" trên trang Tổng quan. */
  featured?: boolean;
  accent?: 'cyan' | 'violet' | 'green' | 'amber' | 'red' | 'blue' | 'magenta';
}

export const ROUTES: readonly RouteDef[] = [
  { key: 'overview', path: '/', group: 'operate', icon: Home, termId: 'module.overview', accent: 'violet' },
  {
    key: 'dashboard',
    path: '/dashboard',
    group: 'operate',
    icon: LayoutDashboard,
    termId: 'module.dashboard',
    featured: true,
    accent: 'blue',
  },
  {
    key: 'office',
    path: '/office',
    group: 'operate',
    icon: Boxes,
    termId: 'module.virtual_office_3d',
    featured: true,
    accent: 'violet',
  },
  {
    key: 'ceo',
    path: '/ceo',
    group: 'operate',
    icon: Crown,
    termId: 'module.ceo_command_center',
    featured: true,
    accent: 'amber',
  },
  {
    key: 'tasks',
    path: '/tasks',
    group: 'manage',
    icon: SquareCheckBig,
    termId: 'module.task_management',
    featured: true,
    accent: 'green',
  },
  { key: 'agents', path: '/agents', group: 'manage', icon: Users, termId: 'module.ai_agents', featured: true, accent: 'cyan' },
  {
    key: 'workflow',
    path: '/workflow',
    group: 'manage',
    icon: GitBranch,
    termId: 'module.workflow',
    featured: true,
    accent: 'magenta',
  },
  {
    key: 'approvals',
    path: '/approvals',
    group: 'manage',
    icon: ShieldCheck,
    termId: 'module.approval_center',
    featured: true,
    accent: 'red',
  },
  {
    key: 'connectors',
    path: '/connectors',
    group: 'manage',
    icon: Plug,
    termId: 'module.skill_connector',
    featured: true,
    accent: 'cyan',
  },
  { key: 'orgChart', path: '/org-chart', group: 'manage', icon: Network, termId: 'module.org_chart', accent: 'blue' },
  { key: 'projects', path: '/projects', group: 'manage', icon: FolderKanban, termId: 'module.projects_campaigns', accent: 'violet' },
  { key: 'activity', path: '/activity', group: 'insight', icon: Activity, termId: 'module.activity_log', accent: 'cyan' },
  { key: 'reports', path: '/reports', group: 'insight', icon: BarChart3, termId: 'module.reports_analytics', accent: 'green' },
  { key: 'knowledge', path: '/knowledge', group: 'insight', icon: BookOpen, termId: 'module.knowledge_base', accent: 'amber' },
  { key: 'settings', path: '/settings', group: 'system', icon: Settings, termId: 'module.settings', accent: 'violet' },
] as const;

export const NAV_GROUPS: readonly NavGroup[] = ['operate', 'manage', 'insight', 'system'] as const;

export function routeByKey(key: string): RouteDef | undefined {
  return ROUTES.find((r) => r.key === key);
}

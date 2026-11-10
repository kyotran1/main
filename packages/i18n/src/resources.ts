import type { Locale } from '@ads-nolimit/shared';
import { buildGlossaryResources } from './glossary.js';

import viCommon from '../locales/vi-VN/common.json';
import viNav from '../locales/vi-VN/nav.json';
import viActivity from '../locales/vi-VN/activity.json';
import viErrors from '../locales/vi-VN/errors.json';
import viOverview from '../locales/vi-VN/overview.json';
import viDashboard from '../locales/vi-VN/dashboard.json';
import viOffice3d from '../locales/vi-VN/office3d.json';
import viCeo from '../locales/vi-VN/ceo.json';
import viAgents from '../locales/vi-VN/agents.json';
import viTasks from '../locales/vi-VN/tasks.json';
import viWorkflow from '../locales/vi-VN/workflow.json';
import viApprovals from '../locales/vi-VN/approvals.json';
import viOrgchart from '../locales/vi-VN/orgchart.json';
import viProjects from '../locales/vi-VN/projects.json';
import viReports from '../locales/vi-VN/reports.json';
import viSettings from '../locales/vi-VN/settings.json';
import viConnectors from '../locales/vi-VN/connectors.json';
import viKnowledge from '../locales/vi-VN/knowledge.json';
import viDesktop from '../locales/vi-VN/desktop.json';

import enCommon from '../locales/en-US/common.json';
import enNav from '../locales/en-US/nav.json';
import enActivity from '../locales/en-US/activity.json';
import enErrors from '../locales/en-US/errors.json';
import enOverview from '../locales/en-US/overview.json';
import enDashboard from '../locales/en-US/dashboard.json';
import enOffice3d from '../locales/en-US/office3d.json';
import enCeo from '../locales/en-US/ceo.json';
import enAgents from '../locales/en-US/agents.json';
import enTasks from '../locales/en-US/tasks.json';
import enWorkflow from '../locales/en-US/workflow.json';
import enApprovals from '../locales/en-US/approvals.json';
import enOrgchart from '../locales/en-US/orgchart.json';
import enProjects from '../locales/en-US/projects.json';
import enReports from '../locales/en-US/reports.json';
import enSettings from '../locales/en-US/settings.json';
import enConnectors from '../locales/en-US/connectors.json';
import enKnowledge from '../locales/en-US/knowledge.json';
import enDesktop from '../locales/en-US/desktop.json';

export const NAMESPACES = [
  'common',
  'nav',
  'glossary',
  'activity',
  'errors',
  'overview',
  'dashboard',
  'office3d',
  'ceo',
  'agents',
  'tasks',
  'workflow',
  'approvals',
  'orgchart',
  'projects',
  'reports',
  'settings',
  'connectors',
  'knowledge',
  'desktop',
] as const;

export type Namespace = (typeof NAMESPACES)[number];

export const SUPPORTED_LOCALES: readonly Locale[] = ['vi-VN', 'en-US'] as const;
export const DEFAULT_LOCALE: Locale = 'vi-VN';
export const FALLBACK_LOCALE: Locale = 'vi-VN';

export const resources: Record<Locale, Record<Namespace, Record<string, unknown>>> = {
  'vi-VN': {
    common: viCommon,
    nav: viNav,
    glossary: buildGlossaryResources('vi-VN'),
    activity: viActivity,
    errors: viErrors,
    overview: viOverview,
    dashboard: viDashboard,
    office3d: viOffice3d,
    ceo: viCeo,
    agents: viAgents,
    tasks: viTasks,
    workflow: viWorkflow,
    approvals: viApprovals,
    orgchart: viOrgchart,
    projects: viProjects,
    reports: viReports,
    settings: viSettings,
    connectors: viConnectors,
    knowledge: viKnowledge,
    desktop: viDesktop,
  },
  'en-US': {
    common: enCommon,
    nav: enNav,
    glossary: buildGlossaryResources('en-US'),
    activity: enActivity,
    errors: enErrors,
    overview: enOverview,
    dashboard: enDashboard,
    office3d: enOffice3d,
    ceo: enCeo,
    agents: enAgents,
    tasks: enTasks,
    workflow: enWorkflow,
    approvals: enApprovals,
    orgchart: enOrgchart,
    projects: enProjects,
    reports: enReports,
    settings: enSettings,
    connectors: enConnectors,
    knowledge: enKnowledge,
    desktop: enDesktop,
  },
};

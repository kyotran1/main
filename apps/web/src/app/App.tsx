import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/ui/PageSkeleton';

const OverviewPage = lazy(() => import('@/pages/OverviewPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const Office3DPage = lazy(() => import('@/pages/Office3DPage'));
const CeoCenterPage = lazy(() => import('@/pages/CeoCenterPage'));
const OrgChartPage = lazy(() => import('@/pages/OrgChartPage'));
const TasksPage = lazy(() => import('@/pages/TasksPage'));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const AgentsPage = lazy(() => import('@/pages/AgentsPage'));
const WorkflowPage = lazy(() => import('@/pages/WorkflowPage'));
const ApprovalsPage = lazy(() => import('@/pages/ApprovalsPage'));
const ConnectorsPage = lazy(() => import('@/pages/ConnectorsPage'));
const ActivityPage = lazy(() => import('@/pages/ActivityPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const KnowledgePage = lazy(() => import('@/pages/KnowledgePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          index
          element={
            <Suspense fallback={<PageSkeleton />}>
              <OverviewPage />
            </Suspense>
          }
        />
        <Route path="/dashboard" element={<Lazy><DashboardPage /></Lazy>} />
        <Route path="/office" element={<Lazy><Office3DPage /></Lazy>} />
        <Route path="/ceo" element={<Lazy><CeoCenterPage /></Lazy>} />
        <Route path="/org-chart" element={<Lazy><OrgChartPage /></Lazy>} />
        <Route path="/tasks" element={<Lazy><TasksPage /></Lazy>} />
        <Route path="/projects" element={<Lazy><ProjectsPage /></Lazy>} />
        <Route path="/agents" element={<Lazy><AgentsPage /></Lazy>} />
        <Route path="/agents/:agentId" element={<Lazy><AgentsPage /></Lazy>} />
        <Route path="/workflow" element={<Lazy><WorkflowPage /></Lazy>} />
        <Route path="/approvals" element={<Lazy><ApprovalsPage /></Lazy>} />
        <Route path="/connectors" element={<Lazy><ConnectorsPage /></Lazy>} />
        <Route path="/activity" element={<Lazy><ActivityPage /></Lazy>} />
        <Route path="/reports" element={<Lazy><ReportsPage /></Lazy>} />
        <Route path="/knowledge" element={<Lazy><KnowledgePage /></Lazy>} />
        <Route path="/settings" element={<Lazy><SettingsPage /></Lazy>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

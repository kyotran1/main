import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ConnectionBanner } from './ConnectionBanner';
import { AgentDetailDrawer } from '@/features/agents/AgentDetailDrawer';
import { TaskDetailDrawer } from '@/features/tasks/TaskDetailDrawer';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <div className="flex min-h-full">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-brand-violet focus:px-3 focus:py-2 focus:text-white">
        {t('common:a11y.skipToContent')}
      </a>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setMobileOpen(true)} />
        <ConnectionBanner />
        <main id="main" className="min-w-0 flex-1 px-3 py-4 md:px-5 md:py-5">
          <Outlet />
        </main>
      </div>
      <AgentDetailDrawer />
      <TaskDetailDrawer />
    </div>
  );
}

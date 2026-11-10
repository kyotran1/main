import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderKanban, SearchX } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { PageLoading } from '@/features/overview/PageLoading';
import { ProjectsSummary } from '@/features/projects/ProjectsSummary';
import { ProjectStatusFilter, type ProjectFilter } from '@/features/projects/ProjectStatusFilter';
import { ProjectCard } from '@/features/projects/ProjectCard';
import { selectProjectCards } from '@/features/projects/selectors';

/**
 * TRANG DỰ ÁN & CHIẾN DỊCH – thẻ dự án từ store.projects, công việc gắn theo projectId.
 * Mọi số liệu đọc từ store duy nhất qua useDerived; bấm công việc mở ngăn chi tiết dùng chung.
 */
export default function ProjectsPage() {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);
  const totalProjects = useOfficeStore((s) => Object.keys(s.projects).length);
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const cards = useDerived(selectProjectCards(filter), [filter]);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader termId="module.projects_campaigns" icon={<FolderKanban className="size-5" />} description={t('projects:description')} />

      {!hydrated ? (
        <PageLoading message={t('projects:loading')} />
      ) : (
        <>
          <ProjectsSummary />

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <ProjectStatusFilter value={filter} onChange={setFilter} />
            <p className="shrink-0 text-xs text-text-muted tabular-nums">{t('projects:filter.count', { shown: cards.length, total: totalProjects })}</p>
          </div>

          {totalProjects === 0 ? (
            <Card>
              <EmptyState icon={<FolderKanban className="size-7" />} title={t('projects:empty.title')} description={t('projects:empty.description')} />
            </Card>
          ) : cards.length === 0 ? (
            <Card>
              <EmptyState
                icon={<SearchX className="size-7" />}
                title={t('projects:empty.filtered')}
                description={t('projects:empty.filteredDescription')}
                action={
                  <Button variant="outline" size="sm" onClick={() => setFilter('all')}>
                    {t('projects:filter.all')}
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {cards.map((data) => (
                <ProjectCard key={data.project.id} data={data} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { GitBranch } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';

export default function WorkflowPage() {
  const { t } = useTranslation();
  return (
    <div>
      <PageHeader termId="module.workflow" icon={<GitBranch className="size-5" />} />
      <Card>
        <p className="text-sm text-text-muted">{t('common:labels.loading')}</p>
      </Card>
    </div>
  );
}

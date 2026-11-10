import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExecutionModeCard } from '@/features/settings/ExecutionModeCard';
import { LanguageCard } from '@/features/settings/LanguageCard';
import { CompanyCard } from '@/features/settings/CompanyCard';
import { BackendCard } from '@/features/settings/BackendCard';
import { LanguageStandardCard } from '@/features/settings/LanguageStandardCard';

/**
 * CÀI ĐẶT HỆ THỐNG (/settings): chế độ vận hành (toàn chiều rộng) → ngôn ngữ + thông tin công ty
 * → kết nối hệ thống nền + chuẩn ngôn ngữ giao diện. Mọi giá trị hiện tại đọc từ store duy nhất.
 */
export default function SettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-5">
      <PageHeader termId="module.settings" icon={<Settings className="size-5" />} description={t('settings:description')} />
      <ExecutionModeCard />
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <LanguageCard />
        <CompanyCard />
        <BackendCard />
        <LanguageStandardCard />
      </div>
    </div>
  );
}

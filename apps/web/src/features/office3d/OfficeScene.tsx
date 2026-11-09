import type { DepartmentId } from '@ads-nolimit/shared';
import { useTranslation } from 'react-i18next';

/**
 * CẢNH VĂN PHÒNG ẢO 3D – giao diện công khai (public API) dùng bởi trang Văn phòng 3D,
 * Tổng quan (thu nhỏ) và Trung tâm điều hành AI CEO (thu nhỏ).
 * Đọc dữ liệu từ useOfficeStore (nguồn duy nhất); không nhận dữ liệu qua props.
 *
 * TRIỂN KHAI THẬT nằm ở gói công việc "office3d" – tệp này là khung giữ chỗ để các trang khác
 * biên dịch được trong lúc phát triển song song. Giữ nguyên chữ ký props.
 */
export interface OfficeSceneProps {
  /** full: tương tác đầy đủ; mini: chế độ thu nhỏ, camera cố định, không điều khiển. */
  mode?: 'full' | 'mini';
  className?: string;
  onSelectAgent?: (agentId: string) => void;
  onSelectDepartment?: (departmentId: DepartmentId) => void;
}

export function OfficeScene({ mode = 'full', className }: OfficeSceneProps) {
  const { t } = useTranslation();
  return (
    <div className={className} data-office-scene={mode} role="img" aria-label={t('glossary:module.virtual_office_3d.inline')}>
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl border border-dashed border-line text-sm text-text-muted">
        {t('common:labels.loading')}
      </div>
    </div>
  );
}

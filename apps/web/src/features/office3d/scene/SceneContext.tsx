import { createContext, useContext } from 'react';
import type { DepartmentId } from '@ads-nolimit/shared';

/** Thiết lập hiển thị của cảnh – do OfficeScene cung cấp, các component trong/ngoài Canvas đọc. */
export interface SceneSettings {
  mode: 'full' | 'mini';
  showLabels: boolean;
  reducedMotion: boolean;
  /** Phòng ban đang được lọc (làm mờ phần còn lại, camera lướt tới). */
  filterDepartmentId: DepartmentId | null;
  /** Tăng mỗi lần nhấn "Đặt lại góc nhìn". */
  resetToken: number;
  onSelectAgent?: (agentId: string) => void;
  onSelectDepartment?: (departmentId: DepartmentId) => void;
}

export const SceneContext = createContext<SceneSettings>({
  mode: 'full',
  showLabels: true,
  reducedMotion: false,
  filterDepartmentId: null,
  resetToken: 0,
});

export const useSceneSettings = (): SceneSettings => useContext(SceneContext);

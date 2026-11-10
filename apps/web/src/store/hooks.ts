import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useOfficeStore, type OfficeStore } from './officeStore';

/**
 * QUY TẮC DÙNG STORE (tránh vòng lặp render vô hạn của useSyncExternalStore):
 * - Giá trị nguyên thủy hoặc tham chiếu có sẵn trong store (vd: s.agents[id], s.connection):
 *     useOfficeStore((s) => s.connection)
 * - Selector TẠO MỚI object/array (tính toán, lọc, gom nhóm) → dùng useDerived(...).
 *   Kết quả được ghi nhớ và chỉ tính lại khi một lát dữ liệu (tasks, agents, …) thay đổi.
 */
export function useDerived<T>(selector: (s: OfficeStore) => T, deps: ReadonlyArray<unknown> = []): T {
  const slices = useOfficeStore(
    useShallow((s) => [s.hydrated, s.departments, s.agents, s.tasks, s.approvals, s.projects, s.connectors, s.activities, s.messages, s.kpis, s.company] as const),
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => selector(useOfficeStore.getState()), [...slices, ...deps]);
}

/** Lát dữ liệu dạng mảng ổn định về tham chiếu (object → array, ghi nhớ theo lát). */
export function useAgents() {
  return useDerived((s) => Object.values(s.agents));
}
export function useTasks() {
  return useDerived((s) => Object.values(s.tasks));
}
export function useApprovals() {
  return useDerived((s) => Object.values(s.approvals));
}
export function useProjects() {
  return useDerived((s) => Object.values(s.projects));
}

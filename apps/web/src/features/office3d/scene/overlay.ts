import { createContext, useCallback, useContext } from 'react';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { Object3D, Vector3 } from 'three';
import type { DepartmentId } from '@ads-nolimit/shared';

/**
 * "Bus" nối phần 3D (trong Canvas) với lớp nhãn DOM (ngoài Canvas) của một cảnh.
 * - Nhãn HTML được vẽ bằng React DOM bình thường (đầy đủ context, không tạo root phụ như drei <Html>).
 * - Mỗi khung hình, LabelProjector chiếu vị trí 3D của các "neo" lên màn hình và ghi transform
 *   thẳng vào phần tử DOM – không re-render React.
 * - Trạng thái hover/compact dùng store zustand riêng của cảnh để hai phía cùng đọc.
 */

export interface LabelAnchor {
  /** Bám theo một Object3D (nhân sự di chuyển)… */
  object?: Object3D;
  /** …hoặc một điểm cố định (phòng ban, biển hiệu). */
  position?: readonly [number, number, number];
  offsetY: number;
}

export interface SceneUiState {
  hoveredAgentId: string | null;
  hoveredDepartmentId: DepartmentId | null;
  /** Khung vẽ hẹp (< 560px) → nhãn rút gọn. */
  compact: boolean;
  setHoveredAgent: (id: string) => void;
  clearHoveredAgent: (id: string) => void;
  setHoveredDepartment: (id: DepartmentId) => void;
  clearHoveredDepartment: (id: DepartmentId) => void;
  setCompact: (compact: boolean) => void;
}

export interface SceneOverlayBus {
  ui: StoreApi<SceneUiState>;
  anchors: Map<string, LabelAnchor>;
  elements: Map<string, HTMLElement>;
  /** Vị trí hiện tại của nhân sự – CameraRig đọc để theo dõi. */
  positions: Map<string, Vector3>;
}

export function createOverlayBus(): SceneOverlayBus {
  const ui = createStore<SceneUiState>((set, get) => ({
    hoveredAgentId: null,
    hoveredDepartmentId: null,
    compact: false,
    setHoveredAgent: (id) => set({ hoveredAgentId: id }),
    clearHoveredAgent: (id) => {
      if (get().hoveredAgentId === id) set({ hoveredAgentId: null });
    },
    setHoveredDepartment: (id) => set({ hoveredDepartmentId: id }),
    clearHoveredDepartment: (id) => {
      if (get().hoveredDepartmentId === id) set({ hoveredDepartmentId: null });
    },
    setCompact: (compact) => {
      if (get().compact !== compact) set({ compact });
    },
  }));
  return { ui, anchors: new Map(), elements: new Map(), positions: new Map() };
}

export const OverlayContext = createContext<SceneOverlayBus>(createOverlayBus());
export const useOverlayBus = (): SceneOverlayBus => useContext(OverlayContext);

export function useSceneUi<T>(selector: (s: SceneUiState) => T): T {
  const bus = useOverlayBus();
  return useStore(bus.ui, selector);
}

export const anchorKey = {
  room: (id: DepartmentId) => `room:${id}`,
  agent: (id: string) => `agent:${id}`,
  tip: (id: string) => `tip:${id}`,
  sign: 'sign',
} as const;

/** Ref callback đăng ký phần tử DOM của một nhãn theo khóa neo. */
export function useLabelElement(key: string): (el: HTMLElement | null) => void {
  const bus = useOverlayBus();
  return useCallback(
    (el: HTMLElement | null) => {
      if (el) bus.elements.set(key, el);
      else bus.elements.delete(key);
    },
    [bus, key],
  );
}

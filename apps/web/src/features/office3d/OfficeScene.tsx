import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { Boxes } from 'lucide-react';
import type { DepartmentId } from '@ads-nolimit/shared';
import { useOfficeStore } from '@/store/officeStore';
import { OfficeWorld } from './scene/OfficeWorld';
import { SceneContext, type SceneSettings } from './scene/SceneContext';
import { OverlayContext, createOverlayBus } from './scene/overlay';
import { useReducedMotion } from './useReducedMotion';
import { LabelLayer } from './LabelLayer';
import { MiniSyncBadge, SceneLegend, SceneToolbar } from './SceneToolbar';
import { DepartmentPanel } from './DepartmentPanel';

/**
 * CẢNH VĂN PHÒNG ẢO 3D – giao diện công khai (public API) dùng bởi trang Văn phòng 3D,
 * Tổng quan (thu nhỏ) và Trung tâm điều hành AI CEO (thu nhỏ).
 * Đọc dữ liệu từ useOfficeStore (nguồn duy nhất); không nhận dữ liệu qua props.
 *
 * - full: điều khiển camera (kéo/thu phóng/xoay giới hạn), thanh công cụ, chú giải, bảng phòng ban.
 * - mini: camera cố định, không điều khiển, nhãn rút gọn, dpr 1 – vẫn cập nhật trạng thái realtime.
 */
export interface OfficeSceneProps {
  /** full: tương tác đầy đủ; mini: chế độ thu nhỏ, camera cố định, không điều khiển. */
  mode?: 'full' | 'mini';
  className?: string;
  onSelectAgent?: (agentId: string) => void;
  onSelectDepartment?: (departmentId: DepartmentId) => void;
}

export function OfficeScene({ mode = 'full', className, onSelectAgent, onSelectDepartment }: OfficeSceneProps) {
  const { t } = useTranslation();
  const hydrated = useOfficeStore((s) => s.hydrated);
  const agentCount = useOfficeStore((s) => Object.keys(s.agents).length);
  const departmentCount = useOfficeStore((s) => s.departments.length);
  const selectDepartment = useOfficeStore((s) => s.selectDepartment);
  const focusCameraOnAgent = useOfficeStore((s) => s.focusCameraOnAgent);
  const reducedMotion = useReducedMotion();

  const [showLabels, setShowLabels] = useState(true);
  const [filterDepartmentId, setFilterDepartmentId] = useState<DepartmentId | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Bus nối phần 3D với lớp nhãn DOM – một bộ riêng cho mỗi cảnh.
  const bus = useMemo(createOverlayBus, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement && document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await containerRef.current?.requestFullscreen();
    } catch {
      /* Trình duyệt không hỗ trợ Fullscreen API – bỏ qua */
    }
  };

  const resetView = () => {
    focusCameraOnAgent(null);
    setFilterDepartmentId(null);
    setResetToken((n) => n + 1);
  };

  const settings = useMemo<SceneSettings>(
    () => ({ mode, showLabels, reducedMotion, filterDepartmentId, resetToken, onSelectAgent, onSelectDepartment }),
    [mode, showLabels, reducedMotion, filterDepartmentId, resetToken, onSelectAgent, onSelectDepartment],
  );

  const full = mode === 'full';

  return (
    <div
      ref={containerRef}
      data-office-scene={mode}
      className={clsx(
        '@container/scene relative isolate min-h-[240px] overflow-hidden rounded-2xl border border-line bg-bg-deep shadow-panel',
        full && 'neon-border-violet',
        className,
      )}
      style={{
        backgroundImage:
          'radial-gradient(900px 500px at 20% 0%, color-mix(in srgb, var(--color-brand-violet) 22%, transparent), transparent 60%), radial-gradient(700px 500px at 100% 100%, color-mix(in srgb, var(--color-brand-cyan) 14%, transparent), transparent 55%), linear-gradient(180deg, var(--color-bg-deep), var(--color-bg-base))',
      }}
    >
      <SceneContext.Provider value={settings}>
        <OverlayContext.Provider value={bus}>
          <SceneErrorBoundary
            fallback={
              <div role="alert" className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                <Boxes className="size-8 text-text-dim" aria-hidden="true" />
                <p className="text-sm font-semibold text-text">{t('office3d:scene.webgl.title')}</p>
                <p className="max-w-sm text-xs text-text-muted">{t('office3d:scene.webgl.explain')}</p>
              </div>
            }
          >
            <Canvas
              dpr={full ? [1, 1.5] : 1}
              flat
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              frameloop="always"
              aria-label={t('office3d:scene.ariaLabel', { agents: agentCount, departments: departmentCount })}
              onPointerMissed={() => {
                if (full) selectDepartment(null);
              }}
              className="!absolute inset-0"
            >
              <OfficeWorld />
            </Canvas>
            <LabelLayer />
          </SceneErrorBoundary>
        </OverlayContext.Provider>
      </SceneContext.Provider>

      {full ? (
        <>
          <SceneToolbar
            filterDepartmentId={filterDepartmentId}
            onFilterChange={(id) => {
              setFilterDepartmentId(id);
              if (id) focusCameraOnAgent(null);
              // Bỏ lọc → đưa camera về góc nhìn toàn cảnh.
              else setResetToken((n) => n + 1);
            }}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels((v) => !v)}
            onResetView={resetView}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => void toggleFullscreen()}
          />
          <SceneLegend />
          <DepartmentPanel />
        </>
      ) : (
        <MiniSyncBadge />
      )}

      {!hydrated ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-bg-deep/60 backdrop-blur-[2px]" aria-busy="true">
          <div className="glass flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-text">
            <span className="size-4 animate-spin rounded-full border-2 border-brand-cyan/40 border-t-brand-cyan" aria-hidden="true" />
            {t('office3d:scene.loading')}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Bắt lỗi WebGL/khởi tạo cảnh để không làm sập toàn trang. */
class SceneErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

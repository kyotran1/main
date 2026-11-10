import { useEffect, useLayoutEffect, useMemo, useRef, type ComponentRef } from 'react';
import { MapControls, OrthographicCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3, type OrthographicCamera as OrthographicCameraImpl } from 'three';
import { useOfficeStore } from '@/store/officeStore';
import { CAMERA_OFFSET, DEFAULT_TARGET, findRoom, roomCenter } from './layout';
import { useSceneSettings } from './SceneContext';
import { useOverlayBus } from './overlay';

type MapControlsRef = ComponentRef<typeof MapControls>;

/**
 * Camera isometric trực giao + điều khiển (kéo/thu phóng, xoay có giới hạn).
 * Ưu tiên mục tiêu: nhân sự đang được theo dõi (store.cameraFocusAgentId) → phòng ban đang lọc
 * → đặt lại góc nhìn. Chế độ mini: camera cố định, không điều khiển.
 */
export function CameraRig() {
  const settings = useSceneSettings();
  const bus = useOverlayBus();
  const size = useThree((s) => s.size);
  const focusAgentId = useOfficeStore((s) => s.cameraFocusAgentId);
  const focusCameraOnAgent = useOfficeStore((s) => s.focusCameraOnAgent);
  const departments = useOfficeStore((s) => s.departments);

  const camera = useRef<OrthographicCameraImpl>(null);
  const controls = useRef<MapControlsRef>(null);
  const fixedTarget = useMemo(() => new Vector3(...DEFAULT_TARGET), []);
  const desired = useMemo(() => new Vector3(), []);
  const offset = useMemo(() => new Vector3(), []);
  const resetting = useRef(false);
  const resetSeen = useRef(settings.resetToken);
  const mini = settings.mode === 'mini';

  // Mức thu phóng cơ sở: vừa toàn bộ mặt bằng trong khung nhìn.
  const baseZoom = useMemo(() => {
    const z = Math.min(size.width / (mini ? 37 : 40), size.height / (mini ? 32 : 34));
    return MathUtils.clamp(z, 6, 60);
  }, [size, mini]);

  // Nhãn có kích thước cố định theo pixel: khi mặt bằng bị thu nhỏ (< 16,5 px/m) thì chuyển
  // sang chế độ nhãn rút gọn để không chồng lên nhau.
  useEffect(() => {
    bus.ui.getState().setCompact(baseZoom < 16.5);
  }, [bus, baseZoom]);

  // Đặt vị trí ban đầu theo hướng isometric mặc định.
  useLayoutEffect(() => {
    const cam = camera.current;
    if (!cam) return;
    const target = controls.current?.target ?? fixedTarget;
    cam.position.set(target.x + CAMERA_OFFSET[0], target.y + CAMERA_OFFSET[1], target.z + CAMERA_OFFSET[2]);
    cam.lookAt(target);
    cam.zoom = baseZoom;
    cam.updateProjectionMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khung thay đổi kích thước → cập nhật thu phóng khi không theo dõi gì.
  useEffect(() => {
    const cam = camera.current;
    if (!cam) return;
    if (!focusAgentId && !settings.filterDepartmentId) {
      cam.zoom = baseZoom;
      cam.updateProjectionMatrix();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseZoom]);

  useFrame((_, delta) => {
    const cam = camera.current;
    if (!cam) return;
    const dt = Math.min(delta, 0.1);
    const ctl = controls.current;
    const target = ctl ? ctl.target : fixedTarget;

    if (settings.resetToken !== resetSeen.current) {
      resetSeen.current = settings.resetToken;
      resetting.current = true;
    }

    let hasGoal = false;
    let goalZoom = baseZoom;
    const lambda = settings.reducedMotion ? 16 : 4;

    const focusPos = !mini && focusAgentId ? bus.positions.get(focusAgentId) : undefined;
    if (focusPos) {
      desired.set(focusPos.x, 0.9, focusPos.z);
      goalZoom = baseZoom * 2.1;
      hasGoal = true;
      resetting.current = false;
    } else if (!mini && settings.filterDepartmentId) {
      const room = findRoom(departments, settings.filterDepartmentId);
      if (room) {
        const [cx, cz] = roomCenter(room);
        desired.set(cx, 0.5, cz);
        goalZoom = baseZoom * 1.55;
        hasGoal = true;
      }
    } else if (resetting.current) {
      desired.set(DEFAULT_TARGET[0], DEFAULT_TARGET[1], DEFAULT_TARGET[2]);
      goalZoom = baseZoom;
      hasGoal = true;
      if (target.distanceTo(desired) < 0.02 && Math.abs(cam.zoom - goalZoom) < 0.05) resetting.current = false;
    }

    if (!hasGoal) return;

    // Dịch mục tiêu và camera cùng một lượng để giữ hướng nhìn.
    const nx = MathUtils.damp(target.x, desired.x, lambda, dt);
    const ny = MathUtils.damp(target.y, desired.y, lambda, dt);
    const nz = MathUtils.damp(target.z, desired.z, lambda, dt);
    cam.position.x += nx - target.x;
    cam.position.y += ny - target.y;
    cam.position.z += nz - target.z;
    target.set(nx, ny, nz);

    if (resetting.current) {
      // Đưa góc nhìn về isometric mặc định.
      offset.copy(cam.position).sub(target);
      offset.x = MathUtils.damp(offset.x, CAMERA_OFFSET[0], lambda, dt);
      offset.y = MathUtils.damp(offset.y, CAMERA_OFFSET[1], lambda, dt);
      offset.z = MathUtils.damp(offset.z, CAMERA_OFFSET[2], lambda, dt);
      cam.position.copy(target).add(offset);
    }

    cam.zoom = MathUtils.damp(cam.zoom, goalZoom, lambda, dt);
    cam.updateProjectionMatrix();
    if (!ctl) cam.lookAt(target);
  });

  return (
    <>
      <OrthographicCamera ref={camera} makeDefault near={0.5} far={220} />
      {!mini ? (
        <MapControls
          ref={controls}
          makeDefault
          target={[DEFAULT_TARGET[0], DEFAULT_TARGET[1], DEFAULT_TARGET[2]]}
          enableDamping
          dampingFactor={0.09}
          screenSpacePanning={false}
          minZoom={baseZoom * 0.55}
          maxZoom={baseZoom * 4.5}
          minPolarAngle={0.45}
          maxPolarAngle={1.2}
          minAzimuthAngle={Math.PI / 4 - 0.9}
          maxAzimuthAngle={Math.PI / 4 + 0.9}
          onStart={() => {
            // Người dùng tự điều khiển → ngừng theo dõi nhân sự / ngừng đặt lại.
            resetting.current = false;
            if (useOfficeStore.getState().cameraFocusAgentId) focusCameraOnAgent(null);
          }}
        />
      ) : null}
    </>
  );
}

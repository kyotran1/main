import { useEffect, useLayoutEffect, useRef } from 'react';
import { useCursor } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { DoubleSide, MathUtils, type Group, type Mesh, type MeshBasicMaterial, type MeshStandardMaterial } from 'three';
import type { AgentStatus } from '@ads-nolimit/shared';
import { useOfficeStore } from '@/store/officeStore';
import { roleColor, statusColor, usePalette } from './palette';
import { agentInDepartmentScope, type Vec2 } from './layout';
import { useSceneSettings } from './SceneContext';
import { anchorKey, useOverlayBus, useSceneUi } from './overlay';
import { Desk } from './Furniture';

/**
 * Nhân sự AI trong văn phòng 3D. Mỗi hình chỉ đăng ký lát `agents[id]` của store nên
 * thay đổi của một nhân sự không làm các hình khác vẽ lại. Di chuyển, nhấp nhô, xoay,
 * nháy lỗi và độ mờ đều được nội suy trong useFrame (không setState).
 * Nhãn tên & bong bóng chi tiết nằm ở LabelLayer (DOM) và bám theo nhóm này qua overlay bus.
 */
export function AgentFigure({ agentId, target }: { agentId: string; target: Vec2 }) {
  const agent = useOfficeStore((s) => s.agents[agentId]);
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const focusCameraOnAgent = useOfficeStore((s) => s.focusCameraOnAgent);
  const settings = useSceneSettings();
  const bus = useOverlayBus();
  const hovered = useSceneUi((s) => s.hoveredAgentId === agentId);
  const p = usePalette();
  useCursor(hovered);

  const group = useRef<Group>(null);
  const body = useRef<Group>(null);
  const armL = useRef<Mesh>(null);
  const armR = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  const ringMat = useRef<MeshBasicMaterial>(null);
  const visorMat = useRef<MeshStandardMaterial>(null);

  // Tham chiếu "mới nhất" cho vòng lặp khung hình – không tạo lại hàm useFrame.
  const targetRef = useRef(target);
  targetRef.current = target;
  const status: AgentStatus = agent?.status ?? 'idle';
  const statusRef = useRef(status);
  statusRef.current = status;
  const dimmedRef = useRef(false);
  dimmedRef.current = agent ? !agentInDepartmentScope(agent, settings.filterDepartmentId) : false;
  const reducedRef = useRef(settings.reducedMotion);
  reducedRef.current = settings.reducedMotion;

  // Đặt vị trí ban đầu đúng mục tiêu để không "bay" từ gốc tọa độ.
  useLayoutEffect(() => {
    group.current?.position.set(target[0], 0, target[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đăng ký neo nhãn + vị trí để camera theo dõi.
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    bus.positions.set(agentId, g.position);
    bus.anchors.set(anchorKey.agent(agentId), { object: g, offsetY: 1.48 });
    bus.anchors.set(anchorKey.tip(agentId), { object: g, offsetY: 1.85 });
    return () => {
      bus.positions.delete(agentId);
      bus.anchors.delete(anchorKey.agent(agentId));
      bus.anchors.delete(anchorKey.tip(agentId));
      bus.ui.getState().clearHoveredAgent(agentId);
    };
  }, [agentId, bus]);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    const b = body.current;
    if (!g || !b) return;
    const dt = Math.min(delta, 0.1);
    const t = clock.elapsedTime;
    const reduced = reducedRef.current;
    const st = statusRef.current;
    const [tx, tz] = targetRef.current;

    // Di chuyển mượt tới mục tiêu.
    const lambda = reduced ? 14 : 3.4;
    const px = g.position.x;
    const pz = g.position.z;
    g.position.x = MathUtils.damp(px, tx, lambda, dt);
    g.position.z = MathUtils.damp(pz, tz, lambda, dt);
    const vx = g.position.x - px;
    const vz = g.position.z - pz;
    const moving = Math.hypot(vx, vz) > 0.0025;

    // Hướng mặt: theo hướng đi; đang chờ → xoay chậm; còn lại quay về phía người xem.
    if (moving) {
      g.rotation.y = Math.atan2(vx, vz);
    } else if (st === 'waiting' && !reduced) {
      g.rotation.y += dt * 0.7;
    } else {
      g.rotation.y = MathUtils.damp(g.rotation.y % (Math.PI * 2), 0, 5, dt);
    }

    // Nhấp nhô khi đang thực hiện / đi lại; "gõ phím" bằng hai tay.
    const running = st === 'running';
    const bobTarget = !reduced && (running || moving) ? Math.abs(Math.sin(t * (moving ? 9 : 7))) * 0.05 : 0;
    b.position.y = MathUtils.damp(b.position.y, bobTarget, 10, dt);
    if (armL.current && armR.current) {
      if (moving && !reduced) {
        armL.current.rotation.x = Math.sin(t * 9) * 0.5;
        armR.current.rotation.x = -Math.sin(t * 9) * 0.5;
      } else {
        const armBase = running ? -1.05 : -0.15;
        const wiggle = running && !reduced ? 0.18 : 0;
        armL.current.rotation.x = MathUtils.damp(armL.current.rotation.x, armBase + Math.sin(t * 14) * wiggle, 10, dt);
        armR.current.rotation.x = MathUtils.damp(armR.current.rotation.x, armBase + Math.cos(t * 14) * wiggle, 10, dt);
      }
    }
    // Hơi thở nhẹ khi đứng yên.
    const breathe = reduced ? 1 : 1 + Math.sin(t * 2 + g.position.x) * 0.012;
    b.scale.set(breathe, 1, breathe);

    // Vòng trạng thái: đập nhịp khi hoạt động, nháy khi lỗi, mờ khi ngoài bộ lọc.
    if (ring.current && ringMat.current) {
      const pulse = !reduced && (st === 'running' || st === 'active') ? 1 + Math.sin(t * 3) * 0.08 : 1;
      ring.current.scale.setScalar(pulse);
      const base = st === 'error' && !reduced ? 0.35 + Math.abs(Math.sin(t * 6)) * 0.65 : 0.95;
      ringMat.current.opacity = dimmedRef.current ? base * 0.3 : base;
    }
    if (visorMat.current) {
      visorMat.current.emissiveIntensity = st === 'error' && !reduced ? 0.4 + Math.abs(Math.sin(t * 6)) * 1.2 : running ? 0.9 : 0.5;
    }

    // Độ mờ: tạm dừng → 45 %, ngoài bộ lọc phòng ban → 22 %.
    const alpha = st === 'paused' ? 0.45 : dimmedRef.current ? 0.22 : 1;
    b.traverse((o) => {
      const mat = (o as Mesh).material as MeshStandardMaterial | undefined;
      if (mat && typeof mat.opacity === 'number') mat.opacity = MathUtils.damp(mat.opacity, alpha, 8, dt);
    });
  });

  if (!agent) return null;

  const sColor = statusColor(status);
  const rColor = roleColor(agent.role);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectAgent(agentId);
    focusCameraOnAgent(agentId);
    settings.onSelectAgent?.(agentId);
  };

  return (
    <>
      <Desk position={[agent.desk.x, 0, agent.desk.z]} screenOn={status === 'running'} screenColor={sColor} />
      <group
        ref={group}
        onPointerOver={(e) => {
          e.stopPropagation();
          bus.ui.getState().setHoveredAgent(agentId);
        }}
        onPointerOut={() => bus.ui.getState().clearHoveredAgent(agentId)}
        onClick={onClick}
      >
        {/* Bóng đổ phẳng */}
        <mesh rotation-x={-Math.PI / 2} position-y={0.015}>
          <circleGeometry args={[0.44, 20]} />
          <meshBasicMaterial color={p.base} transparent opacity={0.45} />
        </mesh>
        {/* Vòng sáng trạng thái */}
        <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.032}>
          <ringGeometry args={[0.36, 0.47, 32]} />
          <meshBasicMaterial ref={ringMat} color={sColor} toneMapped={false} transparent opacity={0.95} side={DoubleSide} />
        </mesh>

        <group ref={body}>
          {/* Thân */}
          <mesh position-y={0.62}>
            <capsuleGeometry args={[0.23, 0.46, 6, 12]} />
            <meshStandardMaterial color={rColor} emissive={rColor} emissiveIntensity={0.22} roughness={0.55} transparent />
          </mesh>
          {/* Cổ áo */}
          <mesh position-y={0.95}>
            <cylinderGeometry args={[0.14, 0.25, 0.1, 12]} />
            <meshStandardMaterial color={p.base} roughness={0.8} transparent />
          </mesh>
          {/* Đầu */}
          <mesh position-y={1.18}>
            <sphereGeometry args={[0.2, 16, 12]} />
            <meshStandardMaterial color={p.text} roughness={0.6} transparent />
          </mesh>
          {/* Kính hiển thị – sáng theo trạng thái */}
          <mesh position={[0, 1.2, 0.16]}>
            <boxGeometry args={[0.27, 0.08, 0.09]} />
            <meshStandardMaterial ref={visorMat} color={p.base} emissive={sColor} emissiveIntensity={0.5} roughness={0.3} transparent />
          </mesh>
          {/* Hai tay */}
          <mesh ref={armL} position={[-0.29, 0.72, 0]}>
            <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
            <meshStandardMaterial color={rColor} roughness={0.6} transparent />
          </mesh>
          <mesh ref={armR} position={[0.29, 0.72, 0]}>
            <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
            <meshStandardMaterial color={rColor} roughness={0.6} transparent />
          </mesh>
        </group>
      </group>
    </>
  );
}

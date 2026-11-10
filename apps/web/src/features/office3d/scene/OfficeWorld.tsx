import { Grid } from '@react-three/drei';
import { useOfficeStore } from '@/store/officeStore';
import { useDerived } from '@/store/hooks';
import { NO_RAYCAST, usePalette } from './palette';
import { HALL_CENTER, PLAN, computeTargets } from './layout';
import { Room } from './Room';
import { AgentFigure } from './AgentFigure';
import { Hologram } from './Hologram';
import { CameraRig } from './CameraRig';
import { LabelProjector } from './LabelProjector';
import { Plant } from './Furniture';

/**
 * Gốc của cảnh trong Canvas: ánh sáng, sàn chung, phòng ban (từ store.departments),
 * nhân sự (từ store.agents), hologram trung tâm, camera và bộ chiếu nhãn.
 */
export function OfficeWorld() {
  const departments = useOfficeStore((s) => s.departments);
  const p = usePalette();
  return (
    <>
      <ambientLight intensity={0.65} color={p.text} />
      <hemisphereLight args={[p.violet, p.base, 0.6]} />
      <directionalLight position={[12, 22, 10]} intensity={1.2} color={p.text} />
      <directionalLight position={[-16, 10, -8]} intensity={0.35} color={p.cyan} />

      <Floor />
      {departments.map((d) => (
        <Room key={d.id} department={d} />
      ))}
      <HallDecor />
      <AgentsLayer />
      <Hologram />
      <CameraRig />
      <LabelProjector />
    </>
  );
}

/** Sàn chung + lưới kỹ thuật + hai dải hành lang phát sáng nhẹ. */
function Floor() {
  const p = usePalette();
  const cx = PLAN.x + PLAN.width / 2;
  const cz = PLAN.z + PLAN.depth / 2;
  return (
    <group>
      <mesh position={[cx, -0.1, cz]} raycast={NO_RAYCAST}>
        <boxGeometry args={[PLAN.width, 0.2, PLAN.depth]} />
        <meshStandardMaterial color={p.floor} roughness={0.95} metalness={0.05} />
      </mesh>
      <Grid
        position={[cx, 0.004, cz]}
        args={[PLAN.width, PLAN.depth]}
        cellSize={1}
        cellThickness={0.6}
        cellColor={p.panel}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={p.furnitureLight}
        fadeDistance={120}
        fadeStrength={0}
        infiniteGrid={false}
        raycast={NO_RAYCAST}
      />
      {/* Hành lang trung tâm: trục dọc từ sảnh tới Ban điều hành và trục ngang qua hologram */}
      <mesh position={[HALL_CENTER[0], 0.01, 2.5]} raycast={NO_RAYCAST}>
        <boxGeometry args={[2.0, 0.02, 13.6]} />
        <meshBasicMaterial color={p.violet} transparent opacity={0.12} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[HALL_CENTER[0], 0.01, HALL_CENTER[2]]} raycast={NO_RAYCAST}>
        <boxGeometry args={[10.6, 0.02, 2.0]} />
        <meshBasicMaterial color={p.cyan} transparent opacity={0.08} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Cây cảnh quanh sảnh trung tâm. */
function HallDecor() {
  return (
    <group>
      <Plant position={[-4.6, 0, -3.6]} />
      <Plant position={[4.6, 0, -3.6]} scale={0.9} />
      <Plant position={[-4.6, 0, 8.4]} scale={0.9} />
      <Plant position={[4.6, 0, 8.4]} />
    </group>
  );
}

/** Lớp nhân sự: mỗi nhân sự tự đăng ký lát dữ liệu của mình; ở đây chỉ chia chỗ đứng. */
function AgentsLayer() {
  const ids = useDerived((s) => Object.keys(s.agents).sort().join('|'));
  const targets = useDerived((s) => computeTargets(Object.values(s.agents), s.departments));
  const agents = useOfficeStore((s) => s.agents);
  return (
    <>
      {ids
        .split('|')
        .filter(Boolean)
        .map((id) => {
          const a = agents[id];
          const target = targets[id] ?? (a ? ([a.desk.x, a.desk.z] as const) : ([0, 0] as const));
          return <AgentFigure key={id} agentId={id} target={target} />;
        })}
    </>
  );
}

import { useCursor } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { Department } from '@ads-nolimit/shared';
import { useOfficeStore } from '@/store/officeStore';
import { NO_RAYCAST, usePalette } from './palette';
import { WALL_HEIGHT, roomCenter } from './layout';
import { useSceneSettings } from './SceneContext';
import { useOverlayBus, useSceneUi } from './overlay';
import { MeetingRoomFurniture, OfficeRoomFurniture, PantryFurniture, ReceptionFurniture } from './Furniture';

/**
 * Một phòng trong văn phòng: sàn (bắt hover/click), tường kính, nẹp neon màu accent và nội thất.
 * Bảng tên song ngữ nằm ở lớp nhãn DOM (LabelLayer) và bám theo tâm phòng.
 */
export function Room({ department }: { department: Department }) {
  const { bounds, accent } = department;
  const [cx, cz] = roomCenter(department);
  const w = bounds.width;
  const d = bounds.depth;
  const p = usePalette();
  const settings = useSceneSettings();
  const bus = useOverlayBus();
  const hovered = useSceneUi((s) => s.hoveredDepartmentId === department.id);
  const selected = useOfficeStore((s) => s.selectedDepartmentId === department.id);
  const selectDepartment = useOfficeStore((s) => s.selectDepartment);
  useCursor(hovered);

  const dimmed = settings.filterDepartmentId !== null && settings.filterDepartmentId !== department.id;
  const lit = !dimmed && (hovered || selected || settings.filterDepartmentId === department.id);
  const wallOpacity = dimmed ? 0.04 : lit ? 0.2 : 0.09;
  const neonOpacity = dimmed ? 0.22 : lit ? 1 : 0.78;

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectDepartment(department.id);
    settings.onSelectDepartment?.(department.id);
  };

  return (
    <group position={[cx, 0, cz]}>
      {/* Sàn phòng – vùng bắt sự kiện chuột */}
      <mesh
        position-y={0.06}
        onPointerOver={(e) => {
          e.stopPropagation();
          bus.ui.getState().setHoveredDepartment(department.id);
        }}
        onPointerOut={() => bus.ui.getState().clearHoveredDepartment(department.id)}
        onClick={onClick}
      >
        <boxGeometry args={[w, 0.12, d]} />
        <meshStandardMaterial color={p.roomFloor} emissive={accent} emissiveIntensity={lit ? 0.22 : 0.07} roughness={0.9} />
      </mesh>

      {/* Tường kính trong suốt */}
      {(
        [
          [[0, WALL_HEIGHT / 2, -d / 2], [w, WALL_HEIGHT, 0.05]],
          [[0, WALL_HEIGHT / 2, d / 2], [w, WALL_HEIGHT, 0.05]],
          [[-w / 2, WALL_HEIGHT / 2, 0], [0.05, WALL_HEIGHT, d]],
          [[w / 2, WALL_HEIGHT / 2, 0], [0.05, WALL_HEIGHT, d]],
        ] as const
      ).map(([pos, size], i) => (
        <mesh key={i} position={[pos[0], pos[1], pos[2]]} raycast={NO_RAYCAST}>
          <boxGeometry args={[size[0], size[1], size[2]]} />
          <meshStandardMaterial color={accent} transparent opacity={wallOpacity} depthWrite={false} roughness={0.15} metalness={0.2} />
        </mesh>
      ))}

      {/* Nẹp neon đỉnh tường + viền chân tường */}
      {(
        [
          [[0, WALL_HEIGHT, -d / 2], [w + 0.06, 0.06, 0.06]],
          [[0, WALL_HEIGHT, d / 2], [w + 0.06, 0.06, 0.06]],
          [[-w / 2, WALL_HEIGHT, 0], [0.06, 0.06, d + 0.06]],
          [[w / 2, WALL_HEIGHT, 0], [0.06, 0.06, d + 0.06]],
          [[0, 0.13, -d / 2 + 0.06], [w, 0.02, 0.1]],
          [[0, 0.13, d / 2 - 0.06], [w, 0.02, 0.1]],
          [[-w / 2 + 0.06, 0.13, 0], [0.1, 0.02, d]],
          [[w / 2 - 0.06, 0.13, 0], [0.1, 0.02, d]],
        ] as const
      ).map(([pos, size], i) => (
        <mesh key={i} position={[pos[0], pos[1], pos[2]]} raycast={NO_RAYCAST}>
          <boxGeometry args={[size[0], size[1], size[2]]} />
          <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={i < 4 ? neonOpacity : neonOpacity * 0.55} />
        </mesh>
      ))}

      <RoomFurniture room={department} />
    </group>
  );
}

function RoomFurniture({ room }: { room: Department }) {
  switch (room.id) {
    case 'meeting_room':
      return <MeetingRoomFurniture room={room} />;
    case 'reception':
      return <ReceptionFurniture room={room} />;
    case 'pantry':
      return <PantryFurniture room={room} />;
    default:
      return <OfficeRoomFurniture room={room} />;
  }
}

import type { Department } from '@ads-nolimit/shared';
import { NO_RAYCAST, usePalette } from './palette';
import { WALL_HEIGHT, roomCenter } from './layout';

/**
 * Nội thất dựng thủ công bằng hình học cơ bản (không tải tài nguyên mạng).
 * Tất cả mesh trang trí bỏ qua raycast; chỉ sàn phòng và nhân sự bắt sự kiện chuột.
 */

type Vec3 = [number, number, number];

/** Ghế xoay đơn giản: đế, trụ, mặt ngồi, tựa lưng. */
export function Chair({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  const p = usePalette();
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position-y={0.02} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.24, 0.24, 0.04, 10]} />
        <meshStandardMaterial color={p.furniture} roughness={0.7} />
      </mesh>
      <mesh position-y={0.22} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.035, 0.035, 0.4, 6]} />
        <meshStandardMaterial color={p.furnitureLight} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position-y={0.46} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.48, 0.07, 0.46]} />
        <meshStandardMaterial color={p.furnitureLight} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.74, -0.21]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.46, 0.5, 0.06]} />
        <meshStandardMaterial color={p.furnitureLight} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Bàn làm việc + màn hình (sáng theo trạng thái nhân sự) + ghế phía sau. */
export function Desk({ position, screenOn, screenColor }: { position: Vec3; screenOn: boolean; screenColor: string }) {
  const p = usePalette();
  return (
    <group position={position}>
      <mesh position-y={0.74} raycast={NO_RAYCAST}>
        <boxGeometry args={[1.5, 0.07, 0.72]} />
        <meshStandardMaterial color={p.furnitureLight} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.5, 0.36, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.44, 0.7, 0.6]} />
        <meshStandardMaterial color={p.furniture} roughness={0.8} />
      </mesh>
      <mesh position={[-0.62, 0.36, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.06, 0.7, 0.6]} />
        <meshStandardMaterial color={p.furniture} roughness={0.8} />
      </mesh>
      {/* Chân đế + màn hình – quay về phía người xem */}
      <mesh position={[0, 0.84, 0.08]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.1, 0.14, 0.08]} />
        <meshStandardMaterial color={p.furniture} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.08, 0.08]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.74, 0.44, 0.04]} />
        <meshStandardMaterial
          color={screenOn ? screenColor : p.furniture}
          emissive={screenOn ? screenColor : p.violet}
          emissiveIntensity={screenOn ? 0.9 : 0.12}
          roughness={0.3}
        />
      </mesh>
      {/* Bàn phím */}
      <mesh position={[0, 0.79, -0.2]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.5, 0.03, 0.16]} />
        <meshStandardMaterial color={p.base} roughness={0.9} />
      </mesh>
      <Chair position={[0, 0, -1.0]} />
    </group>
  );
}

/** Cây cảnh: chậu + ba khối lá. */
export function Plant({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  const p = usePalette();
  return (
    <group position={position} scale={scale}>
      <mesh position-y={0.2} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.22, 0.17, 0.4, 10]} />
        <meshStandardMaterial color={p.furnitureLight} roughness={0.9} />
      </mesh>
      <mesh position-y={0.68} raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.32, 10, 8]} />
        <meshStandardMaterial color={p.emerald} roughness={0.85} />
      </mesh>
      <mesh position={[0.18, 0.9, 0.06]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.24, 10, 8]} />
        <meshStandardMaterial color={p.green} roughness={0.85} />
      </mesh>
      <mesh position={[-0.17, 0.86, -0.1]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color={p.emerald} roughness={0.85} />
      </mesh>
    </group>
  );
}

/** Phòng họp: bàn dài, sáu ghế, màn hình tường. */
export function MeetingRoomFurniture({ room }: { room: Department }) {
  const p = usePalette();
  const [cx, cz] = roomCenter(room);
  const w = room.bounds.width;
  return (
    <group position={[cx, 0, cz]}>
      <mesh position-y={0.74} raycast={NO_RAYCAST}>
        <boxGeometry args={[3.2, 0.08, 1.4]} />
        <meshStandardMaterial color={p.furnitureLight} roughness={0.5} metalness={0.15} />
      </mesh>
      {[-1.0, 1.0].map((x) => (
        <mesh key={x} position={[x, 0.36, 0]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.5, 0.7, 0.7]} />
          <meshStandardMaterial color={p.furniture} roughness={0.8} />
        </mesh>
      ))}
      {[-1.05, 0, 1.05].map((x) => (
        <Chair key={`n${x}`} position={[x, 0, -1.15]} rotationY={0} />
      ))}
      {[-1.05, 0, 1.05].map((x) => (
        <Chair key={`s${x}`} position={[x, 0, 1.15]} rotationY={Math.PI} />
      ))}
      {/* Màn hình tường phía Tây */}
      <mesh position={[-w / 2 + 0.12, 1.15, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.06, 1.0, 2.0]} />
        <meshStandardMaterial color={p.base} emissive={p.violet} emissiveIntensity={0.45} roughness={0.3} />
      </mesh>
      <Plant position={[w / 2 - 0.7, 0, -room.bounds.depth / 2 + 0.7]} scale={0.9} />
    </group>
  );
}

/** Sảnh chính: quầy lễ tân cong nhẹ với nẹp neon, cây cảnh hai bên. */
export function ReceptionFurniture({ room }: { room: Department }) {
  const p = usePalette();
  const [cx, cz] = roomCenter(room);
  return (
    <group position={[cx, 0, cz]}>
      <mesh position={[0, 0.48, 0.3]} raycast={NO_RAYCAST}>
        <boxGeometry args={[2.8, 0.96, 0.76]} />
        <meshStandardMaterial color={p.furniture} roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.99, 0.3]} raycast={NO_RAYCAST}>
        <boxGeometry args={[2.95, 0.06, 0.9]} />
        <meshStandardMaterial color={p.furnitureLight} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.5, 0.69]} raycast={NO_RAYCAST}>
        <boxGeometry args={[2.6, 0.05, 0.04]} />
        <meshBasicMaterial color={room.accent} toneMapped={false} />
      </mesh>
      {/* Màn hình chào đón nhỏ trên quầy */}
      <mesh position={[0.9, 1.22, 0.2]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.46, 0.32, 0.04]} />
        <meshStandardMaterial color={p.base} emissive={p.cyan} emissiveIntensity={0.7} roughness={0.3} />
      </mesh>
      <Plant position={[-room.bounds.width / 2 + 0.6, 0, -room.bounds.depth / 2 + 0.6]} />
      <Plant position={[room.bounds.width / 2 - 0.6, 0, -room.bounds.depth / 2 + 0.6]} scale={0.85} />
    </group>
  );
}

/** Khu giải trí & Pantry: bàn tròn, bốn ghế đẩu, quầy bếp với máy pha cà phê. */
export function PantryFurniture({ room }: { room: Department }) {
  const p = usePalette();
  const [cx, cz] = roomCenter(room);
  const w = room.bounds.width;
  const d = room.bounds.depth;
  return (
    <group position={[cx, 0, cz]}>
      <mesh position={[0, 0.76, 0.3]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.72, 0.72, 0.06, 24]} />
        <meshStandardMaterial color={p.furnitureLight} roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.38, 0.3]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.06, 0.06, 0.72, 8]} />
        <meshStandardMaterial color={p.furniture} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0.3]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.36, 0.36, 0.04, 16]} />
        <meshStandardMaterial color={p.furniture} roughness={0.7} />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.15, 0.24, 0.3 + Math.sin(a) * 1.15]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.2, 0.18, 0.48, 10]} />
            <meshStandardMaterial color={p.furniture} roughness={0.8} />
          </mesh>
        );
      })}
      {/* Quầy bếp sát tường Bắc */}
      <mesh position={[0, 0.45, -d / 2 + 0.42]} raycast={NO_RAYCAST}>
        <boxGeometry args={[w - 1.2, 0.9, 0.6]} />
        <meshStandardMaterial color={p.furniture} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.93, -d / 2 + 0.42]} raycast={NO_RAYCAST}>
        <boxGeometry args={[w - 1.1, 0.06, 0.66]} />
        <meshStandardMaterial color={p.furnitureLight} roughness={0.4} />
      </mesh>
      <mesh position={[w / 2 - 1.2, 1.17, -d / 2 + 0.42]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.36, 0.42, 0.34]} />
        <meshStandardMaterial color={p.base} emissive={p.amber} emissiveIntensity={0.5} roughness={0.4} />
      </mesh>
      <Plant position={[-w / 2 + 0.6, 0, d / 2 - 0.6]} scale={0.9} />
    </group>
  );
}

/** Nội thất mặc định cho phòng ban có nhân sự: cây cảnh ở góc xa hành lang + tủ hồ sơ. */
export function OfficeRoomFurniture({ room }: { room: Department }) {
  const p = usePalette();
  const [cx, cz] = roomCenter(room);
  const w = room.bounds.width;
  const d = room.bounds.depth;
  // Góc xa hành lang: phòng bên trái đặt ở Tây, bên phải đặt ở Đông, phòng giữa đặt ở Bắc.
  const sideX = cx < -4 ? -w / 2 + 0.6 : cx > 4 ? w / 2 - 0.6 : -w / 2 + 0.6;
  return (
    <group position={[cx, 0, cz]}>
      <Plant position={[sideX, 0, -d / 2 + 0.6]} scale={0.95} />
      <mesh position={[sideX, 0.55, d / 2 - 0.5]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.9, 1.1, 0.45]} />
        <meshStandardMaterial color={p.furniture} roughness={0.8} />
      </mesh>
      {/* Bảng trắng/analytics trên tường Bắc */}
      <mesh position={[cx < 4 && cx > -4 ? 0 : -sideX * 0.35, 1.2, -d / 2 + 0.09]} raycast={NO_RAYCAST}>
        <boxGeometry args={[1.8, 0.9, 0.05]} />
        <meshStandardMaterial color={p.base} emissive={room.accent} emissiveIntensity={0.3} roughness={0.35} />
      </mesh>
      <group position={[0, WALL_HEIGHT, 0]} />
    </group>
  );
}

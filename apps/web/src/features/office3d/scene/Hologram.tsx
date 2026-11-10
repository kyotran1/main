import { useRef } from 'react';
import { Float, Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Group } from 'three';
import { NO_RAYCAST, usePalette } from './palette';
import { HALL_CENTER } from './layout';
import { useSceneSettings } from './SceneContext';

/**
 * Khu trung tâm: sàn tròn phát sáng + hologram chữ "A" (logo) xoay chậm.
 * Chữ A được dựng từ ba khối hộp để không cần tải font/mô hình từ mạng.
 */
export function Hologram() {
  const p = usePalette();
  const settings = useSceneSettings();
  const spin = useRef<Group>(null);
  const reduced = settings.reducedMotion;

  useFrame((_, delta) => {
    if (spin.current && !reduced) spin.current.rotation.y += Math.min(delta, 0.1) * 0.55;
  });

  const legs = (color: string, opacity: number, scale: number) => (
    <group scale={scale}>
      <mesh position={[-0.36, 0, 0]} rotation-z={0.3} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.2, 1.7, 0.2]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0.36, 0, 0]} rotation-z={-0.3} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.2, 1.7, 0.2]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.3, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.62, 0.16, 0.2]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );

  return (
    <group position={[HALL_CENTER[0], 0, HALL_CENTER[2]]}>
      {/* Bệ tròn + hai vòng neon */}
      <mesh position-y={0.06} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[2.1, 2.3, 0.12, 48]} />
        <meshStandardMaterial color={p.furniture} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position-y={0.13} rotation-x={-Math.PI / 2} raycast={NO_RAYCAST}>
        <ringGeometry args={[1.95, 2.1, 64]} />
        <meshBasicMaterial color={p.cyan} toneMapped={false} side={DoubleSide} />
      </mesh>
      <mesh position-y={0.13} rotation-x={-Math.PI / 2} raycast={NO_RAYCAST}>
        <ringGeometry args={[1.1, 1.2, 48]} />
        <meshBasicMaterial color={p.violet} toneMapped={false} transparent opacity={0.9} side={DoubleSide} />
      </mesh>
      {/* Cột sáng hologram */}
      <mesh position-y={1.0} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.95, 1.15, 1.9, 32, 1, true]} />
        <meshBasicMaterial color={p.cyan} transparent opacity={0.07} side={DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.6, 0]} color={p.cyan} intensity={reduced ? 1.2 : 1.8} distance={9} decay={1.6} />

      <Float speed={1.4} floatIntensity={0.35} rotationIntensity={0} enabled={!reduced}>
        <group ref={spin} position-y={1.95}>
          {legs(p.cyan, 0.92, 1.25)}
          {legs(p.violet, 0.22, 1.45)}
        </group>
      </Float>

      {!reduced && settings.mode === 'full' ? (
        <Sparkles count={28} scale={[3.2, 2.4, 3.2]} position-y={1.4} size={2.2} speed={0.35} opacity={0.6} color={p.cyan} />
      ) : null}
    </group>
  );
}

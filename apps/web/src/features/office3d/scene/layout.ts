import type { Agent, Department, DepartmentId } from '@ads-nolimit/shared';

/**
 * Hình học mặt bằng – suy ra từ `departments[].bounds` và `agents[].desk` do backend phát hành.
 * Không có tọa độ phòng ban nào được viết cứng ở đây ngoài các hằng số hiển thị.
 */

export const WALL_HEIGHT = 1.7;
/** Sàn chung bao toàn bộ mặt bằng 28 × 25 của backend, thêm lề. */
export const PLAN = { x: -15, z: -11, width: 30, depth: 26.5 } as const;
/** Tâm sảnh trung tâm (hologram) và mục tiêu camera mặc định. */
export const HALL_CENTER: readonly [number, number, number] = [0, 0, 2.5];
/** Hơi nâng mục tiêu để toàn cảnh dịch xuống, chừa chỗ cho thanh công cụ phía trên. */
export const DEFAULT_TARGET: readonly [number, number, number] = [0, 1.0, 2.0];
/**
 * Hướng nhìn isometric, góc nâng ≈ 50°: đủ cao để các hàng phòng cách nhau ~60px trên màn hình
 * (bảng tên phòng + nhãn nhân sự không chồng nhau) mà vẫn thấy tường kính và nội thất.
 */
export const CAMERA_OFFSET: readonly [number, number, number] = [20, 34, 20];

export type Vec2 = readonly [number, number];

export const roomCenter = (d: Department): Vec2 => [d.bounds.x + d.bounds.width / 2, d.bounds.z + d.bounds.depth / 2];

export const findRoom = (departments: Department[], id: DepartmentId): Department | undefined =>
  departments.find((d) => d.id === id);

/** Nhân sự đang có mặt trong phòng (họp, kiểm định, nghỉ) dù không thuộc biên chế phòng đó. */
export function agentPresentIn(agent: Agent, departmentId: DepartmentId): boolean {
  const l = agent.location;
  if (l.kind === 'department') return l.departmentId === departmentId;
  return l.kind === departmentId;
}

/** Nhân sự thuộc phòng hoặc đang có mặt trong phòng – dùng cho bộ lọc phòng ban. */
export function agentInDepartmentScope(agent: Agent, departmentId: DepartmentId | null): boolean {
  if (departmentId === null) return true;
  return agent.departmentId === departmentId || agentPresentIn(agent, departmentId);
}

/** Khóa nhóm vị trí – nhân sự cùng khóa chia nhau các chỗ đứng để không chồng lên nhau. */
export function locationKey(agent: Agent): string {
  const l = agent.location;
  if (l.kind === 'desk') return `desk:${agent.id}`;
  if (l.kind === 'department') return `department:${l.departmentId}`;
  return l.kind;
}

/** Chỗ đứng quanh bàn (ellipse) theo chỉ số. */
function around(center: Vec2, rx: number, rz: number, slot: number, total = 6): Vec2 {
  const a = (slot / Math.max(total, 1)) * Math.PI * 2 + Math.PI / 2;
  return [center[0] + Math.cos(a) * rx, center[1] + Math.sin(a) * rz];
}

/** Vị trí mục tiêu [x, z] của nhân sự theo `location` do backend quyết định. */
export function targetFor(agent: Agent, departments: Department[], slot: number): Vec2 {
  const l = agent.location;
  const atDesk: Vec2 = [agent.desk.x, agent.desk.z - 0.78];
  switch (l.kind) {
    case 'desk':
      return atDesk;
    case 'meeting_room': {
      const room = findRoom(departments, 'meeting_room');
      return room ? around(roomCenter(room), 2.1, 1.3, slot) : atDesk;
    }
    case 'pantry': {
      const room = findRoom(departments, 'pantry');
      return room ? around(roomCenter(room), 1.25, 1.25, slot, 4) : atDesk;
    }
    case 'reception': {
      const room = findRoom(departments, 'reception');
      if (!room) return atDesk;
      const [cx, cz] = roomCenter(room);
      return [cx - 0.8 + slot * 0.9, cz - 1.5];
    }
    case 'department': {
      const room = findRoom(departments, l.departmentId);
      if (!room) return atDesk;
      const [cx, cz] = roomCenter(room);
      // Đứng ở phía giáp hành lang trung tâm, lệch dần theo slot.
      if (Math.abs(cx) > 4) {
        const x = cx < 0 ? room.bounds.x + room.bounds.width - 1.5 : room.bounds.x + 1.5;
        return [x, cz + (slot - 0.5) * 1.1];
      }
      return [cx + (slot - 0.5) * 1.2, room.bounds.z + room.bounds.depth - 1.2];
    }
    default:
      return atDesk;
  }
}

/** Tính vị trí mục tiêu cho toàn bộ nhân sự (chia chỗ đứng cho người cùng địa điểm). */
export function computeTargets(agents: Agent[], departments: Department[]): Record<string, Vec2> {
  const groups = new Map<string, Agent[]>();
  for (const a of [...agents].sort((x, y) => x.id.localeCompare(y.id))) {
    const key = locationKey(a);
    const list = groups.get(key) ?? [];
    list.push(a);
    groups.set(key, list);
  }
  const out: Record<string, Vec2> = {};
  for (const list of groups.values()) {
    list.forEach((a, i) => {
      out[a.id] = targetFor(a, departments, i);
    });
  }
  return out;
}

import { beforeEach, describe, expect, it } from 'vitest';
import type {
  ActivityEvent,
  Agent,
  Approval,
  ChatMessage,
  KpiSummary,
  OfficeSnapshot,
  Project,
  Task,
} from '@ads-nolimit/shared';
import { useOfficeStore } from './officeStore';

/**
 * Kiểm thử store duy nhất phía giao diện: hydrate từ snapshot và áp dụng sự kiện realtime.
 * Dữ liệu mẫu dựng tay (nhỏ) theo kiểu @ads-nolimit/shared – không phụ thuộc backend.
 */

const T0 = '2026-11-10T00:00:00.000Z';

function makeAgent(id: string, patch: Partial<Agent> = {}): Agent {
  return {
    id,
    role: 'ai_specialist',
    departmentId: 'marketing',
    status: 'active',
    performance: 90,
    skills: [],
    connectorIds: [],
    model: { mode: 'local', provider: 'mock', model: 'mock' },
    location: { kind: 'desk' },
    desk: { x: 0, y: 0, z: 0 },
    avatarSeed: id,
    tasksCompleted: 0,
    createdAt: T0,
    updatedAt: T0,
    ...patch,
  };
}

function makeTask(id: string, patch: Partial<Task> = {}): Task {
  return {
    id,
    title: `Công việc ${id}`,
    status: 'in_progress',
    stage: 'execute',
    priority: 'medium',
    departmentId: 'marketing',
    progress: 10,
    createdAt: T0,
    updatedAt: T0,
    tags: [],
    ...patch,
  };
}

function makeApproval(id: string, patch: Partial<Approval> = {}): Approval {
  return { id, type: 'plan', title: `Phê duyệt ${id}`, requestedBy: 'agent_ceo', status: 'pending', createdAt: T0, ...patch };
}

function makeActivity(id: string, createdAt = T0): ActivityEvent {
  return { id, kind: 'system', templateKey: 'system', params: {}, createdAt };
}

function makeProject(id: string, patch: Partial<Project> = {}): Project {
  return { id, name: `Dự án ${id}`, status: 'active', ownerAgentId: 'agent_ceo', departmentIds: ['marketing'], progress: 0, startAt: T0, ...patch };
}

function makeMessage(id: string, createdAt = T0, patch: Partial<ChatMessage> = {}): ChatMessage {
  return { id, agentId: 'agent_ceo', from: 'owner', text: `Tin nhắn ${id}`, createdAt, ...patch };
}

const KPIS: KpiSummary = {
  leadsGrowthPct: 10,
  conversionGrowthPct: 5,
  costPerLeadChangePct: -3,
  roi: 3.2,
  period: 'this_month',
  series: [{ label: 'W1', reach: 100, leads: 10, conversionRate: 2 }],
};

function makeSnapshot(patch: Partial<OfficeSnapshot> = {}): OfficeSnapshot {
  return {
    company: { name: 'ADS-NOLIMIT', tagline: 'Công ty AI', ownerName: 'Owner', executionMode: 'hybrid', version: 'test' },
    departments: [{ id: 'marketing', accent: '#3b82f6', bounds: { x: 0, z: 0, width: 1, depth: 1 } }],
    agents: [makeAgent('agent_a'), makeAgent('agent_b', { role: 'ai_qa_reviewer' })],
    tasks: [makeTask('task_1'), makeTask('task_2', { status: 'completed' })],
    approvals: [makeApproval('appr_1')],
    activities: [makeActivity('act_old', '2026-11-09T00:00:00.000Z'), makeActivity('act_new', '2026-11-10T01:00:00.000Z')],
    projects: [makeProject('proj_1')],
    connectors: [{ id: 'meta_ads', vendor: 'Meta Ads', category: 'ads', connected: true, mode: 'cloud' }],
    kpis: KPIS,
    messages: [makeMessage('msg_2', '2026-11-10T02:00:00.000Z'), makeMessage('msg_1', '2026-11-10T01:00:00.000Z')],
    updatedAt: T0,
    revision: 10,
    ...patch,
  };
}

const state = () => useOfficeStore.getState();

describe('officeStore – hydrate', () => {
  beforeEach(() => state().reset());

  it('nạp snapshot: chuyển mảng thành bản đồ theo id, sắp xếp hoạt động mới nhất trước, tin nhắn theo thời gian tăng dần', () => {
    expect(state().hydrated).toBe(false);
    state().hydrate(makeSnapshot());
    const s = state();
    expect(s.hydrated).toBe(true);
    expect(s.revision).toBe(10);
    expect(s.updatedAt).toBe(T0);
    expect(s.company?.name).toBe('ADS-NOLIMIT');
    expect(Object.keys(s.agents)).toEqual(['agent_a', 'agent_b']);
    expect(s.tasks.task_2?.status).toBe('completed');
    expect(s.approvals.appr_1?.status).toBe('pending');
    expect(s.projects.proj_1?.name).toBe('Dự án proj_1');
    expect(s.connectors).toHaveLength(1);
    expect(s.activities.map((a) => a.id)).toEqual(['act_new', 'act_old']);
    expect(s.messages.map((m) => m.id)).toEqual(['msg_1', 'msg_2']);
    expect(s.kpis?.roi).toBe(3.2);
  });

  it('hydrate giới hạn 300 hoạt động gần nhất', () => {
    const activities = Array.from({ length: 350 }, (_, i) => makeActivity(`act_${i}`, new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString()));
    state().hydrate(makeSnapshot({ activities }));
    expect(state().activities).toHaveLength(300);
    // Hoạt động mới nhất (phút 349) phải đứng đầu.
    expect(state().activities[0]?.id).toBe('act_349');
  });

  it('reset đưa store về trạng thái ban đầu', () => {
    state().hydrate(makeSnapshot());
    state().selectAgent('agent_a');
    state().reset();
    expect(state().hydrated).toBe(false);
    expect(state().agents).toEqual({});
    expect(state().selectedAgentId).toBeNull();
  });
});

describe('officeStore – applyEvent', () => {
  beforeEach(() => {
    state().reset();
    state().hydrate(makeSnapshot());
  });

  it('task.upserted thêm/cập nhật công việc và tăng revision', () => {
    state().applyEvent({ type: 'task.upserted', task: makeTask('task_3', { title: 'Mới' }), revision: 11 });
    expect(state().tasks.task_3?.title).toBe('Mới');
    expect(state().revision).toBe(11);
    state().applyEvent({ type: 'task.upserted', task: makeTask('task_1', { progress: 55 }), revision: 12 });
    expect(state().tasks.task_1?.progress).toBe(55);
    expect(Object.keys(state().tasks)).toHaveLength(3);
  });

  it('task.removed xóa công việc khỏi bản đồ', () => {
    state().applyEvent({ type: 'task.removed', taskId: 'task_1', revision: 11 });
    expect(state().tasks.task_1).toBeUndefined();
    expect(Object.keys(state().tasks)).toEqual(['task_2']);
  });

  it('agent.upserted cập nhật nhân sự', () => {
    state().applyEvent({ type: 'agent.upserted', agent: makeAgent('agent_a', { status: 'paused' }), revision: 11 });
    expect(state().agents.agent_a?.status).toBe('paused');
    state().applyEvent({ type: 'agent.upserted', agent: makeAgent('agent_c'), revision: 12 });
    expect(Object.keys(state().agents)).toHaveLength(3);
  });

  it('approval.upserted cập nhật yêu cầu phê duyệt', () => {
    state().applyEvent({ type: 'approval.upserted', approval: makeApproval('appr_1', { status: 'approved' }), revision: 11 });
    expect(state().approvals.appr_1?.status).toBe('approved');
  });

  it('activity.created chèn lên đầu, loại trùng id và giới hạn 300', () => {
    state().applyEvent({ type: 'activity.created', activity: makeActivity('act_x'), revision: 11 });
    expect(state().activities[0]?.id).toBe('act_x');
    expect(state().activities).toHaveLength(3);
    // Trùng id → thay thế, không nhân đôi.
    state().applyEvent({ type: 'activity.created', activity: makeActivity('act_x'), revision: 12 });
    expect(state().activities.filter((a) => a.id === 'act_x')).toHaveLength(1);
    for (let i = 0; i < 320; i++) {
      state().applyEvent({ type: 'activity.created', activity: makeActivity(`act_bulk_${i}`), revision: 13 + i });
    }
    expect(state().activities).toHaveLength(300);
    expect(state().activities[0]?.id).toBe('act_bulk_319');
  });

  it('project.upserted cập nhật dự án', () => {
    state().applyEvent({ type: 'project.upserted', project: makeProject('proj_1', { progress: 70 }), revision: 11 });
    expect(state().projects.proj_1?.progress).toBe(70);
  });

  it('kpi.updated thay bộ KPI', () => {
    state().applyEvent({ type: 'kpi.updated', kpis: { ...KPIS, roi: 4.1 }, revision: 11 });
    expect(state().kpis?.roi).toBe(4.1);
  });

  it('message.created nối vào cuối và loại trùng id', () => {
    state().applyEvent({ type: 'message.created', message: makeMessage('msg_3', '2026-11-10T03:00:00.000Z', { from: 'agent' }), revision: 11 });
    expect(state().messages.map((m) => m.id)).toEqual(['msg_1', 'msg_2', 'msg_3']);
    state().applyEvent({ type: 'message.created', message: makeMessage('msg_3', '2026-11-10T03:00:00.000Z', { text: 'Sửa' }), revision: 12 });
    expect(state().messages).toHaveLength(3);
    expect(state().messages.at(-1)?.text).toBe('Sửa');
  });

  it('bỏ qua sự kiện có revision cũ hơn bản hiện có', () => {
    state().applyEvent({ type: 'task.upserted', task: makeTask('task_stale'), revision: 5 });
    expect(state().tasks.task_stale).toBeUndefined();
    expect(state().revision).toBe(10);
    // Revision bằng nhau vẫn được áp dụng (không mất dữ liệu khi backend phát cùng nhịp).
    state().applyEvent({ type: 'task.upserted', task: makeTask('task_same'), revision: 10 });
    expect(state().tasks.task_same).toBeDefined();
  });

  it('trước khi hydrate, sự kiện vẫn được áp dụng bất kể revision', () => {
    state().reset();
    state().applyEvent({ type: 'task.upserted', task: makeTask('task_early'), revision: 1 });
    expect(state().tasks.task_early).toBeDefined();
  });

  it('sự kiện snapshot thay thế toàn bộ dữ liệu', () => {
    state().applyEvent({ type: 'task.upserted', task: makeTask('task_tmp'), revision: 11 });
    const fresh = makeSnapshot({ tasks: [makeTask('task_only')], agents: [makeAgent('agent_z')], revision: 50, approvals: [], activities: [], messages: [] });
    state().applyEvent({ type: 'snapshot', snapshot: fresh });
    const s = state();
    expect(s.revision).toBe(50);
    expect(Object.keys(s.tasks)).toEqual(['task_only']);
    expect(Object.keys(s.agents)).toEqual(['agent_z']);
    expect(s.approvals).toEqual({});
    expect(s.activities).toEqual([]);
    expect(s.messages).toEqual([]);
  });
});

describe('officeStore – trạng thái giao diện', () => {
  beforeEach(() => state().reset());

  it('chọn nhân sự / công việc / phòng ban / camera và gập thanh bên', () => {
    state().selectAgent('agent_a');
    state().selectTask('task_1');
    state().selectDepartment('marketing');
    state().focusCameraOnAgent('agent_b');
    expect(state().selectedAgentId).toBe('agent_a');
    expect(state().selectedTaskId).toBe('task_1');
    expect(state().selectedDepartmentId).toBe('marketing');
    expect(state().cameraFocusAgentId).toBe('agent_b');
    state().toggleSidebar();
    expect(state().sidebarCollapsed).toBe(true);
    state().toggleSidebar(false);
    expect(state().sidebarCollapsed).toBe(false);
  });

  it('setConnection lưu trạng thái và lỗi', () => {
    state().setConnection('offline', 'network');
    expect(state().connection).toBe('offline');
    expect(state().lastError).toBe('network');
    state().setConnection('live');
    expect(state().lastError).toBeNull();
  });
});

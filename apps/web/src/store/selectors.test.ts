import { describe, expect, it } from 'vitest';
import type { Agent, Approval, Task } from '@ads-nolimit/shared';
import type { OfficeStore } from './officeStore';
import {
  buildOrgTree,
  computeAgentCounts,
  computeTaskCounts,
  selectDepartmentSummary,
  selectHeadlineStats,
  selectPendingApprovals,
  selectStageCounts,
  selectTodaysKeyTasks,
} from './selectors';

/** Kiểm thử bộ chọn dùng chung – mọi con số trên các trang phải khớp với các hàm này. */

const T0 = '2026-11-10T00:00:00.000Z';

function agent(id: string, patch: Partial<Agent> = {}): Agent {
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

function task(id: string, patch: Partial<Task> = {}): Task {
  return {
    id,
    title: id,
    status: 'in_progress',
    stage: 'execute',
    priority: 'medium',
    departmentId: 'marketing',
    progress: 0,
    createdAt: T0,
    updatedAt: T0,
    tags: [],
    ...patch,
  };
}

function approval(id: string, patch: Partial<Approval> = {}): Approval {
  return { id, type: 'plan', title: id, requestedBy: 'agent_ceo', status: 'pending', createdAt: T0, ...patch };
}

const byId = <T extends { id: string }>(items: T[]) => Object.fromEntries(items.map((i) => [i.id, i]));

/** Dựng trạng thái store tối thiểu cho selector (chỉ các lát dữ liệu cần dùng). */
function stateWith(data: { tasks?: Task[]; agents?: Agent[]; approvals?: Approval[] }): OfficeStore {
  return {
    tasks: byId(data.tasks ?? []),
    agents: byId(data.agents ?? []),
    approvals: byId(data.approvals ?? []),
    activities: [],
    messages: [],
    departments: [],
    projects: {},
  } as unknown as OfficeStore;
}

describe('computeTaskCounts', () => {
  it('đếm theo trạng thái, số đang mở và tỷ lệ hoàn thành (làm tròn)', () => {
    const counts = computeTaskCounts([
      task('a', { status: 'completed' }),
      task('b', { status: 'in_progress' }),
      task('c', { status: 'blocked' }),
    ]);
    expect(counts.total).toBe(3);
    expect(counts.byStatus.completed).toBe(1);
    expect(counts.byStatus.in_progress).toBe(1);
    expect(counts.byStatus.blocked).toBe(1);
    expect(counts.byStatus.overdue).toBe(0);
    expect(counts.open).toBe(2);
    expect(counts.completionRate).toBe(33);
  });

  it('danh sách rỗng → tỷ lệ 0, không chia cho 0', () => {
    const counts = computeTaskCounts([]);
    expect(counts.total).toBe(0);
    expect(counts.open).toBe(0);
    expect(counts.completionRate).toBe(0);
  });
});

describe('computeAgentCounts', () => {
  it('đếm theo trạng thái nhân sự và số đang thực hiện', () => {
    const counts = computeAgentCounts([
      agent('a', { status: 'running' }),
      agent('b', { status: 'running' }),
      agent('c', { status: 'paused' }),
      agent('d', { status: 'idle' }),
    ]);
    expect(counts.total).toBe(4);
    expect(counts.running).toBe(2);
    expect(counts.byStatus.paused).toBe(1);
    expect(counts.byStatus.idle).toBe(1);
    expect(counts.byStatus.error).toBe(0);
  });
});

describe('selectHeadlineStats', () => {
  it('tính số nhân sự, đang chạy, hoàn thành, chờ và cần phê duyệt', () => {
    const s = stateWith({
      agents: [agent('a'), agent('b')],
      tasks: [
        task('t1', { status: 'in_progress' }),
        task('t2', { status: 'completed' }),
        task('t3', { status: 'pending' }),
        task('t4', { status: 'not_started' }),
        task('t5', { status: 'needs_approval' }),
      ],
      approvals: [approval('p1'), approval('p2', { status: 'approved' })],
    });
    expect(selectHeadlineStats(s)).toEqual({ agents: 2, running: 1, completed: 1, pending: 2, needsApproval: 1 });
  });
});

describe('selectStageCounts', () => {
  it('chỉ đếm công việc đang mở theo từng giai đoạn, đủ 6 giai đoạn', () => {
    const s = stateWith({
      tasks: [
        task('t1', { stage: 'plan' }),
        task('t2', { stage: 'execute' }),
        task('t3', { stage: 'execute' }),
        task('t4', { stage: 'review', status: 'completed' }), // đã xong → không tính
      ],
    });
    const counts = selectStageCounts(s);
    expect(Object.keys(counts).sort()).toEqual(['assign', 'execute', 'plan', 'receive', 'report', 'review']);
    expect(counts.plan).toBe(1);
    expect(counts.execute).toBe(2);
    expect(counts.review).toBe(0);
    expect(counts.receive).toBe(0);
  });
});

describe('selectTodaysKeyTasks', () => {
  it('ưu tiên cờ focus → mức ưu tiên cao → hạn gần nhất, và giới hạn số lượng', () => {
    const s = stateWith({
      tasks: [
        task('low_far', { priority: 'low', dueAt: '2026-12-30T00:00:00.000Z' }),
        task('high_far', { priority: 'high', dueAt: '2026-12-20T00:00:00.000Z' }),
        task('high_near', { priority: 'high', dueAt: '2026-11-12T00:00:00.000Z' }),
        task('focus_low', { priority: 'low', focus: true, dueAt: '2026-12-31T00:00:00.000Z' }),
        task('medium_no_due', { priority: 'medium' }),
        task('done', { status: 'completed', priority: 'high' }), // đã hoàn thành, không focus → loại
      ],
    });
    const ids = selectTodaysKeyTasks(10)(s).map((t) => t.id);
    expect(ids).toEqual(['focus_low', 'high_near', 'high_far', 'medium_no_due', 'low_far']);
    expect(selectTodaysKeyTasks(2)(s).map((t) => t.id)).toEqual(['focus_low', 'high_near']);
  });

  it('công việc đã hoàn thành nhưng có cờ focus vẫn được giữ', () => {
    const s = stateWith({ tasks: [task('done_focus', { status: 'completed', focus: true }), task('open')] });
    expect(selectTodaysKeyTasks()(s).map((t) => t.id)).toEqual(['done_focus', 'open']);
  });
});

describe('selectPendingApprovals', () => {
  it('chỉ lấy yêu cầu đang chờ, sắp xếp theo thời gian tạo tăng dần', () => {
    const s = stateWith({
      approvals: [
        approval('p_new', { createdAt: '2026-11-10T02:00:00.000Z' }),
        approval('p_old', { createdAt: '2026-11-10T01:00:00.000Z' }),
        approval('p_done', { status: 'rejected' }),
      ],
    });
    expect(selectPendingApprovals(s).map((a) => a.id)).toEqual(['p_old', 'p_new']);
  });
});

describe('buildOrgTree', () => {
  it('dựng cây theo reportsTo: gốc, con theo thứ hạng chức vụ, mồ côi thành gốc', () => {
    const tree = buildOrgTree([
      agent('agent_ceo', { role: 'ai_ceo' }),
      agent('agent_coo', { role: 'ai_coo', reportsTo: 'agent_ceo' }),
      agent('agent_pm', { role: 'ai_project_manager', reportsTo: 'agent_ceo' }),
      agent('agent_spec', { role: 'ai_specialist', reportsTo: 'agent_pm' }),
      agent('agent_orphan', { role: 'ai_qa_reviewer', reportsTo: 'agent_khong_ton_tai' }),
      agent('agent_orphan_child', { role: 'ai_specialist', reportsTo: 'agent_orphan' }),
    ]);
    expect(tree.map((n) => n.agent.id)).toEqual(['agent_ceo', 'agent_orphan']);
    const ceo = tree[0]!;
    // Con của CEO sắp theo thứ hạng: COO trước PM.
    expect(ceo.children.map((n) => n.agent.id)).toEqual(['agent_coo', 'agent_pm']);
    expect(ceo.children[1]!.children.map((n) => n.agent.id)).toEqual(['agent_spec']);
    // Nhân sự mồ côi vẫn giữ con của mình.
    expect(tree[1]!.children.map((n) => n.agent.id)).toEqual(['agent_orphan_child']);
  });

  it('cùng chức vụ thì sắp theo id để kết quả ổn định', () => {
    const tree = buildOrgTree([
      agent('agent_ceo', { role: 'ai_ceo' }),
      agent('agent_spec_b', { reportsTo: 'agent_ceo' }),
      agent('agent_spec_a', { reportsTo: 'agent_ceo' }),
    ]);
    expect(tree[0]!.children.map((n) => n.agent.id)).toEqual(['agent_spec_a', 'agent_spec_b']);
  });

  it('danh sách rỗng → cây rỗng', () => {
    expect(buildOrgTree([])).toEqual([]);
  });
});

describe('selectDepartmentSummary', () => {
  it('gom nhân sự, công việc và số liệu theo phòng ban', () => {
    const s = stateWith({
      agents: [agent('m1', { departmentId: 'marketing', status: 'running' }), agent('d1', { departmentId: 'data_analytics' })],
      tasks: [
        task('t1', { departmentId: 'marketing', status: 'completed' }),
        task('t2', { departmentId: 'marketing', status: 'in_progress' }),
        task('t3', { departmentId: 'data_analytics' }),
      ],
    });
    const summary = selectDepartmentSummary('marketing')(s);
    expect(summary.agents.map((a) => a.id)).toEqual(['m1']);
    expect(summary.tasks.map((t) => t.id)).toEqual(['t1', 't2']);
    expect(summary.counts.total).toBe(2);
    expect(summary.counts.completionRate).toBe(50);
    expect(summary.agentCounts.running).toBe(1);

    const empty = selectDepartmentSummary('pantry')(s);
    expect(empty.agents).toEqual([]);
    expect(empty.counts.total).toBe(0);
  });
});

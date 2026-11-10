import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ActivityEvent, OfficeEvent, Task } from '@ads-nolimit/shared';
import { OfficeStore } from './OfficeStore.js';
import { createSeedSnapshot } from '../seed.js';

/** Kiểm thử nguồn dữ liệu duy nhất phía backend: revision, sự kiện, lưu/đọc file. */

function makeTask(id: string, patch: Partial<Task> = {}): Task {
  const now = new Date().toISOString();
  return {
    id,
    title: `Công việc ${id}`,
    status: 'in_progress',
    stage: 'execute',
    priority: 'medium',
    departmentId: 'marketing',
    progress: 0,
    createdAt: now,
    updatedAt: now,
    tags: [],
    ...patch,
  };
}

function makeActivity(id: string): ActivityEvent {
  return { id, kind: 'system', templateKey: 'system', params: {}, createdAt: new Date().toISOString() };
}

describe('OfficeStore – revision và sự kiện', () => {
  it('mỗi lần upsert tăng revision thêm 1 và phát sự kiện đúng type kèm revision mới', () => {
    const store = new OfficeStore(createSeedSnapshot());
    const events: OfficeEvent[] = [];
    store.on('event', (e: OfficeEvent) => events.push(e));
    const base = store.revision;

    const task = store.upsertTask(makeTask('task_test'));
    expect(store.revision).toBe(base + 1);
    expect(store.getTask('task_test')?.title).toBe('Công việc task_test');
    expect(task.updatedAt >= task.createdAt).toBe(true);

    store.upsertAgent({ ...store.getAgent('agent_pm')!, status: 'paused' });
    store.upsertApproval({ ...store.getApproval('appr_plan_q4')!, status: 'approved' });
    store.addActivity(makeActivity('act_test'));
    store.upsertProject({ ...store.getProject('proj_q4_launch')!, progress: 99 });
    store.setKpis({ ...store.getSnapshot().kpis, roi: 9 });
    store.addMessage({ id: 'msg_test', agentId: 'agent_pm', from: 'owner', text: 'Xin chào', createdAt: new Date().toISOString() });
    store.removeTask('task_test');

    expect(store.revision).toBe(base + 8);
    expect(events.map((e) => e.type)).toEqual([
      'task.upserted',
      'agent.upserted',
      'approval.upserted',
      'activity.created',
      'project.upserted',
      'kpi.updated',
      'message.created',
      'task.removed',
    ]);
    // Revision trong sự kiện tăng dần và khớp với snapshot sau cùng.
    const revisions = events.map((e) => (e.type === 'snapshot' ? -1 : e.revision));
    expect(revisions).toEqual(Array.from({ length: 8 }, (_, i) => base + 1 + i));
    expect(store.getTask('task_test')).toBeUndefined();
    expect(store.getAgent('agent_pm')?.status).toBe('paused');
    expect(store.getSnapshot().kpis.roi).toBe(9);
  });

  it('upsert cùng id thay thế bản ghi, không nhân đôi', () => {
    const store = new OfficeStore(createSeedSnapshot());
    const count = store.getSnapshot().tasks.length;
    store.upsertTask({ ...store.getTask('task_plan_q4')!, progress: 77 });
    expect(store.getSnapshot().tasks.length).toBe(count);
    expect(store.getTask('task_plan_q4')?.progress).toBe(77);
  });

  it('updateCompany và replace phát sự kiện snapshot và tăng revision', () => {
    const store = new OfficeStore(createSeedSnapshot());
    const events: OfficeEvent[] = [];
    store.on('event', (e: OfficeEvent) => events.push(e));
    const base = store.revision;
    store.updateCompany({ ownerName: 'Chị Lan' });
    expect(store.getSnapshot().company.ownerName).toBe('Chị Lan');
    expect(store.revision).toBe(base + 1);
    store.replace(createSeedSnapshot());
    expect(store.revision).toBe(base + 2);
    expect(events.map((e) => e.type)).toEqual(['snapshot', 'snapshot']);
  });

  it('giới hạn 500 hoạt động gần nhất, mới nhất đứng đầu', () => {
    const store = new OfficeStore({ ...createSeedSnapshot(), activities: [] });
    for (let i = 0; i < 520; i++) store.addActivity(makeActivity(`act_${i}`));
    const activities = store.getSnapshot().activities;
    expect(activities).toHaveLength(500);
    expect(activities[0]?.id).toBe('act_519');
    expect(activities.at(-1)?.id).toBe('act_20');
  });
});

describe('OfficeStore – lưu và đọc file trạng thái', () => {
  let dir: string;
  let file: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'ads-nolimit-store-'));
    file = join(dir, 'nested', 'office-state.json');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('persistNow ghi JSON (tự tạo thư mục); loadOrSeed reset=false đọc lại đúng dữ liệu', () => {
    const store = new OfficeStore(createSeedSnapshot(), { persistPath: file, persistDebounceMs: 60_000 });
    store.upsertTask(makeTask('task_persisted', { title: 'Việc đã lưu' }));
    store.persistNow();
    expect(existsSync(file)).toBe(true);
    const raw = JSON.parse(readFileSync(file, 'utf8')) as { revision: number; tasks: Task[] };
    expect(raw.revision).toBe(store.revision);

    const loaded = OfficeStore.loadOrSeed(createSeedSnapshot, file, false);
    expect(loaded.revision).toBe(store.revision);
    expect(loaded.getTask('task_persisted')?.title).toBe('Việc đã lưu');
  });

  it('loadOrSeed reset=true bỏ file cũ và dựng lại từ dữ liệu mẫu', () => {
    const store = new OfficeStore(createSeedSnapshot(), { persistPath: file, persistDebounceMs: 60_000 });
    store.upsertTask(makeTask('task_persisted'));
    store.persistNow();

    const fresh = OfficeStore.loadOrSeed(createSeedSnapshot, file, true);
    expect(fresh.getTask('task_persisted')).toBeUndefined();
    expect(fresh.getSnapshot().tasks.length).toBe(createSeedSnapshot().tasks.length);
  });

  it('file hỏng hoặc thiếu trường bắt buộc → dựng lại từ dữ liệu mẫu', () => {
    writeFileSync(join(dir, 'broken.json'), '{ không phải json', 'utf8');
    const broken = OfficeStore.loadOrSeed(createSeedSnapshot, join(dir, 'broken.json'), false);
    expect(broken.getSnapshot().agents.length).toBe(10);

    writeFileSync(join(dir, 'partial.json'), JSON.stringify({ agents: [] }), 'utf8');
    const partial = OfficeStore.loadOrSeed(createSeedSnapshot, join(dir, 'partial.json'), false);
    expect(partial.getSnapshot().tasks.length).toBeGreaterThan(0);
  });

  it('không có persistPath → persistNow không ghi gì và không lỗi', () => {
    const store = new OfficeStore(createSeedSnapshot());
    expect(() => store.persistNow()).not.toThrow();
  });

  it('lưu tự động (debounce) sau khi ghi dữ liệu', async () => {
    const store = new OfficeStore(createSeedSnapshot(), { persistPath: file, persistDebounceMs: 10 });
    store.upsertTask(makeTask('task_auto'));
    await new Promise((r) => setTimeout(r, 60));
    expect(existsSync(file)).toBe(true);
    const raw = JSON.parse(readFileSync(file, 'utf8')) as { tasks: Task[] };
    expect(raw.tasks.some((t) => t.id === 'task_auto')).toBe(true);
  });
});

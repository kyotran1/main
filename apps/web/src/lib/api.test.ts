import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from './api';

/** Kiểm thử lớp gọi API: mock global fetch, kiểm tra ApiError và cách đọc phản hồi. */

type FetchMock = ReturnType<typeof vi.fn<typeof fetch>>;
let fetchMock: FetchMock;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api – lỗi', () => {
  it('phản hồi lỗi có body {code, message} → ApiError mang đúng code, status và details', async () => {
    fetchMock.mockResolvedValue(jsonResponse(409, { code: 'agent_paused', message: 'Agent "agent_x" is paused', details: { agentId: 'agent_x' } }));
    const err = await api.pauseAgent('agent_x').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    const apiErr = err as ApiError;
    expect(apiErr.code).toBe('agent_paused');
    expect(apiErr.status).toBe(409);
    expect(apiErr.message).toBe('Agent "agent_x" is paused');
    expect(apiErr.details).toEqual({ agentId: 'agent_x' });
  });

  it('phản hồi lỗi không có body → code "internal", message là statusText', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500, statusText: 'Internal Server Error' }));
    const err = (await api.health().catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('internal');
    expect(err.status).toBe(500);
    expect(err.message).toBe('Internal Server Error');
  });

  it('fetch ném lỗi (mất mạng) → ApiError code "network", status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const err = (await api.getState().catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe('network');
    expect(err.status).toBe(0);
    expect(err.message).toBe('Failed to fetch');
  });

  it('404 từ backend giữ nguyên code not_found', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { code: 'not_found', message: 'Task "x" not found' }));
    const err = (await api.updateTask('x', { progress: 10 }).catch((e: unknown) => e)) as ApiError;
    expect(err.code).toBe('not_found');
    expect(err.status).toBe(404);
  });
});

describe('api – phản hồi thành công', () => {
  it('204 No Content → trả về undefined', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(api.pauseAgent('agent_a')).resolves.toBeUndefined();
  });

  it('200 với JSON → trả về body đã parse', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ok: true, revision: 7, executionMode: 'hybrid' }));
    await expect(api.health()).resolves.toEqual({ ok: true, revision: 7, executionMode: 'hybrid' });
  });

  it('body rỗng với 200 → trả về null (không ném lỗi parse)', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 200 }));
    await expect(api.health()).resolves.toBeNull();
  });
});

describe('api – đường dẫn và phương thức', () => {
  const lastCall = () => {
    const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
    return { url, init, body: init.body ? (JSON.parse(String(init.body)) as unknown) : undefined };
  };

  it('createCeoRequest gửi POST tới /api/ceo/requests kèm JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, {}));
    await api.createCeoRequest({ text: 'Lập kế hoạch marketing', priority: 'high' });
    const { url, init, body } = lastCall();
    expect(url).toBe('/api/ceo/requests');
    expect(init.method).toBe('POST');
    expect(body).toEqual({ text: 'Lập kế hoạch marketing', priority: 'high' });
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('updateTask dùng PATCH /api/tasks/:id', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));
    await api.updateTask('task_1', { status: 'completed' });
    const { url, init } = lastCall();
    expect(url).toBe('/api/tasks/task_1');
    expect(init.method).toBe('PATCH');
  });

  it('decideApproval gửi POST /api/approvals/:id/approve|reject với ghi chú', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));
    await api.decideApproval('appr_1', 'reject', { note: 'Chưa phù hợp' });
    const { url, body } = lastCall();
    expect(url).toBe('/api/approvals/appr_1/reject');
    expect(body).toEqual({ note: 'Chưa phù hợp' });
  });

  it('sendAgentMessage và updateSettings dùng đúng đường dẫn', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, {}));
    await api.sendAgentMessage('agent_pm', { text: 'Tiến độ?' });
    expect(lastCall().url).toBe('/api/agents/agent_pm/messages');
    fetchMock.mockResolvedValue(jsonResponse(200, {}));
    await api.updateSettings({ executionMode: 'local' });
    expect(lastCall().url).toBe('/api/settings');
    expect(lastCall().init.method).toBe('PATCH');
  });
});

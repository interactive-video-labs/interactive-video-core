import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RemoteApiDecisionAdapter,
  RemoteApiError,
  type RemoteApiSyncEvent,
} from '../src/RemoteApiDecisionAdapter';
import type { Decision } from '../src/types';

describe('RemoteApiDecisionAdapter', () => {
  const decision: Decision = {
    cueId: 'question-1',
    choice: 'answer-a',
    timestamp: 123,
    metadata: { interactionType: 'choice' },
  };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
  });

  const createAdapter = (overrides: Record<string, unknown> = {}) =>
    new RemoteApiDecisionAdapter({
      baseUrl: 'https://api.example.test/v1/',
      sessionId: 'lesson/one',
      userId: 'student-1',
      headers: { Authorization: 'Bearer test-token' },
      fetch: fetchMock as typeof fetch,
      ...overrides,
    });

  it('posts decisions with configured identity and headers', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 201 }));
    const adapter = createAdapter();

    await adapter.saveDecision(decision);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/v1/sessions/lesson%2Fone/decisions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: 'lesson/one',
          userId: 'student-1',
          decision,
        }),
      }),
    );
  });

  it('hydrates decision and playback history from API responses', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ decisions: [decision] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ progress: { position: 42, duration: 120 } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    const adapter = createAdapter();

    await expect(adapter.getDecisionHistory()).resolves.toEqual([decision]);
    await expect(adapter.getPlaybackProgress()).resolves.toEqual({
      position: 42,
      duration: 120,
    });
    expect(fetchMock.mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      ['https://api.example.test/v1/sessions/lesson%2Fone/decisions', 'GET'],
      ['https://api.example.test/v1/sessions/lesson%2Fone/progress', 'GET'],
    ]);
  });

  it('supports configurable endpoints and clearing history', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const adapter = createAdapter({
      endpoints: {
        decisions: 'custom/{userId}/answers',
        playbackProgress: 'custom/{sessionId}/position',
      },
    });

    await adapter.clearDecisionHistory();
    await adapter.savePlaybackProgress({ position: 42, updatedAt: 123 });

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.test/v1/custom/student-1/answers');
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://api.example.test/v1/custom/lesson%2Fone/position',
    );
    expect(fetchMock.mock.calls[1][1].method).toBe('PUT');
  });

  it('reports sync lifecycle and wraps HTTP failures', async () => {
    const events: RemoteApiSyncEvent[] = [];
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));
    const adapter = createAdapter({
      onSyncStatus: (event: RemoteApiSyncEvent) => events.push(event),
    });

    await expect(adapter.saveDecision(decision)).rejects.toMatchObject({
      name: 'RemoteApiError',
      status: 503,
    } satisfies Partial<RemoteApiError>);
    expect(events.map(({ status }) => status)).toEqual(['started', 'failed']);
    expect(events[1].error).toBeInstanceOf(RemoteApiError);
  });

  it('reports network errors and preserves their cause', async () => {
    const networkError = new Error('offline');
    fetchMock.mockRejectedValue(networkError);
    const adapter = createAdapter();

    await expect(adapter.getDecisionHistory()).rejects.toMatchObject({
      name: 'RemoteApiError',
      cause: networkError,
    });
  });

  it('reports malformed response data as a failed sync', async () => {
    const events: RemoteApiSyncEvent[] = [];
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ unexpected: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const adapter = createAdapter({
      onSyncStatus: (event: RemoteApiSyncEvent) => events.push(event),
    });

    await expect(adapter.getDecisionHistory()).rejects.toMatchObject({
      name: 'RemoteApiError',
      message: 'The decision history response must contain a decisions array.',
    });
    expect(events.map(({ status }) => status)).toEqual(['started', 'failed']);
  });
});

import type {
  Decision,
  DecisionAdapter,
  PlaybackProgress,
  RemoteApiDecisionAdapterOptions,
  RemoteApiSyncOperation,
} from './types';

export type {
  PlaybackProgress,
  RemoteApiDecisionAdapterOptions,
  RemoteApiSyncEvent,
  RemoteApiSyncOperation,
} from './types';

export class RemoteApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly url?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'RemoteApiError';
  }
}

/**
 * Persists decisions and playback progress using a configurable JSON API.
 * Endpoint paths may include `{sessionId}` and `{userId}` placeholders.
 */
export class RemoteApiDecisionAdapter implements DecisionAdapter {
  private readonly baseUrl: string;
  private readonly options: RemoteApiDecisionAdapterOptions;
  private readonly requestFetch: typeof fetch;

  constructor(options: RemoteApiDecisionAdapterOptions) {
    this.options = options;
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.requestFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async saveDecision(decision: Decision): Promise<void> {
    await this.request(
      'saveDecision',
      this.decisionEndpoint(),
      {
        method: 'POST',
        body: JSON.stringify({
          sessionId: this.options.sessionId,
          userId: this.options.userId,
          decision,
        }),
      },
      async () => undefined,
    );
  }

  async getDecisionHistory(): Promise<Decision[]> {
    return this.request(
      'getDecisionHistory',
      this.decisionEndpoint(),
      { method: 'GET' },
      async (response) => {
        const payload: unknown = await response.json();
        const history = Array.isArray(payload)
          ? payload
          : payload && typeof payload === 'object' && 'decisions' in payload
            ? payload.decisions
            : undefined;

        if (!Array.isArray(history)) {
          throw new RemoteApiError(
            'The decision history response must contain a decisions array.',
            undefined,
            response.url,
          );
        }

        return history as Decision[];
      },
    );
  }

  async clearDecisionHistory(): Promise<void> {
    await this.request(
      'clearDecisionHistory',
      this.decisionEndpoint(),
      { method: 'DELETE' },
      async () => undefined,
    );
  }

  async savePlaybackProgress(progress: PlaybackProgress): Promise<void> {
    await this.request(
      'savePlaybackProgress',
      this.progressEndpoint(),
      {
        method: 'PUT',
        body: JSON.stringify({
          sessionId: this.options.sessionId,
          userId: this.options.userId,
          progress,
        }),
      },
      async () => undefined,
    );
  }

  async getPlaybackProgress(): Promise<PlaybackProgress | null> {
    return this.request(
      'getPlaybackProgress',
      this.progressEndpoint(),
      { method: 'GET' },
      async (response) => {
        const payload: unknown = await response.json();
        if (payload === null) return null;

        const progress =
          payload && typeof payload === 'object' && 'progress' in payload
            ? payload.progress
            : payload;
        if (
          !progress ||
          typeof progress !== 'object' ||
          !('position' in progress) ||
          typeof progress.position !== 'number'
        ) {
          throw new RemoteApiError(
            'The playback progress response must contain a numeric position.',
            undefined,
            response.url,
          );
        }

        return progress as PlaybackProgress;
      },
    );
  }

  private decisionEndpoint(): string {
    return this.endpoint(this.options.endpoints?.decisions ?? 'sessions/{sessionId}/decisions');
  }

  private progressEndpoint(): string {
    return this.endpoint(
      this.options.endpoints?.playbackProgress ?? 'sessions/{sessionId}/progress',
    );
  }

  private endpoint(path: string): string {
    const expandedPath = path
      .replace(/\{sessionId\}/g, encodeURIComponent(this.options.sessionId))
      .replace(/\{userId\}/g, encodeURIComponent(this.options.userId ?? ''));
    return new URL(expandedPath, `${this.baseUrl}/`).toString();
  }

  private async request<T>(
    operation: RemoteApiSyncOperation,
    url: string,
    init: RequestInit,
    parseResponse: (response: Response) => Promise<T>,
  ): Promise<T> {
    this.options.onSyncStatus?.({ operation, status: 'started' });

    try {
      const response = await this.requestFetch(url, {
        ...init,
        headers: {
          ...this.options.headers,
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        },
      });

      if (!response.ok) {
        throw new RemoteApiError(
          `Remote API request failed with status ${response.status}.`,
          response.status,
          url,
        );
      }

      const result = await parseResponse(response);
      this.options.onSyncStatus?.({ operation, status: 'succeeded' });
      return result;
    } catch (error) {
      const syncError =
        error instanceof RemoteApiError
          ? error
          : new RemoteApiError(
              error instanceof Error ? error.message : 'Remote API request could not be completed.',
              undefined,
              url,
              { cause: error },
            );
      this.options.onSyncStatus?.({ operation, status: 'failed', error: syncError });
      throw syncError;
    }
  }
}

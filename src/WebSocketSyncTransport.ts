import type {
  LiveSyncAdapter,
  LiveSyncClientMessage,
  LiveSyncEvent,
  LiveSyncStatusEvent,
} from './types';

export type WebSocketSyncTransportOptions = {
  url: string;
  roomId: string;
  clientId?: string;
  protocols?: string | string[];
  reconnect?: {
    initialDelayMs?: number;
    maxDelayMs?: number;
    multiplier?: number;
    maxAttempts?: number;
  };
  heartbeat?: {
    intervalMs?: number;
    timeoutMs?: number;
  };
  maxQueuedMessages?: number;
  webSocketFactory?: (url: string, protocols?: string | string[]) => WebSocket;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isNumberRecord = (value: unknown): value is Record<string, number> =>
  isRecord(value) && Object.values(value).every(isNumber);

const incomingEventTypes = new Set([
  'room:state',
  'playback:sync',
  'cue:triggered',
  'node:entered',
  'decision:submitted',
  'poll:tally',
  'analytics:updated',
  'presence:update',
  'heartbeat:pong',
]);

function isLiveSyncEvent(value: unknown): value is LiveSyncEvent {
  if (!isRecord(value) || typeof value.type !== 'string') return false;
  const payload = value.payload;

  switch (value.type) {
    case 'room:state':
      return (
        isRecord(payload) &&
        isNumber(payload.videoTimestamp) &&
        isNumber(payload.serverTimestamp) &&
        typeof payload.isPlaying === 'boolean' &&
        (payload.videoUrl === undefined || typeof payload.videoUrl === 'string') &&
        (payload.segmentUrl === undefined || typeof payload.segmentUrl === 'string') &&
        (payload.mainVideoUrl === undefined || typeof payload.mainVideoUrl === 'string') &&
        (payload.mainVideoTimestamp === undefined || isNumber(payload.mainVideoTimestamp)) &&
        (payload.aggregateCounts === undefined || isNumberRecord(payload.aggregateCounts))
      );
    case 'playback:sync':
      return (
        isRecord(payload) &&
        ['play', 'pause', 'seek', 'segment'].includes(String(payload.action)) &&
        isNumber(payload.videoTimestamp) &&
        isNumber(payload.serverTimestamp) &&
        typeof payload.isPlaying === 'boolean' &&
        (payload.videoUrl === undefined || typeof payload.videoUrl === 'string') &&
        (payload.segmentUrl === undefined || typeof payload.segmentUrl === 'string') &&
        (payload.mainVideoUrl === undefined || typeof payload.mainVideoUrl === 'string') &&
        (payload.mainVideoTimestamp === undefined || isNumber(payload.mainVideoTimestamp))
      );
    case 'cue:triggered':
      return (
        isRecord(payload) &&
        typeof payload.cueId === 'string' &&
        (payload.videoTimestamp === undefined || isNumber(payload.videoTimestamp)) &&
        (payload.serverTimestamp === undefined || isNumber(payload.serverTimestamp))
      );
    case 'node:entered':
      return isRecord(payload) && typeof payload.nodeId === 'string';
    case 'decision:submitted':
      return isRecord(payload) && isRecord(payload.decision);
    case 'poll:tally':
      return (
        isRecord(payload) &&
        isRecord(payload.counts) &&
        Object.values(payload.counts).every(isNumber)
      );
    case 'analytics:updated':
      return isRecord(payload) && isRecord(payload.data);
    case 'presence:update':
      return isRecord(payload) && Array.isArray(payload.participants);
    case 'heartbeat:pong':
      return (
        payload === undefined ||
        (isRecord(payload) &&
          (payload.serverTimestamp === undefined || isNumber(payload.serverTimestamp)))
      );
    default:
      return false;
  }
}

/**
 * WebSocket-backed room transport with reconnection, heartbeat, and an in-memory
 * outbox for messages sent while the connection is unavailable.
 */
export class WebSocketSyncTransport implements LiveSyncAdapter {
  private readonly clientId: string;
  private readonly createWebSocket: (url: string, protocols?: string | string[]) => WebSocket;
  private readonly initialReconnectDelayMs: number;
  private readonly maxReconnectDelayMs: number;
  private readonly reconnectMultiplier: number;
  private readonly maxReconnectAttempts: number;
  private readonly heartbeatIntervalMs: number;
  private readonly heartbeatTimeoutMs: number;
  private readonly maxQueuedMessages: number;
  private readonly outbox: string[] = [];

  private socket?: WebSocket;
  private onEvent?: (event: LiveSyncEvent) => void;
  private onStatus?: (event: LiveSyncStatusEvent) => void;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private reconnectAttempts = 0;
  private lastPingAt?: number;
  private serverTimeOffsetMs = 0;
  private started = false;

  constructor(private readonly options: WebSocketSyncTransportOptions) {
    if (!options.url || !options.roomId) {
      throw new Error('WebSocketSyncTransport requires a URL and roomId.');
    }

    this.clientId = options.clientId ?? this.createClientId();
    this.createWebSocket =
      options.webSocketFactory ??
      ((url, protocols) => (protocols ? new WebSocket(url, protocols) : new WebSocket(url)));
    this.initialReconnectDelayMs = options.reconnect?.initialDelayMs ?? 500;
    this.maxReconnectDelayMs = options.reconnect?.maxDelayMs ?? 15_000;
    this.reconnectMultiplier = options.reconnect?.multiplier ?? 2;
    this.maxReconnectAttempts = options.reconnect?.maxAttempts ?? Infinity;
    this.heartbeatIntervalMs = options.heartbeat?.intervalMs ?? 20_000;
    this.heartbeatTimeoutMs = options.heartbeat?.timeoutMs ?? 10_000;
    this.maxQueuedMessages = options.maxQueuedMessages ?? 1_000;

    if (
      this.initialReconnectDelayMs < 0 ||
      this.maxReconnectDelayMs < this.initialReconnectDelayMs ||
      this.reconnectMultiplier < 1 ||
      this.maxReconnectAttempts < 0 ||
      this.heartbeatIntervalMs <= 0 ||
      this.heartbeatTimeoutMs <= 0 ||
      this.maxQueuedMessages < 1
    ) {
      throw new RangeError('WebSocketSyncTransport options must use valid positive limits.');
    }
  }

  public connect(
    onEvent: (event: LiveSyncEvent) => void,
    onStatus?: (event: LiveSyncStatusEvent) => void,
  ): void {
    this.onEvent = onEvent;
    this.onStatus = onStatus;
    if (this.started) return;

    this.started = true;
    this.openSocket();
  }

  public send(message: LiveSyncClientMessage): Promise<void> {
    const encoded = this.encode(message);
    if (this.socket?.readyState === 1) {
      if (this.sendRaw(encoded)) return Promise.resolve();
      this.closeSocket();
    }

    if (this.outbox.length >= this.maxQueuedMessages) {
      return Promise.reject(
        new Error(`Live sync outbox is full (${this.maxQueuedMessages} messages).`),
      );
    }

    this.outbox.push(encoded);
    return Promise.resolve();
  }

  public disconnect(): void {
    this.started = false;
    this.clearReconnectTimer();
    this.stopHeartbeat();

    const socket = this.socket;
    if (socket?.readyState === 1) {
      this.sendRaw(this.encodeEnvelope('room:leave', { roomId: this.options.roomId }));
    }
    this.socket = undefined;
    socket?.close();
    this.notifyStatus({ status: 'disconnected' });
  }

  public getServerTimestamp(): number {
    return Date.now() + this.serverTimeOffsetMs;
  }

  private openSocket(): void {
    if (!this.started) return;
    this.notifyStatus({
      status: this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting',
    });

    try {
      const socket = this.createWebSocket(this.options.url, this.options.protocols);
      this.socket = socket;
      socket.addEventListener('open', () => this.handleOpen(socket));
      socket.addEventListener('message', (event) => this.handleMessage(event, socket));
      socket.addEventListener('error', () => {
        this.notifyStatus({
          status: 'error',
          error: new Error('WebSocket live sync connection failed.'),
        });
      });
      socket.addEventListener('close', () => this.handleClose(socket));
    } catch (error) {
      this.notifyStatus({
        status: 'error',
        error: error instanceof Error ? error : new Error('WebSocket connection failed.'),
      });
      this.scheduleReconnect();
    }
  }

  private handleOpen(socket: WebSocket): void {
    if (!this.started || socket !== this.socket) return;
    this.reconnectAttempts = 0;
    this.lastPingAt = undefined;
    this.notifyStatus({ status: 'connected' });

    if (
      !this.sendRaw(
        this.encodeEnvelope('room:join', {
          roomId: this.options.roomId,
          clientId: this.clientId,
        }),
      )
    ) {
      this.closeSocket();
      return;
    }

    this.flushOutbox();
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent, socket: WebSocket): void {
    if (socket !== this.socket || typeof event.data !== 'string') return;

    let message: unknown;
    try {
      message = JSON.parse(event.data);
    } catch (error) {
      this.notifyStatus({
        status: 'error',
        error: error instanceof Error ? error : new Error('Invalid live sync JSON message.'),
      });
      return;
    }

    if (!isRecord(message)) return;
    if (message.roomId !== undefined && message.roomId !== this.options.roomId) return;
    if (!isLiveSyncEvent(message)) {
      if (typeof message.type === 'string' && incomingEventTypes.has(message.type)) {
        this.notifyStatus({
          status: 'error',
          error: new Error(`Invalid payload for live sync event "${message.type}".`),
        });
      }
      return;
    }

    if (message.type === 'heartbeat:pong') {
      const timestamp = message.payload?.serverTimestamp;
      if (isNumber(timestamp) && this.lastPingAt !== undefined) {
        this.serverTimeOffsetMs = timestamp - (this.lastPingAt + Date.now()) / 2;
      }
      this.lastPingAt = undefined;
    }
    this.onEvent?.(message);
  }

  private handleClose(socket: WebSocket): void {
    if (socket !== this.socket) return;
    this.socket = undefined;
    this.stopHeartbeat();
    if (this.started) this.scheduleReconnect();
    else this.notifyStatus({ status: 'disconnected' });
  }

  private flushOutbox(): void {
    while (this.socket?.readyState === 1 && this.outbox.length > 0) {
      if (!this.sendRaw(this.outbox[0])) {
        this.closeSocket();
        return;
      }
      this.outbox.shift();
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState !== 1) return;
      const now = Date.now();
      if (this.lastPingAt !== undefined && now - this.lastPingAt > this.heartbeatTimeoutMs) {
        this.closeSocket();
        return;
      }

      this.lastPingAt = now;
      if (!this.sendRaw(this.encodeEnvelope('heartbeat:ping', { clientTimestamp: now }))) {
        this.closeSocket();
      }
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== undefined) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = undefined;
    this.lastPingAt = undefined;
  }

  private scheduleReconnect(): void {
    if (!this.started || this.reconnectTimer !== undefined) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.notifyStatus({ status: 'disconnected' });
      return;
    }

    const delay = Math.min(
      this.maxReconnectDelayMs,
      this.initialReconnectDelayMs * this.reconnectMultiplier ** this.reconnectAttempts,
    );
    this.reconnectAttempts += 1;
    this.notifyStatus({ status: 'reconnecting' });
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.openSocket();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== undefined) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
  }

  private closeSocket(): void {
    try {
      this.socket?.close();
    } catch (error) {
      this.notifyStatus({
        status: 'error',
        error: error instanceof Error ? error : new Error('Failed to close WebSocket.'),
      });
    }
  }

  private sendRaw(encoded: string): boolean {
    try {
      if (!this.socket || this.socket.readyState !== 1) return false;
      this.socket.send(encoded);
      return true;
    } catch (error) {
      this.notifyStatus({
        status: 'error',
        error: error instanceof Error ? error : new Error('Failed to send live sync message.'),
      });
      return false;
    }
  }

  private encode(message: LiveSyncClientMessage): string {
    return this.encodeEnvelope(message.type, message.payload);
  }

  private encodeEnvelope(type: string, payload: unknown): string {
    return JSON.stringify({
      type,
      payload,
      roomId: this.options.roomId,
      clientId: this.clientId,
      messageId: this.createClientId(),
    });
  }

  private notifyStatus(event: LiveSyncStatusEvent): void {
    this.onStatus?.(event);
  }

  private createClientId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  }
}

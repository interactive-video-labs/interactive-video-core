import { afterEach, describe, expect, it, vi } from 'vitest';
import { IVLabsPlayer } from '../src/player';
import { WebSocketSyncTransport } from '../src/WebSocketSyncTransport';
import type {
  LiveSyncAdapter,
  LiveSyncClientMessage,
  LiveSyncEvent,
  LiveSyncStatusEvent,
} from '../src/types';

class MockLiveSyncAdapter implements LiveSyncAdapter {
  public sent: LiveSyncClientMessage[] = [];
  private onEvent?: (event: LiveSyncEvent) => void;

  connect(
    onEvent: (event: LiveSyncEvent) => void,
    _onStatus?: (event: LiveSyncStatusEvent) => void,
  ): void {
    this.onEvent = onEvent;
  }

  send(message: LiveSyncClientMessage): Promise<void> {
    this.sent.push(message);
    return Promise.resolve();
  }

  disconnect(): void {}

  emit(event: LiveSyncEvent): void {
    this.onEvent?.(event);
  }
}

class MockWebSocket {
  public readyState = 0;
  public sent: string[] = [];
  private listeners = new Map<string, Array<(event: MessageEvent) => void>>();

  addEventListener(type: string, listener: (event: MessageEvent) => void): void {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  send(message: string): void {
    if (this.readyState !== 1) throw new Error('Socket is not open.');
    this.sent.push(message);
  }

  open(): void {
    this.readyState = 1;
    this.emit('open', {} as MessageEvent);
  }

  close(): void {
    this.readyState = 3;
    this.emit('close', {} as MessageEvent);
  }

  receive(message: unknown): void {
    this.emit('message', { data: JSON.stringify(message) } as MessageEvent);
  }

  private emit(type: string, event: MessageEvent): void {
    this.listeners.get(type)?.forEach((listener) => listener(event));
  }
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('IVLabsPlayer live sync', () => {
  it('hydrates from a room snapshot and only corrects drift above the tolerance', () => {
    const adapter = new MockLiveSyncAdapter();
    const target = document.createElement('div');
    target.id = 'live-player';
    document.body.appendChild(target);

    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const player = new IVLabsPlayer('live-player', {
      videoUrl: 'lesson.mp4',
      liveSync: { adapter, driftToleranceSeconds: 0.75 },
    });
    const video = target.querySelector('video')!;
    const onEvent = vi.fn();
    player.onLiveSyncEvent(onEvent);

    video.currentTime = 10;
    adapter.emit({
      type: 'room:state',
      payload: {
        videoTimestamp: 10.5,
        serverTimestamp: Date.now(),
        isPlaying: false,
        activeCueId: 'cue-1',
      },
    });
    expect(video.currentTime).toBe(10);

    adapter.emit({
      type: 'playback:sync',
      payload: {
        action: 'seek',
        videoTimestamp: 11,
        serverTimestamp: Date.now(),
        isPlaying: false,
      },
    });
    expect(video.currentTime).toBe(11);
    expect(onEvent).toHaveBeenCalledTimes(2);

    video.currentTime = 10.9;
    player.syncToLive();
    expect(video.currentTime).toBe(11);

    player.destroy();
  });

  it('broadcasts host playback changes and cue triggers', () => {
    const adapter = new MockLiveSyncAdapter();
    const target = document.createElement('div');
    target.id = 'host-player';
    document.body.appendChild(target);

    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
    const player = new IVLabsPlayer('host-player', {
      videoUrl: 'lesson.mp4',
      cues: [{ id: 'cue-1', time: 1 }],
      liveSync: { adapter, role: 'host' },
    });
    const video = target.querySelector('video')!;

    video.dispatchEvent(new Event('play'));
    video.currentTime = 1;
    video.dispatchEvent(new Event('timeupdate'));
    video.dispatchEvent(new Event('seeked'));

    expect(adapter.sent.map((message) => message.type)).toEqual([
      'playback:sync',
      'cue:triggered',
      'playback:sync',
    ]);

    player.destroy();
  });
});

describe('WebSocketSyncTransport', () => {
  it('joins, hydrates room state, and flushes queued decisions after reconnect', async () => {
    vi.useFakeTimers();
    const sockets: MockWebSocket[] = [];
    const transport = new WebSocketSyncTransport({
      url: 'wss://example.test/live',
      roomId: 'workshop-1',
      clientId: 'client-1',
      reconnect: { initialDelayMs: 100, maxDelayMs: 500 },
      heartbeat: { intervalMs: 10_000, timeoutMs: 5_000 },
      webSocketFactory: () => {
        const socket = new MockWebSocket();
        sockets.push(socket);
        return socket as unknown as WebSocket;
      },
    });
    const events: LiveSyncEvent[] = [];
    transport.connect((event) => events.push(event));
    await transport.send({
      type: 'decision:submitted',
      payload: {
        decision: { cueId: 'cue-1', choice: 'answer-a', timestamp: 1 },
      },
    });

    sockets[0].open();
    expect(JSON.parse(sockets[0].sent[0]).type).toBe('room:join');
    expect(JSON.parse(sockets[0].sent[1]).type).toBe('decision:submitted');
    sockets[0].receive({
      type: 'room:state',
      roomId: 'workshop-1',
      payload: {
        videoTimestamp: 5,
        serverTimestamp: Date.now(),
        isPlaying: true,
      },
    });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('room:state');

    sockets[0].close();
    await transport.send({
      type: 'decision:submitted',
      payload: {
        decision: { cueId: 'cue-2', choice: 'answer-b', timestamp: 2 },
      },
    });
    await vi.advanceTimersByTimeAsync(100);
    expect(sockets).toHaveLength(2);
    sockets[1].open();
    expect(JSON.parse(sockets[1].sent[0]).type).toBe('room:join');
    expect(JSON.parse(sockets[1].sent[1]).payload.decision.cueId).toBe('cue-2');

    transport.disconnect();
  });

  it('sends heartbeats and uses pong timestamps without timing out a live connection', async () => {
    vi.useFakeTimers();
    const socket = new MockWebSocket();
    const transport = new WebSocketSyncTransport({
      url: 'wss://example.test/live',
      roomId: 'workshop-1',
      heartbeat: { intervalMs: 100, timeoutMs: 50 },
      webSocketFactory: () => socket as unknown as WebSocket,
    });
    const statuses: LiveSyncStatusEvent[] = [];
    transport.connect(
      () => {},
      (event) => statuses.push(event),
    );
    socket.open();

    await vi.advanceTimersByTimeAsync(100);
    expect(JSON.parse(socket.sent[1]).type).toBe('heartbeat:ping');
    socket.receive({
      type: 'heartbeat:pong',
      payload: { serverTimestamp: Date.now() + 250 },
    });
    expect(transport.getServerTimestamp()).toBeGreaterThan(Date.now());

    await vi.advanceTimersByTimeAsync(100);
    expect(socket.readyState).toBe(1);
    expect(JSON.parse(socket.sent[2]).type).toBe('heartbeat:ping');

    transport.disconnect();
    expect(statuses.some((event) => event.status === 'disconnected')).toBe(true);
  });
});

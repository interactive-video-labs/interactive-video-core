import type { Decision } from './decision';

export type LiveSyncRole = 'host' | 'participant';

export type LiveRoomState = {
  videoTimestamp: number;
  serverTimestamp: number;
  isPlaying: boolean;
  videoUrl?: string;
  segmentUrl?: string;
  mainVideoUrl?: string;
  mainVideoTimestamp?: number;
  activeCueId?: string;
  activeNodeId?: string;
  aggregateCounts?: Record<string, number>;
};

export type LivePlaybackSync = {
  action: 'play' | 'pause' | 'seek' | 'segment';
  videoTimestamp: number;
  serverTimestamp: number;
  isPlaying: boolean;
  videoUrl?: string;
  segmentUrl?: string;
  mainVideoUrl?: string;
  mainVideoTimestamp?: number;
};

export type LiveSyncEvent =
  | { type: 'room:state'; payload: LiveRoomState }
  | { type: 'playback:sync'; payload: LivePlaybackSync }
  | {
      type: 'cue:triggered';
      payload: { cueId: string; videoTimestamp?: number; serverTimestamp?: number };
    }
  | { type: 'node:entered'; payload: { nodeId: string; data?: Record<string, unknown> } }
  | {
      type: 'decision:submitted';
      payload: { decision: Decision; aggregateCounts?: Record<string, number> };
    }
  | { type: 'poll:tally'; payload: { cueId?: string; counts: Record<string, number> } }
  | { type: 'analytics:updated'; payload: { data: Record<string, unknown> } }
  | { type: 'presence:update'; payload: { participants: unknown[] } }
  | { type: 'heartbeat:pong'; payload?: { serverTimestamp?: number } };

export type LiveSyncClientMessage =
  | { type: 'playback:sync'; payload: LivePlaybackSync }
  | {
      type: 'cue:triggered';
      payload: { cueId: string; videoTimestamp?: number; serverTimestamp?: number };
    }
  | { type: 'node:entered'; payload: { nodeId: string; data?: Record<string, unknown> } }
  | { type: 'decision:submitted'; payload: { decision: Decision } }
  | { type: 'presence:update'; payload: { data: Record<string, unknown> } }
  | { type: 'reaction:submitted'; payload: { reaction: unknown } }
  | { type: 'discussion:message'; payload: { message: unknown } };

export type LiveSyncStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export type LiveSyncStatusEvent = {
  status: LiveSyncStatus;
  error?: Error;
};

export interface LiveSyncAdapter {
  connect(
    onEvent: (event: LiveSyncEvent) => void,
    onStatus?: (event: LiveSyncStatusEvent) => void,
  ): void | Promise<void>;
  send(message: LiveSyncClientMessage): Promise<void>;
  disconnect(): void | Promise<void>;
  getServerTimestamp?(): number;
}

export type LiveSyncConfig = {
  adapter: LiveSyncAdapter;
  role?: LiveSyncRole;
  driftToleranceSeconds?: number;
};

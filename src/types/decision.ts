export type Decision = {
  cueId: string;
  choice: string;
  timestamp: number;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
};

export interface DecisionAdapter {
  saveDecision(decision: Decision): Promise<void>;
  getDecisionHistory(): Promise<Decision[]>;
  clearDecisionHistory(): Promise<void>;
}

export type PlaybackProgress = {
  position: number;
  duration?: number;
  updatedAt?: number;
  metadata?: Record<string, unknown>;
};

export type RemoteApiSyncOperation =
  | 'saveDecision'
  | 'getDecisionHistory'
  | 'clearDecisionHistory'
  | 'savePlaybackProgress'
  | 'getPlaybackProgress';

export type RemoteApiSyncEvent = {
  operation: RemoteApiSyncOperation;
  status: 'started' | 'succeeded' | 'failed';
  error?: Error;
};

export type RemoteApiDecisionAdapterOptions = {
  baseUrl: string;
  sessionId: string;
  userId?: string;
  headers?: Record<string, string>;
  endpoints?: {
    decisions?: string;
    playbackProgress?: string;
  };
  fetch?: typeof fetch;
  onSyncStatus?: (event: RemoteApiSyncEvent) => void;
};

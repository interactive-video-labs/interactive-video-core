export type DebugEventType = 'cue' | 'interaction' | 'segment' | 'state' | 'playback';

export type DebugEvent = {
  type: DebugEventType;
  playbackTime: number;
  timestamp: number;
  details: Record<string, string>;
};

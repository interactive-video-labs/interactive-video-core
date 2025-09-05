export type AnalyticsEvent =
  | 'PLAYER_LOADED'
  | 'VIDEO_STARTED'
  | 'VIDEO_PAUSED'
  | 'CUE_LOADED'
  | 'CUE_TRIGGERED'
  | 'INTERACTION_SHOWN'
  | 'INTERACTION_COMPLETED'
  | 'VIDEO_ENDED'
  | 'PLAYER_DESTROYED'
  | 'ERROR'
  | 'onCueEnter'
  | 'onPromptShown'
  | 'onInteractionSelected'
  | 'onBranchJump'
  | 'onSessionEnd';

export type AnalyticsPayload = {
  event: AnalyticsEvent;
  timestamp: number;
  cueId?: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

export interface AnalyticsHook {
  (payload?: AnalyticsPayload): void;
}

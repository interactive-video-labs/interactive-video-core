/**
 * Interactive Video Labs Player Types
 * This file defines the types and interfaces used in the IVLabsPlayer.
 * It includes types for player configuration, cue points, interactions, analytics,
 * and localization.
 */

export type PlayerConfig = {
  videoUrl?: string;
  cues?: CuePoint[];
  subtitlesUrl?: string;
  locale?: string;
  translations?: Record<string, Translations>;
  autoplay?: boolean;
  loop?: boolean;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  analyticsOptions?: Record<string, any>;
  interactions?: InteractionPayload[];
  initialState?: PlayerState;
  decisionAdapterType?: 'memory' | 'localStorage';
  decisionAdapter?: DecisionAdapter;
};

export type Translations = Record<string, string | Record<string, string>>;

export type CuePoint = {
  id: string;
  time: number; // in seconds
  subtitleText?: string;
  label?: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any; // arbitrary metadata for interaction
};

export type InteractionResponse = {
  cueId: string;
  choice: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
};

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

export type ChoiceVideoSegmentChangeOption = {
  level: string;
  video: string;
};

type BaseInteraction = {
  title?: string;
  description?: string;
  question: string;
};

export type ChoiceInteraction = BaseInteraction & {
  type: 'choice';
  options: string[];
  correctAnswer?: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: Record<string, any>;
};

export type TextInteraction = BaseInteraction & {
  type: 'text';
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: Record<string, any>;
};

export type RatingInteraction = BaseInteraction & {
  type: 'rating';
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: Record<string, any>;
};

export type ChoiceVideoSegmentChangeInteraction = BaseInteraction & {
  type: 'choice-video-segment-change';
  options: ChoiceVideoSegmentChangeOption[];
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: Record<string, any>;
};

export type InteractionPayload =
  | ChoiceInteraction
  | TextInteraction
  | RatingInteraction
  | ChoiceVideoSegmentChangeInteraction;

export type PlayerEvent =
  | 'play'
  | 'pause'
  | 'ended'
  | 'cue'
  | 'interaction'
  | 'branch'
  | 'error'
  | 'segmentchange';

export type InteractionSegment = {
  id: string;
  cueId: string;
  payload: InteractionPayload;
  triggerTime?: number;
};

export type PlayerState = 'idle' | 'playing' | 'waitingForInteraction' | 'ended' | 'error';

export interface HTMLVideoElementWithControlsList extends HTMLVideoElement {
  controlsList: string;
}

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

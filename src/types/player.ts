import { CuePoint } from './cue';
import { InteractionPayload } from './interaction';
import { DecisionAdapter } from './decision';
import { Translations } from './i18n';

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

export type PlayerEvent =
  | 'play'
  | 'pause'
  | 'ended'
  | 'cue'
  | 'interaction'
  | 'branch'
  | 'error'
  | 'segmentchange';

export type PlayerState = 'idle' | 'playing' | 'waitingForInteraction' | 'ended' | 'error';

export interface HTMLVideoElementWithControlsList extends HTMLVideoElement {
  controlsList: string;
}

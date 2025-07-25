

export type PlayerConfig = {
  videoUrl: string
  cues?: CuePoint[]
  subtitlesUrl?: string
  localization?: LocalizationStrings
  autoplay?: boolean
  loop?: boolean
  analyticsOptions?: Record<string, any>
  interactions?: InteractionPayload[]
  initialState?: PlayerState
}

export type CuePoint = {
  id: string
  time: number // in seconds
  label?: string
  payload?: any // arbitrary metadata for interaction
}

export type InteractionResponse = {
  cueId: string
  choice: string
  metadata?: Record<string, any>
}

export type LocalizationStrings = {
  [lang: string]: {
    [key: string]: string
  }
}

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

export type AnalyticsPayload = {
  event: AnalyticsEvent
  timestamp: number
  cueId?: string
  data?: any
}

export interface AnalyticsHook {
  (payload: AnalyticsPayload): void
}

export type InteractionPayload = {
  type: 'choice' | 'text' | 'rating'
  question: string
  options?: string[]
  correctAnswer?: string
}

export type PlayerEvent =
  | 'play'
  | 'pause'
  | 'ended'
  | 'cue'
  | 'interaction'
  | 'branch'
  | 'error'


export type InteractionSegment = {
  id: string
  cueId: string
  payload: InteractionPayload
  triggerTime?: number
}

export type PlayerState = 'idle' | 'playing' | 'waitingForInteraction' | 'ended' | 'error'
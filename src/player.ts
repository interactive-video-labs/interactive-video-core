import { StateMachine } from './stateMachine'
import { CueHandler } from './cueHandler'
import { InteractionManager } from './interactionManager'
import { Analytics } from './analytics'

import type {
  PlayerConfig,
  CuePoint,
  InteractionSegment,
  AnalyticsEvent,
  PlayerState,
  InteractionPayload
} from './types'

export class IVLabsPlayer {
  private videoElement: HTMLVideoElement
  private config: PlayerConfig
  private stateMachine: StateMachine
  private cueHandler: CueHandler
  private interactionManager: InteractionManager
  private analytics: Analytics

  constructor(videoElement: HTMLVideoElement, config: PlayerConfig) {
    this.videoElement = videoElement
    this.config = config

    this.analytics = new Analytics()
    this.stateMachine = new StateMachine(config.initialState || 'idle')
    this.interactionManager = new InteractionManager()
    this.cueHandler = new CueHandler(videoElement)
    this.cueHandler.registerCues(config.cues || [])

    this.bindEvents()
    this.cueHandler.start()
  }

  private bindEvents(): void {
    this.cueHandler.onCue((cue: CuePoint) => {
      this.stateMachine.transitionTo('waitingForInteraction') // Adjust as needed
      this.interactionManager.handleInteractionCue(cue)
      this.analytics.track('CUE_TRIGGERED', { event: 'CUE_TRIGGERED', cueId: cue.id, timestamp: Date.now() })
    })

    this.videoElement.addEventListener('play', () => {
      this.analytics.track('VIDEO_STARTED')
    })

    this.videoElement.addEventListener('pause', () => {
      this.analytics.track('VIDEO_PAUSED')
    })

    this.videoElement.addEventListener('ended', () => {
      this.analytics.track('VIDEO_ENDED')
    })
  }

  public loadCues(cues: CuePoint[]): void {
    this.cueHandler.loadCues(cues)
  }

  public loadInteractions(interactions: InteractionPayload[]): void {
    this.interactionManager.loadInteractions(interactions)
  }

  public getState(): PlayerState {
    return this.stateMachine.getState()
  }

  public destroy(): void {
    this.cueHandler.destroy()
    this.interactionManager.destroy()
    this.analytics.track('PLAYER_DESTROYED')
  }
}

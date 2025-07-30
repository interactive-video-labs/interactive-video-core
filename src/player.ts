import { StateMachine } from './stateMachine'
import { CueHandler } from './cueHandler'
import { InteractionManager } from './interactionManager'
import { Analytics } from './analytics'
import { SegmentManager } from './segmentManager'



import type {
  PlayerConfig,
  CuePoint,
  InteractionSegment,
  AnalyticsEvent,
  PlayerState,
  InteractionPayload,
  HTMLVideoElementWithControlsList
} from './types'


/**
 * The main class for the Interactive Video Labs Player.
 * This class orchestrates the video playback, cue handling, interaction management,
 * and analytics tracking.
 */
export class IVLabsPlayer {
  private videoElement: HTMLVideoElementWithControlsList
  private config: PlayerConfig
  private stateMachine: StateMachine
  private cueHandler: CueHandler
  private interactionManager: InteractionManager
  private analytics: Analytics
  private segmentManager: SegmentManager

  private videoContainer: HTMLElement

  constructor(target: string, config: PlayerConfig) {
    const targetElement = document.getElementById(target)
    if (!targetElement) throw new Error(`Target container with ID "${target}" not found.`)

    this.config = config
    this.videoContainer = document.createElement('div')
    this.videoContainer.className = 'ivl-player-container'

    this.videoElement = document.createElement('video') as HTMLVideoElementWithControlsList
    this.videoElement.controls = true
    this.videoElement.controlsList = 'nodownload'

    this.videoContainer.appendChild(this.videoElement)
    targetElement.innerHTML = ''
    targetElement.appendChild(this.videoContainer)

    this.analytics = new Analytics()
    this.stateMachine = new StateMachine(config.initialState || 'idle')
    this.interactionManager = new InteractionManager(this.videoContainer)
    this.cueHandler = new CueHandler(this.videoElement)
    this.cueHandler.registerCues(config.cues || [])
    this.segmentManager = new SegmentManager(this.videoElement)

    if (!config.videoUrl) throw new Error('videoUrl must be provided in the PlayerConfig.')
    this.videoElement.src = config.videoUrl

    this.bindEvents()
    this.cueHandler.start()
  }

  /**
   * Binds event listeners for cue handling, interaction response, and analytics.
   */
  private bindEvents(): void {
    this.cueHandler.onCue((cue: CuePoint) => {
      this.analytics.track('onCueEnter', { event: 'onCueEnter', cueId: cue.id, timestamp: Date.now() });

      if (cue.payload?.interaction) {
        this.videoElement.pause()
        this.stateMachine.transitionTo('waitingForInteraction')
        this.interactionManager.handleInteractionCue(cue)
        this.analytics.track('onPromptShown', { event: 'onPromptShown', cueId: cue.id, timestamp: Date.now() });
      } else {
        this.stateMachine.transitionTo('playing')
      }
    })


    this.interactionManager.onResponse((response: any, cue: CuePoint) => {
      this.analytics.track('onInteractionSelected', { event: 'onInteractionSelected', cueId: cue.id, data: { response }, timestamp: Date.now() });

      if (response && response.nextSegment) {
        this.analytics.track('onBranchJump', { event: 'onBranchJump', cueId: cue.id, data: { nextSegment: response.nextSegment }, timestamp: Date.now() });
        this.segmentManager.playSegment(response.nextSegment);
      } else {
        this.videoElement.play().catch(error => {
          console.error('Video playback failed:', error)
        })
      }
      console.log('Interaction response received: inside interaction manager :', response)
      this.stateMachine.transitionTo('playing')
      this.analytics.track('INTERACTION_COMPLETED', { event: 'INTERACTION_COMPLETED', cueId: cue.id, data: { response: response }, timestamp: Date.now() })
  

      console.log('Interaction response received:', response)
      this.stateMachine.transitionTo('playing')
      this.analytics.track('INTERACTION_COMPLETED', {
        event: 'INTERACTION_COMPLETED',
        cueId: cue.id,
        data: { response },
        timestamp: Date.now(),
      })
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

  /** Loads cue points into the player. */
  public loadCues(cues: CuePoint[]): void {
    this.cueHandler.loadCues(cues)
  }

  /** Loads interaction segments into the player. */
  public loadInteractions(interactions: CuePoint[]): void {
    this.interactionManager.loadInteractions(interactions)
  }

  /** Returns the current player state. */
  public getState(): PlayerState {
    return this.stateMachine.getState()
  }

  /** Plays the video. */
  public play(): void {
    this.videoElement.play()
  }

  /** Pauses the video. */
  public pause(): void {
    this.videoElement.pause()
  }

  /**
   * Registers a custom analytics hook for a specific event.
   * @param event - The event to listen for.
   * @param callback - The function to be called when the event is tracked.
   */
  public on(event: AnalyticsEvent, callback: (payload: AnalyticsPayload) => void): void {
    this.analytics.on(event, (event, payload) => callback(payload));
  }



  /** Cleans up the player, removes listeners and resets state. */
  public destroy(): void {
    console.log('IVLabsPlayer destroy() called.')
    this.cueHandler.destroy()
    this.interactionManager.destroy()
    this.analytics.track('onSessionEnd', { event: 'onSessionEnd', timestamp: Date.now() });
  }
}

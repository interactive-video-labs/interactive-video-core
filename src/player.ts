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

  private videoContainer: HTMLElement // New property for the video container

  constructor(target: string, config: PlayerConfig) {
    const targetElement = document.getElementById(target)

    if (!targetElement) {
      throw new Error(`Target container with ID "${target}" not found.`)
    }

    this.config = config

    // Create a container for the video and interactions
    this.videoContainer = document.createElement('div')
    this.videoContainer.className = 'ivl-player-container'

    // Create the video element
    this.videoElement = document.createElement('video')
    this.videoElement.src = this.config.videoUrl
    this.videoElement.controls = true

    // Add video to its container
    this.videoContainer.appendChild(this.videoElement)

    // Clear the target element and append the player
    targetElement.innerHTML = ''
    targetElement.appendChild(this.videoContainer)

    this.analytics = new Analytics()
    this.stateMachine = new StateMachine(config.initialState || 'idle')
    this.interactionManager = new InteractionManager(this.videoContainer)
    this.cueHandler = new CueHandler(this.videoElement)
    this.cueHandler.registerCues(config.cues || [])

    this.bindEvents()
    this.cueHandler.start()
  }

  private bindEvents(): void {
    this.cueHandler.onCue((cue: CuePoint) => {
      if (cue.payload && cue.payload.interaction) {
        this.videoElement.pause() // Pause the video on interaction
        this.stateMachine.transitionTo('waitingForInteraction') // Adjust as needed
        this.interactionManager.handleInteractionCue(cue)
        this.analytics.track('CUE_TRIGGERED', { event: 'CUE_TRIGGERED', cueId: cue.id, timestamp: Date.now() })
      } else {
        // If it's not an interaction cue, just track it and continue playing
        this.analytics.track('CUE_TRIGGERED', { event: 'CUE_TRIGGERED', cueId: cue.id, timestamp: Date.now() })
        this.stateMachine.transitionTo('playing')
      }
    })

    this.interactionManager.onResponse((response: any, cue: CuePoint) => {
      this.videoElement.play().catch(error => {
        console.error('Video playback failed:', error)
      })
      console.log('Interaction response received: inside interaction manager :', response)
      this.stateMachine.transitionTo('playing')
      this.analytics.track('INTERACTION_COMPLETED', { event: 'INTERACTION_COMPLETED', cueId: cue.id, data: { response: response }, timestamp: Date.now() })
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

  public play(): void {
    this.videoElement.play()
  }

  public pause(): void {
    this.videoElement.pause()
  }

  public destroy(): void {
    console.log('IVLabsPlayer destroy() called.');
    this.cueHandler.destroy()
    this.interactionManager.destroy()
    this.analytics.track('PLAYER_DESTROYED')
  }
}

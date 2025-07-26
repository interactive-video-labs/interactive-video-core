import { AnalyticsEvent, AnalyticsPayload } from './types'

type AnalyticsHook = (event: AnalyticsEvent, payload?: AnalyticsPayload) => void

/**
 * Handles analytics tracking for the player.
 * This class provides a simple interface for tracking events and allows
 * for the registration of custom hooks to process analytics data.
 */
export class Analytics {
  private hooks: AnalyticsHook[] = []


  /**
   * Initializes the Analytics instance.
   * @param options - Optional configuration for the analytics instance.
   */
  constructor(private options: Record<string, any> = {}) {
    // you can optionally use options here
    if (this.options.debug) {
      console.log('[Analytics] Initialized with options:', this.options)
    }
  }


  /**
   * Registers a new analytics hook.
   * @param hook - The function to be called when an event is tracked.
   */
  onTrack(hook: AnalyticsHook) {
    this.hooks.push(hook)
  }


  /**
   * Tracks an event with optional payload.
   * @param event - The event to be tracked.
   * @param payload - Optional data associated with the event.
   */
  track(event: AnalyticsEvent, payload?: AnalyticsPayload) {
    this.hooks.forEach((hook) => hook(event, payload))
  }


  /**
   * Resets the analytics hooks.
   */
  reset() {
    this.hooks = []
  }
}

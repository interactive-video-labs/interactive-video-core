import { AnalyticsEvent, AnalyticsPayload } from './types'

type AnalyticsHook = (event: AnalyticsEvent, payload?: AnalyticsPayload) => void

/**
 * Handles analytics tracking for the player.
 * This class provides a simple interface for tracking events and allows
 * for the registration of custom hooks to process analytics data.
 */
export class Analytics {
  private hooks: AnalyticsHook[] = []

  constructor(private options: Record<string, any> = {}) {
    // you can optionally use options here
    if (this.options.debug) {
      console.log('[Analytics] Initialized with options:', this.options)
    }
  }

  onTrack(hook: AnalyticsHook) {
    this.hooks.push(hook)
  }

  track(event: AnalyticsEvent, payload?: AnalyticsPayload) {
    this.hooks.forEach((hook) => hook(event, payload))
  }

  reset() {
    this.hooks = []
  }
}

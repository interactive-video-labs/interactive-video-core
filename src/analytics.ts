import { AnalyticsEvent, AnalyticsPayload } from './types'

type AnalyticsHook = (event: AnalyticsEvent, payload?: AnalyticsPayload) => void

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

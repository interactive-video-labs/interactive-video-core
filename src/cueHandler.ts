import { CuePoint as Cue } from "./types"

export type CueCallback = (cue: Cue) => void

export class CueHandler {
  private cues: Cue[] = []
  private callback?: CueCallback
  private triggered: Set<number> = new Set()
  private videoElement: HTMLVideoElement

  constructor(video: HTMLVideoElement) {
    this.videoElement = video
    this.handleTimeUpdate = this.handleTimeUpdate.bind(this)
  }

  public registerCues(cues: Cue[]) {
    this.cues = cues.sort((a, b) => a.time - b.time)
    this.triggered.clear()
  }
  public loadCues(cues: Cue[]) {
    this.registerCues(cues)
    this.videoElement.addEventListener("timeupdate", this.handleTimeUpdate)
  }


  public onCue(callback: CueCallback) {
    this.callback = callback
  }

  public start() {
    this.videoElement.addEventListener('timeupdate', this.handleTimeUpdate)
  }

  public stop() {
    this.videoElement.removeEventListener('timeupdate', this.handleTimeUpdate)
  }

  private handleTimeUpdate() {
    const currentTime = this.videoElement.currentTime

    for (const cue of this.cues) {
      if (!this.triggered.has(cue.time) && currentTime >= cue.time) {
        this.triggered.add(cue.time)
        this.callback?.(cue)
      }
    }
  }

  public destroy() {
    this.triggered.clear()
  }
}

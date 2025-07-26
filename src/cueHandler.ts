import { CuePoint as Cue } from "./types"

export type CueCallback = (cue: Cue) => void

/**
 * Manages and triggers cue points during video playback.
 * This class is responsible for registering cue points, listening for video
 * time updates, and triggering registered callbacks when a cue point is reached.
 */
export class CueHandler {
  private cues: Cue[] = []
  private callback?: CueCallback
  private triggered: Set<number> = new Set()
  private videoElement: HTMLVideoElement

  /**
   * Creates an instance of CueHandler.
   * @param video - The HTMLVideoElement to monitor for cue points.
   */
  constructor(video: HTMLVideoElement) {
    this.videoElement = video
    this.handleTimeUpdate = this.handleTimeUpdate.bind(this)
  }


  /**
   * Registers cue points and sets up the video element to listen for time updates.
   * @param cues - An array of Cue objects to register.
   */
  public registerCues(cues: Cue[]) {
    this.cues = cues.sort((a, b) => a.time - b.time)
    this.triggered.clear()
  }

  public loadCues(cues: Cue[]) {
    this.registerCues(cues)
    this.videoElement.addEventListener("timeupdate", this.handleTimeUpdate)
  }

  /**
   * Sets the callback function to be called when a cue point is reached.
   * @param callback - The callback function to be executed.
   */
  public onCue(callback: CueCallback) {
    this.callback = callback
  }

  /**
   * Starts listening for cue points.
   */
  public start() {
    this.videoElement.addEventListener('timeupdate', this.handleTimeUpdate)
  }


  /**
   * Stops listening for cue points.
   */
  public stop() {
    this.videoElement.removeEventListener('timeupdate', this.handleTimeUpdate)
  }


  /**
   *  Handles the time update event from the video element.
   *  Checks if the current time matches any registered cue points and triggers the callback.
   */
  private handleTimeUpdate() {
    const currentTime = this.videoElement.currentTime

    for (const cue of this.cues) {
      if (!this.triggered.has(cue.time) && currentTime >= cue.time) {
        this.triggered.add(cue.time)
        this.callback?.(cue)
      }
    }
  }


  /**
   * Destroys the CueHandler instance.
   */
  public destroy() {
    this.triggered.clear()
  }
}

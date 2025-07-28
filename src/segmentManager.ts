import { HTMLVideoElementWithControlsList } from './types';

/**
 * Manages the logic for switching to and from video segments.
 */
export class SegmentManager {
  private videoElement: HTMLVideoElementWithControlsList;
  private _mainVideoSrc: string | null = null;
  private _mainVideoCurrentTime: number = 0;

  constructor(videoElement: HTMLVideoElementWithControlsList) {
    this.videoElement = videoElement;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.videoElement.addEventListener('ended', () => {
      if (this._mainVideoSrc) {
        console.log('Segment ended. Resuming main video:', this._mainVideoSrc);

        const resumeSrc = this._mainVideoSrc;
        const resumeTime = this._mainVideoCurrentTime;

        this._mainVideoSrc = null;
        this._mainVideoCurrentTime = 0;

        this.videoElement.src = resumeSrc;
        this.videoElement.load();

        this.videoElement.addEventListener('loadedmetadata', () => {
          this.videoElement.currentTime = resumeTime;
          this.videoElement.play().catch(err => {
            console.error('Error resuming main video:', err);
          });
        }, { once: true });
      }
    });
  }

  /**
   * Handles the transition to a new video segment.
   * Saves the current main video state and plays the new segment.
   * @param newSegmentUrl The URL of the new video segment to play.
   */
  public playSegment(newSegmentUrl: string): void {
    this._mainVideoSrc = this.videoElement.src;
    this._mainVideoCurrentTime = this.videoElement.currentTime;

    this.videoElement.src = newSegmentUrl;
    this.videoElement.load();
    this.videoElement.addEventListener('loadedmetadata', () => {
      this.videoElement.play().catch(error => {
        console.error('Error playing segment video:', error);
      });
      console.log('Playing segment video:', newSegmentUrl);
    }, { once: true });
  }

  /**
   * Destroys the SegmentChangeManager instance.
   * Removes event listeners.
   */
  public destroy(): void {
    // No specific cleanup needed for event listeners added with { once: true }
    // If other persistent listeners were added, they would be removed here.
  }
}

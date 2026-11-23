import { HTMLVideoElementWithControlsList } from './types';

/**
 * Manages the logic for switching to and from video segments.
 */
export class SegmentManager {
  private videoElement: HTMLVideoElementWithControlsList;
  private _mainVideoSrc: string | null = null;
  private _mainVideoCurrentTime: number = 0;
  private segmentChangeCallback?: (
    from: string,
    to: string,
    mainVideoTimestamp?: number,
    isPlaying?: boolean,
  ) => void;

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
        const segmentSrc = this.videoElement.src;

        this._mainVideoSrc = null;
        this._mainVideoCurrentTime = 0;

        this.videoElement.src = resumeSrc;
        this.segmentChangeCallback?.(segmentSrc, resumeSrc, resumeTime, true);
        this.videoElement.load();

        this.videoElement.addEventListener(
          'loadedmetadata',
          () => {
            this.videoElement.currentTime = resumeTime;
            this.videoElement.play().catch((err) => {
              console.error('Error resuming main video:', err);
            });
          },
          { once: true },
        );
      }
    });
  }

  /**
   * Handles the transition to a new video segment.
   * Saves the current main video state and plays the new segment.
   * @param newSegmentUrl The URL of the new video segment to play.
   */
  public playSegment(newSegmentUrl: string): void {
    if (!this._mainVideoSrc) {
      this._mainVideoSrc = this.videoElement.src;
      this._mainVideoCurrentTime = this.videoElement.currentTime;
    }

    this.activateSegment(newSegmentUrl, this._mainVideoCurrentTime);
  }

  public syncSegment(segmentUrl: string, mainVideoUrl: string, mainVideoTimestamp: number): void {
    this._mainVideoSrc = mainVideoUrl;
    this._mainVideoCurrentTime = mainVideoTimestamp;
    this.activateSegment(segmentUrl, mainVideoTimestamp);
  }

  public syncMainVideo(videoUrl: string): void {
    const currentSrc = this.videoElement.src;
    this._mainVideoSrc = null;
    this._mainVideoCurrentTime = 0;
    if (this.sourcesMatch(currentSrc, videoUrl)) return;

    this.videoElement.src = videoUrl;
    this.segmentChangeCallback?.(currentSrc, videoUrl);
    this.videoElement.load();
  }

  private activateSegment(newSegmentUrl: string, mainVideoTimestamp: number): void {
    const currentSrc = this.videoElement.src;
    if (this.sourcesMatch(currentSrc, newSegmentUrl)) return;
    this.videoElement.src = newSegmentUrl;
    this.segmentChangeCallback?.(currentSrc, newSegmentUrl, mainVideoTimestamp, true);
    this.videoElement.load();
    this.videoElement.addEventListener(
      'loadedmetadata',
      () => {
        this.videoElement.play().catch((error) => {
          console.error('Error playing segment video:', error);
        });
        console.log('Playing segment video:', newSegmentUrl);
      },
      { once: true },
    );
  }

  public onSegmentChange(
    callback: (from: string, to: string, mainVideoTimestamp?: number, isPlaying?: boolean) => void,
  ): void {
    this.segmentChangeCallback = callback;
  }

  private sourcesMatch(currentSource: string, targetSource: string): boolean {
    if (currentSource === targetSource) return true;
    try {
      return (
        new URL(currentSource, document.baseURI).href ===
        new URL(targetSource, document.baseURI).href
      );
    } catch {
      return false;
    }
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

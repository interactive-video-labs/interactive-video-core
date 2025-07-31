import { CuePoint } from './types';

/**
 * Represents an extended text track cue with additional properties.
 */
interface ExtendedTextTrackCue extends TextTrackCue {
  text: string;
}

/**
 * Manages subtitles for a video element.
 * Handles loading and processing of subtitle cues.
 */
export class SubtitlesManager {
  private subtitlesElement: HTMLTrackElement;
  private cuePoints: CuePoint[] = [];

  /**
   * Creates an instance of SubtitlesManager.
   * @param subtitlesElement - The HTML track element for subtitles.
   * @param cuePoints - Optional array of cue points to initialize with.
   */
  constructor(subtitlesElement: HTMLTrackElement, cuePoints: CuePoint[] = []) {
    this.subtitlesElement = subtitlesElement;
    this.cuePoints = cuePoints;
  }

  /**
   * Registers a callback to be invoked when subtitles are loaded or an error occurs.
   * @param callback - A function to be called with the loaded cues or the initial cues if an error occurs.
   */
  public onLoad(callback: (cues?: CuePoint[]) => void): void {
    this.subtitlesElement.addEventListener('load', () => {
      const trackCues = Array.from(this.subtitlesElement.track.cues || []);
      const cues = this.cuePoints.map((cueConfig) => ({
        ...cueConfig,
        time:
          trackCues.find(
            (cue) =>
              (cue as ExtendedTextTrackCue)?.text === cueConfig.subtitleText
          )?.startTime || 0,
      }));
      callback(cues);
    });
    this.subtitlesElement.addEventListener('error', (error) => {
      console.error('Failed to load subtitles:', error);
      callback(this.cuePoints);
    });
  }
}

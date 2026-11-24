import { describe, expect, it, vi } from 'vitest';
import { SubtitlesManager } from '../src/subtitlesManager';

describe('SubtitlesManager', () => {
  it('preserves non-subtitle cue times and remaps only matching subtitle cues', () => {
    const trackElement = document.createElement('track');
    Object.defineProperty(trackElement, 'track', {
      value: {
        cues: [
          { text: 'Matching subtitle', startTime: 0 },
          { text: 'Other subtitle', startTime: 14 },
        ],
      },
    });
    const cues = [
      { id: 'interaction', time: 7 },
      { id: 'subtitle-match', time: 12, subtitleText: 'Matching subtitle' },
      { id: 'subtitle-missing', time: 18, subtitleText: 'Subtitle not present' },
    ];
    const onLoad = vi.fn();

    new SubtitlesManager(trackElement, cues).onLoad(onLoad);
    trackElement.dispatchEvent(new Event('load'));

    expect(onLoad).toHaveBeenCalledWith([
      { id: 'interaction', time: 7 },
      { id: 'subtitle-match', time: 0, subtitleText: 'Matching subtitle' },
      { id: 'subtitle-missing', time: 18, subtitleText: 'Subtitle not present' },
    ]);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SegmentManager } from '../src/segmentManager';
import { HTMLVideoElementWithControlsList } from '../src/types';

describe('SegmentManager', () => {
  let videoElement: HTMLVideoElementWithControlsList;
  let segmentManager: SegmentManager;

  beforeEach(() => {
    videoElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      src: 'main.mp4',
      currentTime: 10,
      load: vi.fn(),
      play: vi.fn(() => Promise.resolve()),
      pause: vi.fn(),
      controlsList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
        toggle: vi.fn(),
        length: 0,
        entries: vi.fn(),
        forEach: vi.fn(),
        item: vi.fn(),
        keys: vi.fn(),
        values: vi.fn(),
        [Symbol.iterator]: vi.fn(),
      }
    } as unknown as HTMLVideoElementWithControlsList;

    segmentManager = new SegmentManager(videoElement);
  });

  it('should bind the ended event on construction', () => {
    expect(videoElement.addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
  });

  describe('playSegment', () => {
    it('should save main video state, change src, and play the segment', () => {
      const segmentUrl = 'segment1.mp4';
      segmentManager.playSegment(segmentUrl);

      // Type assertion to access private properties for testing
      const sm = segmentManager as any;
      expect(sm._mainVideoSrc).toBe('main.mp4');
      expect(sm._mainVideoCurrentTime).toBe(10);

      expect(videoElement.src).toBe(segmentUrl);
      expect(videoElement.load).toHaveBeenCalled();
      expect(videoElement.addEventListener).toHaveBeenCalledWith('loadedmetadata', expect.any(Function), { once: true });

      // Simulate 'loadedmetadata' event
      const loadedMetadataCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'loadedmetadata')[1];
      loadedMetadataCallback();

      expect(videoElement.play).toHaveBeenCalled();
    });
  });

  describe('ended event handling', () => {
    it('should resume main video when a segment ends', () => {
      // Start playing a segment
      const segmentUrl = 'segment1.mp4';
      segmentManager.playSegment(segmentUrl);

      // Simulate 'loadedmetadata' for segment video to trigger the first play
      const segmentLoadedMetadataCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'loadedmetadata')[1];
      segmentLoadedMetadataCallback();

      // Simulate 'ended' event for the segment
      const endedCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'ended')[1];
      endedCallback();

      expect(videoElement.src).toBe('main.mp4');
      expect(videoElement.load).toHaveBeenCalledTimes(2); // Once for segment, once for main

      // Simulate 'loadedmetadata' for resuming main video
      const allLoadedMetadataCalls = (videoElement.addEventListener as vi.Mock).mock.calls.filter(call => call[0] === 'loadedmetadata');
      const mainVideoLoadedMetadataCallback = allLoadedMetadataCalls[allLoadedMetadataCalls.length - 1][1];
      mainVideoLoadedMetadataCallback();

      expect(videoElement.currentTime).toBe(10);
      expect(videoElement.play).toHaveBeenCalledTimes(2); // Once for segment, once for main
    });

    it('should do nothing on ended event if not in a segment', () => {
        const originalSrc = videoElement.src;
        const originalTime = videoElement.currentTime;
        const endedCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'ended')[1];
        endedCallback();

        expect(videoElement.src).toBe(originalSrc);
        expect(videoElement.currentTime).toBe(originalTime);
        expect(videoElement.load).not.toHaveBeenCalled();
    });
  });

  it('should have a destroy method that does not throw', () => {
    expect(() => segmentManager.destroy()).not.toThrow();
  });
});

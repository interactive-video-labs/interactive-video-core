import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CueHandler, CueCallback } from '../src/cueHandler';
import { CuePoint } from '../src/types';

describe('CueHandler', () => {
  let videoElement: HTMLVideoElement;
  let cueHandler: CueHandler;
  let mockCallback: CueCallback;

  beforeEach(() => {
    vi.clearAllMocks();

    videoElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      currentTime: 0,
    } as unknown as HTMLVideoElement;

    cueHandler = new CueHandler(videoElement);
    mockCallback = vi.fn();
    cueHandler.onCue(mockCallback);
  });

  it('should register cues and sort them by time', () => {
    const cues: CuePoint[] = [
      { id: 'cue2', time: 10 },
      { id: 'cue1', time: 5 },
      { id: 'cue3', time: 2 },
    ];
    cueHandler.registerCues(cues);

    // @ts-ignore - Accessing private property for testing
    expect(cueHandler.cues).toEqual([
      { id: 'cue3', time: 2 },
      { id: 'cue1', time: 5 },
      { id: 'cue2', time: 10 },
    ]);
    // @ts-ignore
    expect(cueHandler.triggered.size).toBe(0);
  });

  it('should add timeupdate listener on start', () => {
    cueHandler.start();
    expect(videoElement.addEventListener).toHaveBeenCalledWith('timeupdate', expect.any(Function));
  });

  it('should remove timeupdate listener on stop', () => {
    cueHandler.stop();
    expect(videoElement.removeEventListener).toHaveBeenCalledWith(
      'timeupdate',
      expect.any(Function),
    );
  });

  it('should trigger cues at the correct time', () => {
    const cues: CuePoint[] = [
      { id: 'cue1', time: 5 },
      { id: 'cue2', time: 10 },
    ];
    cueHandler.registerCues(cues);

    // Simulate time update to 4 seconds
    Object.defineProperty(videoElement, 'currentTime', { value: 4 });
    // @ts-ignore
    cueHandler.handleTimeUpdate();
    expect(mockCallback).not.toHaveBeenCalled();

    // Simulate time update to 5 seconds (cue1 should trigger)
    Object.defineProperty(videoElement, 'currentTime', { value: 5 });
    // @ts-ignore
    cueHandler.handleTimeUpdate();
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(cues[0]);

    // Simulate time update to 7 seconds (no new cue)
    Object.defineProperty(videoElement, 'currentTime', { value: 7 });
    // @ts-ignore
    cueHandler.handleTimeUpdate();
    expect(mockCallback).toHaveBeenCalledTimes(1); // Still 1

    // Simulate time update to 10 seconds (cue2 should trigger)
    Object.defineProperty(videoElement, 'currentTime', { value: 10 });
    // @ts-ignore
    cueHandler.handleTimeUpdate();
    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenCalledWith(cues[1]);
  });

  it('should not trigger the same cue multiple times', () => {
    const cues: CuePoint[] = [{ id: 'cue1', time: 5 }];
    cueHandler.registerCues(cues);

    Object.defineProperty(videoElement, 'currentTime', { value: 5 });
    // @ts-ignore
    cueHandler.handleTimeUpdate();
    expect(mockCallback).toHaveBeenCalledTimes(1);

    Object.defineProperty(videoElement, 'currentTime', { value: 6 });
    // @ts-ignore
    cueHandler.handleTimeUpdate();
    expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it('should clear triggered cues on destroy', () => {
    const cues: CuePoint[] = [{ id: 'cue1', time: 5 }];
    cueHandler.registerCues(cues);

    Object.defineProperty(videoElement, 'currentTime', { value: 5 });
    // @ts-ignore
    cueHandler.handleTimeUpdate();
    // @ts-ignore
    expect(cueHandler.triggered.size).toBe(1);

    cueHandler.destroy();
    // @ts-ignore
    expect(cueHandler.triggered.size).toBe(0);
  });

  it('should call loadCues correctly', () => {
    const cues: CuePoint[] = [{ id: 'cue1', time: 5 }];
    const registerCuesSpy = vi.spyOn(cueHandler, 'registerCues');
    cueHandler.loadCues(cues);
    expect(registerCuesSpy).toHaveBeenCalledWith(cues);
    expect(videoElement.addEventListener).toHaveBeenCalledWith('timeupdate', expect.any(Function));
  });
});

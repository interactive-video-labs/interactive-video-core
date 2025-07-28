import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IVLabsPlayer } from '../src/player';
import { StateMachine } from '../src/stateMachine';
import { CueHandler } from '../src/cueHandler';
import { InteractionManager } from '../src/interactionManager';
import { Analytics } from '../src/analytics';
import { PlayerConfig, CuePoint } from '../src/types';

// Mock dependencies
vi.mock('../src/stateMachine');
vi.mock('../src/cueHandler');
vi.mock('../src/interactionManager');
vi.mock('../src/analytics');

describe('IVLabsPlayer', () => {
  let videoElement: HTMLVideoElement;
  let config: PlayerConfig;
  let player: IVLabsPlayer;
  let mockStateMachineInstance: StateMachine;
  let mockCueHandlerInstance: CueHandler;
  let mockInteractionManagerInstance: InteractionManager;
  let mockAnalyticsInstance: Analytics;
  let mockPlayerContainer: HTMLElement;
  let mockTargetElement: HTMLElement;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock HTMLVideoElement properties and methods
    videoElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      currentTime: 0,
      pause: vi.fn(),
      play: vi.fn(() => Promise.resolve()),
      src: '',
      controls: false,
      load: vi.fn(), // Add load method to mock
    } as unknown as HTMLVideoElement;

    // Mock HTMLElement for player container and target element
    mockPlayerContainer = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      innerHTML: '',
      className: '',
    } as unknown as HTMLElement;

    mockTargetElement = {
      appendChild: vi.fn(),
      innerHTML: '',
    } as unknown as HTMLElement;

    // Mock document.createElement and document.getElementById
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'video') {
        return videoElement;
      } else if (tagName === 'div') {
        return mockPlayerContainer;
      }
      return {} as HTMLElement; // Fallback for other elements
    });

    vi.spyOn(document, 'getElementById').mockReturnValue(mockTargetElement);

    config = {
      videoUrl: 'main-video.mp4',
      videoSegments: ['test1.mp4', 'test2.mp4'],
      cues: [
        { id: 'cue1', time: 5 },
        { id: 'cue2', time: 10 },
      ],
      initialState: 'idle',
    };

    // Create a new player instance for each test
    player = new IVLabsPlayer('test-target', config);

    // Get mock instances for easier assertion
    mockStateMachineInstance = (StateMachine as vi.Mock).mock.instances[0];
    mockCueHandlerInstance = (CueHandler as vi.Mock).mock.instances[0];
    mockInteractionManagerInstance = (InteractionManager as vi.Mock).mock.instances[0];
    mockAnalyticsInstance = (Analytics as vi.Mock).mock.instances[0];
  });

  it('should initialize dependencies correctly and register cues', () => {
    expect(StateMachine).toHaveBeenCalledWith('idle');
    expect(InteractionManager).toHaveBeenCalledWith(mockPlayerContainer);
    expect(CueHandler).toHaveBeenCalledWith(videoElement);
    expect(Analytics).toHaveBeenCalledTimes(1);
    expect(mockCueHandlerInstance.registerCues).toHaveBeenCalledWith(config.cues);
    expect(mockCueHandlerInstance.start).toHaveBeenCalledTimes(1);
    expect(mockCueHandlerInstance.onCue).toHaveBeenCalledWith(expect.any(Function));
    expect(mockInteractionManagerInstance.onResponse).toHaveBeenCalledWith(expect.any(Function));
  });

  describe('Video Event Handling', () => {
    let playCallback: EventListener;
    let pauseCallback: EventListener;
    let endedCallback: EventListener;

    beforeEach(() => {
      // Extract event listener callbacks
      playCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'play')[1];
      pauseCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'pause')[1];
      const endedCalls = (videoElement.addEventListener as vi.Mock).mock.calls.filter(call => call[0] === 'ended');
      endedCallback = endedCalls[endedCalls.length - 1][1];
    });

    it('should bind video events', () => {
      expect(videoElement.addEventListener).toHaveBeenCalledWith('play', expect.any(Function));
      expect(videoElement.addEventListener).toHaveBeenCalledWith('pause', expect.any(Function));
      expect(videoElement.addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
    });

    it('should track VIDEO_STARTED on play event', () => {
      playCallback();
      expect(mockAnalyticsInstance.track).toHaveBeenCalledWith('VIDEO_STARTED');
    });

    it('should track VIDEO_PAUSED on pause event', () => {
      pauseCallback();
      expect(mockAnalyticsInstance.track).toHaveBeenCalledWith('VIDEO_PAUSED');
    });

    it('should track VIDEO_ENDED on ended event', () => {
      endedCallback();
      expect(mockAnalyticsInstance.track).toHaveBeenCalledWith('VIDEO_ENDED');
    });
  });

  it('should change video segment on interaction response with nextSegment', () => {
    const onResponseCallback = (mockInteractionManagerInstance.onResponse as vi.Mock).mock.calls[0][0];
    const initialSrc = videoElement.src;
    onResponseCallback({ nextSegment: 'test2.mp4' }, { id: 'testCue' });

    // Capture loadedmetadata callback after onResponse is called
    const loadedmetadataCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'loadedmetadata')[1];

    // Simulate loadedmetadata for segment video
    loadedmetadataCallback();

    expect(videoElement.src).toBe('test2.mp4');
    expect(videoElement.play).toHaveBeenCalled();
  });

  it('should resume main video after segment video ends', () => {
    const onResponseCallback = (mockInteractionManagerInstance.onResponse as vi.Mock).mock.calls[0][0];
    const endedCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'ended')[1];

    // Set initial main video state
    videoElement.src = 'main-video.mp4';
    videoElement.currentTime = 10;
    const initialMainVideoSrc = videoElement.src;
    const initialMainVideoCurrentTime = videoElement.currentTime;

    // Simulate interaction response to play segment video
    onResponseCallback({ nextSegment: 'segment-video.mp4' }, { id: 'testCue' });

    // Capture loadedmetadata callback after onResponse is called
    const loadedmetadataCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'loadedmetadata')[1];

    // Simulate loadedmetadata for segment video
    loadedmetadataCallback();

    // Simulate segment video ending
    endedCallback();

    // Simulate loadedmetadata for main video after it's restored
    const mainVideoLoadedMetadataCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'loadedmetadata' && call[2]?.once === true)[1];
    mainVideoLoadedMetadataCallback();

    // Expect main video to be restored and played
    expect(videoElement.src).toBe(initialMainVideoSrc);
    expect(videoElement.currentTime).toBe(initialMainVideoCurrentTime);
    expect(videoElement.play).toHaveBeenCalledTimes(2); // Once for segment, once for main
  });

  it('should handle cue triggered event by transitioning state and handling interaction', () => {
    const mockCue: CuePoint = { id: 'testCue', time: 10, payload: { interaction: { type: 'choice', question: 'test' } } };
    // Simulate cueHandler.onCue callback
    const onCueCallback = (mockCueHandlerInstance.onCue as vi.Mock).mock.calls[0][0];
    onCueCallback(mockCue);

    expect(mockStateMachineInstance.transitionTo).toHaveBeenCalledWith('waitingForInteraction');
    expect(mockInteractionManagerInstance.handleInteractionCue).toHaveBeenCalledWith(mockCue);
    expect(mockAnalyticsInstance.track).toHaveBeenCalledWith('CUE_TRIGGERED', expect.any(Object));
  });

  it('should load new cues via cue handler', () => {
    const newCues: CuePoint[] = [{ id: 'newCue', time: 20 }];
    player.loadCues(newCues);
    expect(mockCueHandlerInstance.loadCues).toHaveBeenCalledWith(newCues);
  });

  it('should load new interactions via interaction manager', () => {
    const newInteractions = [{ type: 'choice', question: 'test' }];
    player.loadInteractions(newInteractions);
    expect(mockInteractionManagerInstance.loadInteractions).toHaveBeenCalledWith(newInteractions);
  });

  it('should return the current state from the state machine', () => {
    (mockStateMachineInstance.getState as vi.Mock).mockReturnValue('playing');
    expect(player.getState()).toBe('playing');
  });

  it('should pause the video element', () => {
    player.pause();
    expect(videoElement.pause).toHaveBeenCalledTimes(1);
  });

  it('should destroy dependencies and track PLAYER_DESTROYED on player destroy', () => {
    player.destroy();
    expect(mockCueHandlerInstance.destroy).toHaveBeenCalledTimes(1);
    expect(mockInteractionManagerInstance.destroy).toHaveBeenCalledTimes(1);
    expect(mockAnalyticsInstance.track).toHaveBeenCalledWith('PLAYER_DESTROYED');
  });
});

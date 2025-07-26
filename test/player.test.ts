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

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock HTMLVideoElement
    videoElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      currentTime: 0,
      pause: vi.fn(), // Mock the pause method
    } as unknown as HTMLVideoElement;

    config = {
      videoUrl: 'test.mp4',
      cues: [
        { id: 'cue1', time: 5 },
        { id: 'cue2', time: 10 },
      ],
      initialState: 'idle',
    };

    player = new IVLabsPlayer(videoElement, config);
  });

  it('should initialize dependencies correctly', () => {
    expect(StateMachine).toHaveBeenCalledWith('idle');
    expect(InteractionManager).toHaveBeenCalledTimes(1);
    expect(CueHandler).toHaveBeenCalledWith(videoElement);
    expect(Analytics).toHaveBeenCalledTimes(1);
    expect(CueHandler.prototype.registerCues).toHaveBeenCalledWith(config.cues);
    expect(CueHandler.prototype.start).toHaveBeenCalledTimes(1);
  });

  it('should bind video events', () => {
    expect(videoElement.addEventListener).toHaveBeenCalledWith('play', expect.any(Function));
    expect(videoElement.addEventListener).toHaveBeenCalledWith('pause', expect.any(Function));
    expect(videoElement.addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
  });

  it('should handle cue triggered event', () => {
    const mockCue: CuePoint = { id: 'testCue', time: 10 };
    // Simulate cueHandler.onCue callback
    const onCueCallback = (CueHandler.prototype.onCue as vi.Mock).mock.calls[0][0];
    onCueCallback(mockCue);

    expect(StateMachine.prototype.transitionTo).toHaveBeenCalledWith('waitingForInteraction');
    expect(InteractionManager.prototype.handleInteractionCue).toHaveBeenCalledWith(mockCue);
    expect(Analytics.prototype.track).toHaveBeenCalledWith('CUE_TRIGGERED', expect.any(Object));
  });

  it('should call analytics track on video play', () => {
    const playCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'play')[1];
    playCallback();
    expect(Analytics.prototype.track).toHaveBeenCalledWith('VIDEO_STARTED');
  });

  it('should call analytics track on video pause', () => {
    const pauseCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'pause')[1];
    pauseCallback();
    expect(Analytics.prototype.track).toHaveBeenCalledWith('VIDEO_PAUSED');
  });

  it('should call analytics track on video ended', () => {
    const endedCallback = (videoElement.addEventListener as vi.Mock).mock.calls.find(call => call[0] === 'ended')[1];
    endedCallback();
    expect(Analytics.prototype.track).toHaveBeenCalledWith('VIDEO_ENDED');
  });

  it('should load cues via cue handler', () => {
    const newCues: CuePoint[] = [{ id: 'newCue', time: 20 }];
    player.loadCues(newCues);
    expect(CueHandler.prototype.loadCues).toHaveBeenCalledWith(newCues);
  });

  it('should load interactions via interaction manager', () => {
    const newInteractions = [{ type: 'choice', question: 'test' }];
    player.loadInteractions(newInteractions);
    expect(InteractionManager.prototype.loadInteractions).toHaveBeenCalledWith(newInteractions);
  });

  it('should return current state from state machine', () => {
    (StateMachine.prototype.getState as vi.Mock).mockReturnValue('playing');
    expect(player.getState()).toBe('playing');
  });

  it('should destroy dependencies on player destroy', () => {
    player.destroy();
    expect(CueHandler.prototype.destroy).toHaveBeenCalledTimes(1);
    expect(InteractionManager.prototype.destroy).toHaveBeenCalledTimes(1);
    expect(Analytics.prototype.track).toHaveBeenCalledWith('PLAYER_DESTROYED');
  });
});
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TimelineDebugger } from '../src/timelineDebugger';
import { CuePoint, PlayerState } from '../src/types';

describe('TimelineDebugger', () => {
  let video: HTMLVideoElement;
  let container: HTMLElement;
  let state: PlayerState;
  let debuggerView: TimelineDebugger;

  const cues: CuePoint[] = [
    { id: 'notice', time: 12, label: 'Notice', subtitleText: 'A line of text' },
    {
      id: 'question',
      time: 30,
      payload: { interaction: { type: 'choice', question: 'Choose', options: ['A', 'B'] } },
    },
  ];

  beforeEach(() => {
    video = document.createElement('video');
    Object.defineProperty(video, 'duration', { configurable: true, value: 60 });
    Object.defineProperty(video, 'currentTime', { configurable: true, writable: true, value: 5 });
    container = document.createElement('div');
    document.body.appendChild(container);
    state = 'idle';
    debuggerView = new TimelineDebugger(video, container, cues, () => state);
  });

  it('starts hidden and toggles the overlay accessibly', () => {
    const toggle = container.querySelector<HTMLButtonElement>('.ivl-debugger-toggle');
    const panel = container.querySelector<HTMLElement>('.ivl-debugger-panel');

    expect(panel?.hidden).toBe(true);
    toggle?.click();
    expect(panel?.hidden).toBe(false);
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    toggle?.click();
    expect(panel?.hidden).toBe(true);
  });

  it('renders cue types, upcoming cues, playback time, and hover metadata', () => {
    video.dispatchEvent(new Event('timeupdate'));

    const markers = container.querySelectorAll('.ivl-debugger-marker');
    expect(markers).toHaveLength(2);
    expect(markers[0].className).toContain('ivl-debugger-marker-cue');
    expect(markers[0].getAttribute('title')).toContain('Subtitle: A line of text');
    expect(markers[1].className).toContain('ivl-debugger-marker-interaction');
    expect(container.querySelector('.ivl-debugger-status')?.textContent).toContain('00:05 / 01:00');
    expect(container.querySelector('.ivl-debugger-upcoming')?.textContent).toContain(
      '00:12 — Notice',
    );
    expect(container.querySelector('.ivl-debugger-upcoming')?.textContent).toContain(
      'interaction: choice',
    );

    debuggerView.recordCue(cues[0]);
    expect(container.querySelector('.ivl-debugger-upcoming')?.textContent).not.toContain('Notice');
  });

  it('updates cue markers and exports cue, interaction, state, and segment events', () => {
    const replacementCue: CuePoint = { id: 'replacement', time: 20 };
    debuggerView.setCues([replacementCue]);
    debuggerView.recordCue(cues[1]);
    debuggerView.recordInteractionResponse('question', { answer: 'A' });
    debuggerView.recordState('idle', 'playing');
    debuggerView.recordSegment('main.mp4', 'branch.mp4');

    const exported = JSON.parse(debuggerView.exportLogs());
    expect(container.querySelectorAll('.ivl-debugger-marker')).toHaveLength(1);
    expect(exported.map((event: { type: string }) => event.type)).toEqual([
      'cue',
      'interaction',
      'interaction',
      'state',
      'segment',
    ]);
    expect(exported[2].details).toEqual({
      cueId: 'question',
      phase: 'response',
      response: '{"answer":"A"}',
    });
    expect(exported[3].details).toEqual({ from: 'idle', to: 'playing' });
    expect(container.querySelector('.ivl-debugger-events')?.textContent).toContain(
      'segment: from=main.mp4, to=branch.mp4',
    );
  });

  it('removes its media listeners and UI on destroy', () => {
    const removeListener = vi.spyOn(video, 'removeEventListener');
    debuggerView.destroy();

    expect(removeListener).toHaveBeenCalledWith('timeupdate', expect.any(Function));
    expect(container.querySelector('.ivl-debugger-toggle')).toBeNull();
    expect(container.querySelector('.ivl-debugger-panel')).toBeNull();
  });
});

import type { CuePoint, DebugEvent, DebugEventType, PlayerState } from './types';

/**
 * Renders an opt-in timeline and event log for inspecting player behavior.
 */
export class TimelineDebugger {
  private video: HTMLVideoElement;
  private container: HTMLElement;
  private cues: CuePoint[];
  private getState: () => PlayerState;
  private toggle: HTMLButtonElement;
  private panel: HTMLElement;
  private currentTimeOutput: HTMLElement;
  private stateOutput: HTMLElement;
  private timeline: HTMLElement;
  private markerLayer: HTMLElement;
  private progress: HTMLElement;
  private upcomingList: HTMLElement;
  private eventList: HTMLOListElement;
  private events: DebugEvent[] = [];
  private triggeredCueIds = new Set<string>();

  constructor(
    video: HTMLVideoElement,
    container: HTMLElement,
    cues: CuePoint[],
    getState: () => PlayerState,
  ) {
    this.video = video;
    this.container = container;
    this.cues = cues;
    this.getState = getState;

    this.toggle = document.createElement('button');
    this.toggle.type = 'button';
    this.toggle.className = 'ivl-debugger-toggle';
    this.toggle.textContent = 'Show timeline debugger';
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.addEventListener('click', this.togglePanel);

    this.panel = document.createElement('section');
    this.panel.className = 'ivl-debugger-panel';
    this.panel.setAttribute('aria-label', 'Video timeline debugger');
    this.panel.hidden = true;

    const heading = document.createElement('h2');
    heading.textContent = 'Timeline debugger';

    const status = document.createElement('div');
    status.className = 'ivl-debugger-status';
    this.currentTimeOutput = document.createElement('output');
    this.stateOutput = document.createElement('output');
    status.append(this.currentTimeOutput, this.stateOutput);

    this.timeline = document.createElement('div');
    this.timeline.className = 'ivl-debugger-track';
    this.timeline.setAttribute('role', 'img');
    this.timeline.setAttribute('aria-label', 'Video timeline with cue markers');
    this.progress = document.createElement('div');
    this.progress.className = 'ivl-debugger-progress';
    this.markerLayer = document.createElement('div');
    this.markerLayer.className = 'ivl-debugger-markers';
    this.timeline.append(this.progress, this.markerLayer);

    const upcomingHeading = document.createElement('h3');
    upcomingHeading.textContent = 'Upcoming cues';
    this.upcomingList = document.createElement('ul');
    this.upcomingList.className = 'ivl-debugger-upcoming';

    const eventHeading = document.createElement('h3');
    eventHeading.textContent = 'Event log';
    const exportButton = document.createElement('button');
    exportButton.type = 'button';
    exportButton.textContent = 'Export logs';
    exportButton.addEventListener('click', this.downloadLogs);
    this.eventList = document.createElement('ol');
    this.eventList.className = 'ivl-debugger-events';

    this.panel.append(
      heading,
      status,
      this.timeline,
      upcomingHeading,
      this.upcomingList,
      eventHeading,
      exportButton,
      this.eventList,
    );
    this.container.append(this.toggle, this.panel);

    this.video.addEventListener('timeupdate', this.updateTimeline);
    this.video.addEventListener('durationchange', this.renderMarkers);
    this.video.addEventListener('loadedmetadata', this.renderMarkers);
    this.updateTimeline();
    this.renderMarkers();
  }

  public setCues(cues: CuePoint[]): void {
    this.cues = cues;
    this.triggeredCueIds.clear();
    this.renderMarkers();
    this.updateUpcoming();
  }

  public recordCue(cue: CuePoint): void {
    this.triggeredCueIds.add(cue.id);
    this.record('cue', { cueId: cue.id, label: cue.label || cue.id });
    if (cue.payload?.interaction) {
      this.record('interaction', {
        cueId: cue.id,
        interactionType: cue.payload.interaction.type,
      });
    }
    this.updateUpcoming();
  }

  public recordState(from: PlayerState, to: PlayerState): void {
    this.stateOutput.textContent = `State: ${to}`;
    this.record('state', { from, to });
  }

  public recordInteractionResponse(cueId: string, response: unknown): void {
    const formattedResponse =
      typeof response === 'string' ? response : (JSON.stringify(response) ?? String(response));
    this.record('interaction', { cueId, phase: 'response', response: formattedResponse });
  }

  public recordSegment(from: string, to: string): void {
    this.record('segment', { from, to });
  }

  public recordPlaybackEvent(event: string): void {
    this.record('playback', { event });
  }

  public exportLogs(): string {
    return JSON.stringify(this.events, null, 2);
  }

  public destroy(): void {
    this.video.removeEventListener('timeupdate', this.updateTimeline);
    this.video.removeEventListener('durationchange', this.renderMarkers);
    this.video.removeEventListener('loadedmetadata', this.renderMarkers);
    this.toggle.removeEventListener('click', this.togglePanel);
    this.toggle.remove();
    this.panel.remove();
  }

  private togglePanel = (): void => {
    this.panel.hidden = !this.panel.hidden;
    this.toggle.setAttribute('aria-expanded', String(!this.panel.hidden));
    this.toggle.textContent = this.panel.hidden
      ? 'Show timeline debugger'
      : 'Hide timeline debugger';
  };

  private updateTimeline = (): void => {
    const currentTime = this.video.currentTime;
    const duration = this.video.duration;
    this.currentTimeOutput.textContent = `Time: ${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
    this.progress.style.width =
      Number.isFinite(duration) && duration > 0
        ? `${Math.min(100, (currentTime / duration) * 100)}%`
        : '0%';
    this.stateOutput.textContent = `State: ${this.getState()}`;
    this.updateUpcoming();
  };

  private renderMarkers = (): void => {
    this.markerLayer.replaceChildren();
    const duration = this.video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    for (const cue of this.cues) {
      const marker = document.createElement('span');
      const isInteraction = Boolean(cue.payload?.interaction);
      marker.className = isInteraction
        ? 'ivl-debugger-marker ivl-debugger-marker-interaction'
        : 'ivl-debugger-marker ivl-debugger-marker-cue';
      marker.style.left = `${Math.min(100, Math.max(0, (cue.time / duration) * 100))}%`;
      marker.title = [
        cue.label || cue.id,
        `ID: ${cue.id}`,
        `Time: ${this.formatTime(cue.time)}`,
        cue.subtitleText ? `Subtitle: ${cue.subtitleText}` : '',
        isInteraction ? `Interaction: ${cue.payload?.interaction.type}` : '',
      ]
        .filter(Boolean)
        .join('\n');
      marker.setAttribute('aria-label', marker.title);
      this.markerLayer.appendChild(marker);
    }
  };

  private updateUpcoming(): void {
    const currentTime = this.video.currentTime;
    const upcoming = this.cues
      .filter((cue) => cue.time >= currentTime && !this.triggeredCueIds.has(cue.id))
      .sort((a, b) => a.time - b.time);
    this.upcomingList.replaceChildren();

    if (upcoming.length === 0) {
      const empty = document.createElement('li');
      empty.textContent = 'No upcoming cues';
      this.upcomingList.appendChild(empty);
      return;
    }

    for (const cue of upcoming) {
      const item = document.createElement('li');
      const interaction = cue.payload?.interaction;
      item.textContent = `${this.formatTime(cue.time)} — ${cue.label || cue.id}${
        interaction ? ` (interaction: ${interaction.type})` : ''
      }`;
      this.upcomingList.appendChild(item);
    }
  }

  private record(type: DebugEventType, details: Record<string, string>): void {
    const event = {
      type,
      playbackTime: this.video.currentTime,
      timestamp: Date.now(),
      details,
    };
    this.events.push(event);

    const item = document.createElement('li');
    item.textContent = `${this.formatTime(event.playbackTime)} — ${type}: ${Object.entries(details)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')}`;
    this.eventList.appendChild(item);
  }

  private downloadLogs = (): void => {
    const blob = new Blob([this.exportLogs()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ivl-timeline-debugger.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  private formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }
}

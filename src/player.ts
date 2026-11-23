import { StateMachine } from './stateMachine';
import { CueHandler } from './cueHandler';
import { InteractionManager } from './interactionManager';
import { Analytics } from './analytics';
import { SegmentManager } from './segmentManager';
import { I18n } from './i18n';

import type {
  PlayerConfig,
  CuePoint,
  AnalyticsEvent,
  PlayerState,
  HTMLVideoElementWithControlsList,
  Translations,
  AnalyticsPayload,
  DecisionAdapter,
  LivePlaybackSync,
  LiveRoomState,
  LiveSyncAdapter,
  LiveSyncClientMessage,
  LiveSyncEvent,
  LiveSyncStatusEvent,
} from './types';
import { InMemoryDecisionAdapter } from './InMemoryDecisionAdapter';
import { LocalStorageDecisionAdapter } from './localStorageDecisionAdapter';
import { FALLBACK_CSS } from './style';
import { SubtitlesManager } from './subtitlesManager';
import { TimelineDebugger } from './timelineDebugger';

/**
 * The main class for the Interactive Video Labs Player.
 * This class orchestrates the video playback, cue handling, interaction management,
 * and analytics tracking.
 */
export class IVLabsPlayer {
  private videoElement: HTMLVideoElementWithControlsList;
  private config: PlayerConfig;
  private stateMachine: StateMachine;
  private cueHandler: CueHandler;
  private interactionManager: InteractionManager;
  private analytics: Analytics;
  private segmentManager: SegmentManager;
  private i18n: I18n;
  private decisionAdapter: DecisionAdapter;
  private liveSyncAdapter?: LiveSyncAdapter;
  private liveSyncRole: 'host' | 'participant';
  private liveSyncDriftToleranceSeconds: number;
  private liveSyncConnected = false;
  private applyingRemoteSegment = false;
  private suppressNextPlayBroadcast = false;
  private suppressNextPauseBroadcast = false;
  private suppressPlayBroadcastTimer?: ReturnType<typeof setTimeout>;
  private suppressPauseBroadcastTimer?: ReturnType<typeof setTimeout>;
  private expectedRemoteSeek?: number;
  private latestLiveState?: LiveRoomState;
  private liveSyncEventListeners = new Set<(event: LiveSyncEvent) => void>();
  private liveSyncStatusListeners = new Set<(event: LiveSyncStatusEvent) => void>();
  private subtitlesManager?: SubtitlesManager;
  private timelineDebugger?: TimelineDebugger;
  private pauseForInteraction = false;

  private videoContainer: HTMLElement;
  private subtitlesElement?: HTMLTrackElement;

  constructor(target: string, config: PlayerConfig) {
    const targetElement = document.getElementById(target);
    if (!targetElement) throw new Error(`Target container with ID "${target}" not found.`);

    this.config = config;
    this.liveSyncAdapter = config.liveSync?.adapter;
    this.liveSyncRole = config.liveSync?.role ?? 'participant';
    this.liveSyncDriftToleranceSeconds = config.liveSync?.driftToleranceSeconds ?? 0.75;
    if (
      !Number.isFinite(this.liveSyncDriftToleranceSeconds) ||
      this.liveSyncDriftToleranceSeconds < 0
    ) {
      throw new RangeError('liveSync.driftToleranceSeconds must be a non-negative number.');
    }

    this.videoContainer = document.createElement('div');
    this.videoContainer.className = 'ivl-player-container';

    this.videoElement = document.createElement('video') as HTMLVideoElementWithControlsList;
    this.videoElement.controls = true;
    this.videoElement.controlsList = 'nodownload';

    if (config.subtitlesUrl) {
      this.subtitlesElement = document.createElement('track');
      this.subtitlesElement.src = config.subtitlesUrl;
      this.subtitlesElement.kind = 'subtitles';
      this.subtitlesElement.default = true;
      this.subtitlesManager = new SubtitlesManager(this.subtitlesElement, config.cues);
      this.videoElement.appendChild(this.subtitlesElement);
      this.subtitlesManager.onLoad((cues) => {
        this.start(cues);
      });
    }

    this.videoContainer.appendChild(this.videoElement);
    targetElement.innerHTML = '';
    targetElement.appendChild(this.videoContainer);

    this._injectFallbackCss();

    this.i18n = new I18n();
    if (config.translations) {
      for (const [locale, translations] of Object.entries(config.translations)) {
        this.i18n.load(locale, translations);
      }
    }
    if (config.locale) {
      this.i18n.setLocale(config.locale);
    }

    if (config.decisionAdapter) {
      this.decisionAdapter = config.decisionAdapter;
    } else if (config.decisionAdapterType === 'localStorage') {
      this.decisionAdapter = new LocalStorageDecisionAdapter();
    } else {
      this.decisionAdapter = new InMemoryDecisionAdapter();
    }
    this.analytics = new Analytics();
    this.stateMachine = new StateMachine(config.initialState || 'idle');
    this.configureStateTransitions();
    this.interactionManager = new InteractionManager(
      this.videoContainer,
      this.i18n,
      this.decisionAdapter,
    );
    this.cueHandler = new CueHandler(this.videoElement);
    this.segmentManager = new SegmentManager(this.videoElement);
    if (config.debugger) {
      this.timelineDebugger = new TimelineDebugger(
        this.videoElement,
        this.videoContainer,
        config.cues || [],
        () => this.stateMachine.getState(),
      );
    }
    this.segmentManager.onSegmentChange((from, to, mainVideoTimestamp, isPlaying) => {
      this.timelineDebugger?.recordSegment(from, to);
      if (this.liveSyncRole === 'host' && !this.applyingRemoteSegment) {
        if (this.mediaSourcesMatch(to, this.config.videoUrl ?? '')) {
          this.publishPlaybackSync('seek', {
            videoUrl: to,
            videoTimestamp: mainVideoTimestamp ?? this.videoElement.currentTime,
            isPlaying,
          });
        } else {
          this.publishPlaybackSync('segment', {
            segmentUrl: to,
            mainVideoTimestamp: mainVideoTimestamp ?? this.videoElement.currentTime,
            isPlaying,
          });
        }
      }
    });
    if (!config.subtitlesUrl) {
      this.start(config.cues);
    }
  }

  private start(cues?: CuePoint[]) {
    this.cueHandler.registerCues(cues || []);
    this.timelineDebugger?.setCues(cues || []);
    if (!this.config.videoUrl) throw new Error('videoUrl must be provided in the PlayerConfig.');
    this.videoElement.src = this.config.videoUrl;
    this.bindEvents();
    this.cueHandler.start();
    this.connectLiveSync();
  }

  /**
   * Binds event listeners for cue handling, interaction response, and analytics.
   */
  private bindEvents(): void {
    this.cueHandler.onCue((cue: CuePoint) => {
      this.timelineDebugger?.recordCue(cue);
      this.analytics.track('onCueEnter', {
        event: 'onCueEnter',
        cueId: cue.id,
        timestamp: Date.now(),
      });
      this.publishLiveMessage({
        type: 'cue:triggered',
        payload: {
          cueId: cue.id,
          videoTimestamp: this.videoElement.currentTime,
          serverTimestamp: this.getServerTimestamp(),
        },
      });

      if (cue.payload?.interaction) {
        this.pauseForInteraction = true;
        this.videoElement.pause();
        this.transitionState('waitingForInteraction');
        this.interactionManager.handleInteractionCue(cue);
        this.analytics.track('onPromptShown', {
          event: 'onPromptShown',
          cueId: cue.id,
          timestamp: Date.now(),
        });
      } else {
        this.transitionState('playing');
      }
    });
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.interactionManager.onResponse((response: any, cue: CuePoint) => {
      this.timelineDebugger?.recordInteractionResponse(cue.id, response);
      this.analytics.track('onInteractionSelected', {
        event: 'onInteractionSelected',
        cueId: cue.id,
        data: { response },
        timestamp: Date.now(),
      });

      if (response && response.nextSegment) {
        this.analytics.track('onBranchJump', {
          event: 'onBranchJump',
          cueId: cue.id,
          data: { nextSegment: response.nextSegment },
          timestamp: Date.now(),
        });
        this.segmentManager.playSegment(response.nextSegment);
      } else {
        this.pauseForInteraction = false;
        this.videoElement.play().catch((error) => {
          console.error('Video playback failed:', error);
        });
      }
      console.log('Interaction response received:', response);
      this.pauseForInteraction = false;
      this.transitionState('playing');
      this.analytics.track('INTERACTION_COMPLETED', {
        event: 'INTERACTION_COMPLETED',
        cueId: cue.id,
        data: { response },
        timestamp: Date.now(),
      });
    });
    this.interactionManager.onDecisionSubmitted((decision) => {
      this.publishLiveMessage({ type: 'decision:submitted', payload: { decision } });
    });

    this.videoElement.addEventListener('play', () => {
      this.transitionState('playing');
      this.timelineDebugger?.recordPlaybackEvent('play');
      this.analytics.track('VIDEO_STARTED', {
        event: 'VIDEO_STARTED',
        timestamp: Date.now(),
      });
      if (this.suppressNextPlayBroadcast) {
        this.clearPlayBroadcastSuppression();
      } else if (this.liveSyncRole === 'host') {
        this.publishPlaybackSync('play');
      }
    });

    this.videoElement.addEventListener('pause', () => {
      if (!this.pauseForInteraction) this.transitionState('idle');
      this.timelineDebugger?.recordPlaybackEvent('pause');
      this.analytics.track('VIDEO_PAUSED', {
        event: 'VIDEO_PAUSED',
        timestamp: Date.now(),
      });
      if (this.suppressNextPauseBroadcast) {
        this.clearPauseBroadcastSuppression();
      } else if (this.liveSyncRole === 'host') {
        this.publishPlaybackSync('pause');
      }
    });

    this.videoElement.addEventListener('seeked', () => {
      if (this.expectedRemoteSeek !== undefined) {
        const isRemoteSeek =
          Math.abs(this.videoElement.currentTime - this.expectedRemoteSeek) < 0.1;
        this.expectedRemoteSeek = undefined;
        if (isRemoteSeek) return;
      }
      if (this.liveSyncRole === 'host') this.publishPlaybackSync('seek');
    });

    this.videoElement.addEventListener('ended', () => {
      this.transitionState('ended');
      this.timelineDebugger?.recordPlaybackEvent('ended');
      this.analytics.track('VIDEO_ENDED', {
        event: 'VIDEO_ENDED',
        timestamp: Date.now(),
      });
    });

    this.videoElement.addEventListener('error', () => {
      this.transitionState('error');
      this.timelineDebugger?.recordPlaybackEvent('error');
    });
  }

  private configureStateTransitions(): void {
    const transitions: Record<PlayerState, PlayerState[]> = {
      idle: ['playing', 'waitingForInteraction', 'ended', 'error'],
      playing: ['idle', 'waitingForInteraction', 'ended', 'error'],
      waitingForInteraction: ['idle', 'playing', 'ended', 'error'],
      ended: ['idle', 'playing', 'error'],
      error: ['idle', 'playing'],
    };

    for (const [from, destinations] of Object.entries(transitions) as [
      PlayerState,
      PlayerState[],
    ][]) {
      for (const to of destinations) {
        this.stateMachine.addTransition({ from, to });
      }
    }
  }

  private transitionState(state: PlayerState): void {
    const previousState = this.stateMachine.getState();
    if (previousState === state) return;
    if (this.stateMachine.transitionTo(state)) {
      this.timelineDebugger?.recordState(previousState, state);
    }
  }

  private connectLiveSync(): void {
    if (!this.liveSyncAdapter || this.liveSyncConnected) return;
    this.liveSyncConnected = true;

    try {
      void Promise.resolve(
        this.liveSyncAdapter.connect(
          (event) => this.handleLiveSyncEvent(event),
          (event) => this.notifyLiveSyncStatus(event),
        ),
      ).catch((error: unknown) => {
        this.notifyLiveSyncStatus({
          status: 'error',
          error: error instanceof Error ? error : new Error('Live sync connection failed.'),
        });
      });
    } catch (error) {
      this.notifyLiveSyncStatus({
        status: 'error',
        error: error instanceof Error ? error : new Error('Live sync connection failed.'),
      });
    }
  }

  private handleLiveSyncEvent(event: LiveSyncEvent): void {
    this.liveSyncEventListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Live sync event listener failed:', error);
      }
    });

    if (event.type === 'room:state') {
      this.latestLiveState = event.payload;
      this.applyLiveState(event.payload);
    } else if (event.type === 'playback:sync' && this.liveSyncRole !== 'host') {
      const state: LiveRoomState = {
        ...event.payload,
        ...(event.payload.action === 'segment' && event.payload.segmentUrl
          ? { segmentUrl: event.payload.segmentUrl }
          : {}),
      };
      this.latestLiveState = state;
      this.applyLiveState(state);
    }
  }

  private applyLiveState(state: LiveRoomState, force = false): void {
    let sourceChanged = false;
    if (state.segmentUrl) {
      const mainVideoUrl = state.mainVideoUrl ?? this.config.videoUrl ?? this.videoElement.src;
      sourceChanged = !this.mediaSourcesMatch(this.videoElement.src, state.segmentUrl);
      this.applyingRemoteSegment = true;
      try {
        this.segmentManager.syncSegment(
          state.segmentUrl,
          mainVideoUrl,
          state.mainVideoTimestamp ?? 0,
        );
      } finally {
        this.applyingRemoteSegment = false;
      }
    } else if (state.videoUrl) {
      sourceChanged = !this.mediaSourcesMatch(this.videoElement.src, state.videoUrl);
      this.applyingRemoteSegment = true;
      try {
        this.segmentManager.syncMainVideo(state.videoUrl);
      } finally {
        this.applyingRemoteSegment = false;
      }
    }

    if (sourceChanged) {
      if (!this.videoElement.paused) this.suppressPauseBroadcastOnce();
      this.videoElement.addEventListener(
        'loadedmetadata',
        () => {
          if (this.latestLiveState === state) {
            if (state.segmentUrl) this.suppressPlayBroadcastOnce();
            this.applyLivePlaybackPosition(state, true);
          }
        },
        { once: true },
      );
      return;
    }
    this.applyLivePlaybackPosition(state, force);
  }

  private applyLivePlaybackPosition(state: LiveRoomState, force: boolean): void {
    const now = this.getServerTimestamp();
    const targetTime =
      state.videoTimestamp +
      (state.isPlaying ? Math.max(0, now - state.serverTimestamp) / 1000 : 0);
    const drift = Math.abs(targetTime - this.videoElement.currentTime);

    if (force || drift > this.liveSyncDriftToleranceSeconds) {
      this.expectedRemoteSeek = targetTime;
      this.videoElement.currentTime = targetTime;
    }

    if (state.isPlaying && this.videoElement.paused) {
      try {
        this.suppressPlayBroadcastOnce();
        void Promise.resolve(this.videoElement.play()).catch((error: unknown) => {
          this.clearPlayBroadcastSuppression();
          console.error('Live sync playback failed:', error);
        });
      } catch (error) {
        this.clearPlayBroadcastSuppression();
        console.error('Live sync playback failed:', error);
      }
    } else if (!state.isPlaying && !this.videoElement.paused) {
      this.suppressPauseBroadcastOnce();
      this.videoElement.pause();
    }
  }

  private suppressPlayBroadcastOnce(): void {
    this.suppressNextPlayBroadcast = true;
    if (this.suppressPlayBroadcastTimer !== undefined) {
      clearTimeout(this.suppressPlayBroadcastTimer);
    }
    this.suppressPlayBroadcastTimer = setTimeout(() => {
      this.clearPlayBroadcastSuppression();
    }, 1_000);
  }

  private clearPlayBroadcastSuppression(): void {
    this.suppressNextPlayBroadcast = false;
    if (this.suppressPlayBroadcastTimer !== undefined) {
      clearTimeout(this.suppressPlayBroadcastTimer);
      this.suppressPlayBroadcastTimer = undefined;
    }
  }

  private suppressPauseBroadcastOnce(): void {
    this.suppressNextPauseBroadcast = true;
    if (this.suppressPauseBroadcastTimer !== undefined) {
      clearTimeout(this.suppressPauseBroadcastTimer);
    }
    this.suppressPauseBroadcastTimer = setTimeout(() => {
      this.clearPauseBroadcastSuppression();
    }, 1_000);
  }

  private clearPauseBroadcastSuppression(): void {
    this.suppressNextPauseBroadcast = false;
    if (this.suppressPauseBroadcastTimer !== undefined) {
      clearTimeout(this.suppressPauseBroadcastTimer);
      this.suppressPauseBroadcastTimer = undefined;
    }
  }

  private mediaSourcesMatch(currentSource: string, targetSource: string): boolean {
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

  private publishPlaybackSync(
    action: LivePlaybackSync['action'],
    extra: Pick<
      LivePlaybackSync,
      | 'segmentUrl'
      | 'videoUrl'
      | 'videoTimestamp'
      | 'mainVideoUrl'
      | 'mainVideoTimestamp'
      | 'isPlaying'
    > = {},
  ): void {
    this.publishLiveMessage({
      type: 'playback:sync',
      payload: {
        action,
        videoTimestamp: extra.videoTimestamp ?? this.videoElement.currentTime,
        serverTimestamp: this.getServerTimestamp(),
        isPlaying: extra.isPlaying ?? !this.videoElement.paused,
        ...(action === 'segment'
          ? {
              mainVideoUrl: this.config.videoUrl,
              mainVideoTimestamp: extra.mainVideoTimestamp ?? this.videoElement.currentTime,
            }
          : {}),
        ...extra,
      },
    });
  }

  private getServerTimestamp(): number {
    return this.liveSyncAdapter?.getServerTimestamp?.() ?? Date.now();
  }

  private publishLiveMessage(message: LiveSyncClientMessage): void {
    if (!this.liveSyncAdapter) return;
    try {
      void Promise.resolve(this.liveSyncAdapter.send(message)).catch((error: unknown) => {
        console.error(
          `Failed to publish live sync message "${message.type}":`,
          error instanceof Error ? error : new Error('Live sync message could not be sent.'),
        );
      });
    } catch (error) {
      console.error(
        `Failed to publish live sync message "${message.type}":`,
        error instanceof Error ? error : new Error('Live sync message could not be sent.'),
      );
    }
  }

  private notifyLiveSyncStatus(event: LiveSyncStatusEvent): void {
    this.liveSyncStatusListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Live sync status listener failed:', error);
      }
    });
  }

  /** Loads cue points into the player. */
  public loadCues(cues: CuePoint[]): void {
    this.cueHandler.loadCues(cues);
    this.timelineDebugger?.setCues(cues);
  }

  /** Loads interaction segments into the player. */
  public loadInteractions(interactions: CuePoint[]): void {
    this.interactionManager.loadInteractions(interactions);
  }

  /** Returns the current player state. */
  public getState(): PlayerState {
    return this.stateMachine.getState();
  }

  /** Plays the video. */
  public play(): void {
    this.videoElement.play();
  }

  /** Pauses the video. */
  public pause(): void {
    this.videoElement.pause();
  }

  /** Applies the latest room snapshot immediately, regardless of the drift threshold. */
  public syncToLive(): void {
    if (this.latestLiveState) this.applyLiveState(this.latestLiveState, true);
  }

  /** Subscribes to normalized live room events such as poll tallies and presence updates. */
  public onLiveSyncEvent(listener: (event: LiveSyncEvent) => void): () => void {
    this.liveSyncEventListeners.add(listener);
    return () => this.liveSyncEventListeners.delete(listener);
  }

  /** Subscribes to live transport lifecycle updates. */
  public onLiveSyncStatus(listener: (event: LiveSyncStatusEvent) => void): () => void {
    this.liveSyncStatusListeners.add(listener);
    return () => this.liveSyncStatusListeners.delete(listener);
  }

  /** Publishes an optional application-level live event, such as a reaction or presence update. */
  public sendLiveSyncMessage(message: LiveSyncClientMessage): Promise<void> {
    if (!this.liveSyncAdapter) {
      return Promise.reject(new Error('Live sync is not configured for this player.'));
    }
    try {
      return Promise.resolve(this.liveSyncAdapter.send(message));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * Registers a custom analytics hook for a specific event.
   * @param event - The event to listen for.
   * @param callback - The function to be called when the event is tracked.
   */
  public on(
    event: AnalyticsEvent,
    callback: (payload: AnalyticsPayload | undefined) => void,
  ): void {
    this.analytics.on(event, (event, payload) => callback(payload));
  }

  /**
   * Sets the current language for localization.
   * @param locale - The new locale.
   */
  public setLocale(locale: string): void {
    this.i18n.setLocale(locale);
  }

  /**
   * Loads a set of translations for a specific locale.
   * @param locale - The locale for the translations.
   * @param translations - The translation data.
   */
  public loadTranslations(locale: string, translations: Translations): void {
    this.i18n.load(locale, translations);
  }

  /**
   * Retrieves the user's decision history.
   * @returns A promise that resolves to an array of Decision objects.
   */
  public getDecisionHistory() {
    return this.decisionAdapter.getDecisionHistory();
  }

  /**
   * Clears the user's decision history.
   * @returns A promise that resolves when the history is cleared.
   */
  public clearDecisionHistory() {
    return this.decisionAdapter.clearDecisionHistory();
  }

  /**
   * Injects fallback CSS into the document head.
   * This ensures basic styling is present even if external stylesheets are not loaded.
   */
  private _injectFallbackCss(): void {
    const style = document.createElement('style');
    style.textContent = FALLBACK_CSS;
    document.head.appendChild(style);
  }

  /** Cleans up the player, removes listeners and resets state. */
  public destroy(): void {
    console.log('IVLabsPlayer destroy() called.');
    this.cueHandler.destroy();
    this.interactionManager.destroy();
    this.timelineDebugger?.destroy();
    this.segmentManager.destroy();
    this.clearPlayBroadcastSuppression();
    this.clearPauseBroadcastSuppression();
    if (this.liveSyncAdapter) {
      try {
        void Promise.resolve(this.liveSyncAdapter.disconnect()).catch((error: unknown) => {
          console.error('Failed to disconnect live sync:', error);
        });
      } catch (error) {
        console.error('Failed to disconnect live sync:', error);
      }
    }
    this.liveSyncEventListeners.clear();
    this.liveSyncStatusListeners.clear();
    this.analytics.track('onSessionEnd', {
      event: 'onSessionEnd',
      timestamp: Date.now(),
    });
  }
}

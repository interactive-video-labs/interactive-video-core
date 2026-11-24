# @interactive-video-labs/core

<p align="center">
  <img src="https://raw.githubusercontent.com/interactive-video-labs/docs/main/logo.svg" width="200px" alt="Interactive Video Labs Logo" />
</p>
<p align="center">
  <img src="https://img.shields.io/npm/v/@interactive-video-labs/core" alt="NPM Version" />
  <img src="https://img.shields.io/npm/l/@interactive-video-labs/core" alt="NPM License" />
  <img src="https://img.shields.io/npm/d18m/@interactive-video-labs/core?style=flat-square" alt="NPM Downloads" />
  <a href="https://github.com/interactive-video-labs/interactive-video-core/actions">
    <img src="https://github.com/interactive-video-labs/interactive-video-core/actions/workflows/release.yml/badge.svg" alt="Build Status" />
  </a>
</p>

Welcome to `@interactive-video-labs/core` — the framework-agnostic TypeScript module powering interactive video experiences. This engine is designed to be lightweight, extendable, and usable across React, Vue, or plain JavaScript apps.

---

## 🚀 Getting Started

To get started with `@interactive-video-labs/core`, follow these steps:

### Installation

If you're integrating this module into an existing project, you can install it via `pnpm`, `npm`, or `yarn`:

```bash
pnpm add @interactive-video-labs/core
# or
npm install @interactive-video-labs/core
# or
yarn add @interactive-video-labs/core
```

### Basic Usage

For a basic working example, refer to the [`examples/index.html`](examples/index.html) file. It demonstrates how to initialize and use the `IVLabsPlayer` in a plain HTML setup.

Here's a simplified snippet of how you might set up the player:

```typescript
import {
  IVLabsPlayer,
  InMemoryDecisionAdapter,
  LocalStorageDecisionAdapter,
} from '@interactive-video-labs/core';

// Initialize a decision adapter (e.g., for in-memory storage or local storage)
// const decisionAdapter = new InMemoryDecisionAdapter();
const decisionAdapter = new LocalStorageDecisionAdapter();

const playerConfig = {
  videoUrl: 'https://interactive-video-labs.github.io/assets/sample-video.mp4',
  cues: [
    {
      id: 'intro',
      time: 2,
      label: 'Introduction',
      payload: { message: 'Welcome!' },
    },
    {
      id: 'question1',
      time: 5,
      label: 'Question 1',
      payload: {
        interaction: {
          type: 'choice',
          title: 'Quick Question',
          description: 'Please select the correct answer.',
          question: 'What is 2+2?',
          options: ['3', '4', '5'],
          correctAnswer: '4',
        },
      },
    },
    {
      id: 'segmentChange',
      time: 10,
      label: 'Segment Change',
      payload: {
        interaction: {
          type: 'choice-video-segment-change',
          title: 'Choose your path',
          description: 'Select a video segment to jump to.',
          question: 'Where would you like to go?',
          options: [
            {
              level: 'Segment A',
              video: 'https://interactive-video-labs.github.io/assets/sample-interaction-1.mp4',
            },
            {
              level: 'Segment B',
              video: 'https://interactive-video-labs.github.io/assets/sample-interaction-2.mp4',
            },
          ],
        },
      },
    },
    {
      id: 'midpoint',
      time: 8,
      label: 'Midpoint',
      payload: { message: 'Halfway there!' },
    },
    {
      id: 'question2',
      time: 12,
      label: 'Question 2',
      payload: {
        interaction: {
          type: 'text',
          title: 'Your Information',
          description: 'Please enter your name below.',
          question: 'Your name?',
        },
      },
    },
    {
      id: 'end',
      time: 15,
      label: 'End',
      payload: { message: 'Thanks for watching!' },
    },
  ],
  initialState: 'idle',
  decisionAdapter: decisionAdapter, // Pass the decision adapter to the player config
};

// Assuming you have a div with id="player-container" in your HTML
const player = new IVLabsPlayer('player-container', playerConfig);

player.init();
// player.play(); // Start playback
```

### Decision Tracking and Persistence

The `@interactive-video-labs/core` module now supports tracking and persisting user decisions made during interactions. This is achieved through the `DecisionAdapter` interface, which allows you to define how decisions are stored and retrieved. Two concrete implementations are provided:

- **`InMemoryDecisionAdapter`**: Stores decisions in memory. This is useful for temporary tracking within a single session.
- **`LocalStorageDecisionAdapter`**: Stores decisions in the browser's local storage, providing persistence across sessions.

To use decision tracking, simply instantiate one of the adapters and pass it to the `IVLabsPlayer` configuration:

```typescript
import { IVLabsPlayer, LocalStorageDecisionAdapter } from '@interactive-video-labs/core';

const decisionAdapter = new LocalStorageDecisionAdapter();

const playerConfig = {
  // ... other player configurations
  decisionAdapter: decisionAdapter,
};

const player = new IVLabsPlayer('player-container', playerConfig);
player.init();

// To retrieve decision history:
async function getHistory() {
  const history = await decisionAdapter.getDecisionHistory();
  console.log('Decision History:', history);
}

// To clear decision history:
async function clearHistory() {
  await decisionAdapter.clearDecisionHistory();
  console.log('Decision History cleared.');
}
```

This allows you to easily integrate decision tracking into your interactive video experiences, enabling features like personalized content, progress saving, or analytics based on user choices.

### Remote API adapter

`RemoteApiDecisionAdapter` stores decisions in a remote JSON API and also exposes
methods to save and retrieve playback progress. Its default endpoints are
`GET|POST|DELETE /sessions/{sessionId}/decisions` and
`GET|PUT /sessions/{sessionId}/progress`, relative to `baseUrl`. Decision responses
may be an array or `{ "decisions": [...] }`; progress responses may be a progress
object or `{ "progress": {...} }`. The adapter does not automatically seek or
periodically save the player; the host application can apply retrieved progress
and decide when to persist it.

```typescript
import { IVLabsPlayer, RemoteApiDecisionAdapter } from '@interactive-video-labs/core';

const decisionAdapter = new RemoteApiDecisionAdapter({
  baseUrl: 'https://api.example.com/v1',
  sessionId: 'lesson-123',
  userId: 'student-456',
  headers: { Authorization: `Bearer ${accessToken}` },
  onSyncStatus: ({ operation, status, error }) => {
    console.log('Sync status:', operation, status, error);
  },
});

async function initializePlayer() {
  const decisions = await decisionAdapter.getDecisionHistory();
  const progress = await decisionAdapter.getPlaybackProgress();
  console.log('Previous decisions:', decisions);

  const player = new IVLabsPlayer('player-container', {
    videoUrl: 'lesson.mp4',
    cues: lessonCues,
    decisionAdapter,
  });

  // Apply this position after the video metadata has loaded, if progress exists.
  if (progress) {
    const video = document.querySelector<HTMLVideoElement>('#player-container video');
    video?.addEventListener(
      'loadedmetadata',
      () => {
        video.currentTime = progress.position;
      },
      { once: true },
    );
  }

  return player;
}

void initializePlayer();

// Call when appropriate for the host application, such as on pause or periodically.
async function savePlaybackProgress(position: number) {
  await decisionAdapter.savePlaybackProgress({ position });
}
```

Configure custom relative endpoint paths with `endpoints: { decisions, playbackProgress }`.
Paths can include `{sessionId}` and `{userId}` placeholders. HTTP and network errors
reject the adapter method with `RemoteApiError`; `onSyncStatus` receives `started`,
`succeeded`, and `failed` events so applications can surface or retry failures.

### Live session synchronization

Live sync is opt-in and framework-agnostic. Supply any `LiveSyncAdapter` implementation
to the player, or use `WebSocketSyncTransport` for JSON-over-WebSocket rooms:

```typescript
import { IVLabsPlayer, WebSocketSyncTransport } from '@interactive-video-labs/core';

const liveSync = new WebSocketSyncTransport({
  url: 'wss://live.example.com/sessions',
  roomId: 'workshop-123',
  clientId: 'student-456',
  reconnect: { initialDelayMs: 500, maxDelayMs: 15_000, multiplier: 2 },
  heartbeat: { intervalMs: 20_000, timeoutMs: 10_000 },
});

const player = new IVLabsPlayer('player-container', {
  videoUrl: 'lesson.mp4',
  cues: lessonCues,
  liveSync: {
    adapter: liveSync,
    role: 'participant',
    driftToleranceSeconds: 0.75,
  },
});

player.onLiveSyncEvent((event) => {
  if (event.type === 'poll:tally') {
    console.log('Live poll tally:', event.payload.counts);
  }
  if (event.type === 'presence:update') {
    console.log('Room participants:', event.payload.participants);
  }
});

player.onLiveSyncStatus(({ status, error }) => {
  console.log('Live sync status:', status, error);
});

// A UI can expose this as its own “Sync to Live” control.
player.syncToLive();

// Optional app-level messages need no UI or framework support in the core.
void player.sendLiveSyncMessage({
  type: 'reaction:submitted',
  payload: { reaction: { emoji: '👏' } },
});
```

Set `role: 'host'` on the instructor player. Host play, pause, seek, and segment
changes are broadcast as `playback:sync`; cue triggers are broadcast by all
participants. Participants apply room snapshots and host playback updates, seeking
only when drift exceeds `driftToleranceSeconds` (default `0.75`). A snapshot's
`serverTimestamp` is Unix time in milliseconds; `videoTimestamp` is media time in
seconds. Playing snapshots advance from the server timestamp. The WebSocket transport
estimates server clock offset from heartbeat pong messages when the server includes
`payload.serverTimestamp`.

The transport sends a `room:join` envelope on connect and each reconnect, and expects
the server to respond with a `room:state` snapshot containing `videoTimestamp`,
`serverTimestamp`, and `isPlaying`. Optional snapshot fields include `videoUrl`,
`segmentUrl`, `mainVideoUrl`, `mainVideoTimestamp`, `activeCueId`, `activeNodeId`,
and `aggregateCounts`. It also normalizes `playback:sync`, `cue:triggered`,
`node:entered`, `decision:submitted`, `poll:tally`, `analytics:updated`, and
`presence:update` messages for `onLiveSyncEvent` subscribers.

Wire messages are JSON envelopes with `type`, `payload`, `roomId`, `clientId`, and a
generated `messageId`. The server should reply to `{ "type": "heartbeat:ping" }` with
`{ "type": "heartbeat:pong", "payload": { "serverTimestamp": 1710000000000 } }`.
Reconnect uses exponential backoff; decision submissions and other outgoing messages
are queued in memory while disconnected (up to 1,000 by default) and flushed after
the next room join. This is a temporary in-process queue, not durable storage; the
server can use `messageId` for deduplication. Local decision persistence continues
through the configured `DecisionAdapter`. Call `player.destroy()` to disconnect and
stop reconnect attempts.

## ✨ Features

The `@interactive-video-labs/core` engine includes the following core functionalities:

- **Core Player (`IVLabsPlayer`):** Orchestrates video playback, cue handling, interactions, and analytics.
- **State Machine:** Manages player state transitions (e.g., idle, playing, waitingForInteraction).
- **Cue Handler:** Manages and triggers cue points based on video time updates.
- **Interaction Manager:** Renders and manages various interaction types (choice, text, video segment changes) and handles user responses.
- **Analytics System:** Provides a flexible hook system for tracking player and interaction events.
- **Segment Manager:** Handles seamless transitions between different video segments.
- **Centralized Types:** Defines all core types and interfaces for consistency across the module.
- **Basic HTML Demo:** A raw HTML demo (`examples/index.html`) to validate core functionality without frameworks.
- **Testing Framework:** Utilizes Vitest for comprehensive unit testing.
- **Localization Support:** Enabled for broader audience reach.
- **Subtitle-based Cue Generation:** Matches cues to subtitle text while preserving the configured times of cues that are not tied to subtitles.
- **Multi-segment Video Lessons:** Capability to support video content divided into multiple segments.
- **Build and Publish Pipeline:** Configured for NPM publishing.
- **Decision Tracking and Persistence:** Supports tracking and persisting user decisions using configurable adapters (e.g., `InMemoryDecisionAdapter`, `LocalStorageDecisionAdapter`).
- **Remote Decision and Progress Sync:** Syncs decision history and playback progress with a configurable JSON API through `RemoteApiDecisionAdapter`.
- **Live Session Sync:** Synchronizes host playback and segment changes, hydrates late joiners, and exposes room events through a pluggable adapter or `WebSocketSyncTransport`.
- **Opt-in Timeline Debugger:** Displays cue and interaction markers, playback time and state, segment/state transitions, an event log, and JSON log export.

### Timeline Debugger

Enable the developer overlay with `debugger: true`. It is disabled by default and adds no debugger UI when omitted.

```typescript
const player = new IVLabsPlayer('player-container', {
  videoUrl: 'lesson.mp4',
  cues: lessonCues,
  debugger: true,
});
```

Use the overlay toggle to view current time, upcoming cues, color-coded cue/interaction markers, and playback events. Cue marker tooltips include available cue metadata. Select **Export logs** to download a JSON event log containing playback time and wall-clock timestamps for cue triggers, interaction responses, segment switches, playback events, and state changes.

---

## 📁 Examples

```
/examples/
  └── index.html      # A raw HTML demo using the built UMD bundle
```

This example helps test core functionality without frameworks like React/Vue.

---

## 🧑‍💻 For Developers

For detailed development setup, project structure, testing, build, and publishing instructions, please refer to our [Developer Guide](DEVELOPER.md).

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING](CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

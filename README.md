# @interactive-video-labs/core
<p align="center">
  <img src="https://raw.githubusercontent.com/interactive-video-labs/docs/main/logo.svg" width="200px" alt="Interactive Video Labs Logo" />
</p>
<p align="center">
  <img src="https://img.shields.io/npm/v/@interactive-video-labs/core" alt="NPM Version" />
  <img src="https://img.shields.io/npm/l/@interactive-video-labs/core" alt="NPM License" />
  <img src="https://img.shields.io/npm/d18m/@interactive-video-labs/core?style=flat-square" alt="NPM Downloads" />
  <a href="https://github.com/interactive-video-labs/core/actions">
    <img src="https://github.com/interactive-video-labs/core/actions/workflows/release.yml/badge.svg" alt="Build Status" />
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
import { IVLabsPlayer } from '@interactive-video-labs/core';

const playerConfig = {
    videoUrl: 'https://interactive-video-labs.github.io/assets/sample-video.mp4',
    cues: [
    {
        id: 'intro',
        time: 2,
        label: 'Introduction',
        payload: { message: 'Welcome!' }
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
                correctAnswer: '4'
            }
        }
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
                        video: 'https://interactive-video-labs.github.io/assets/sample-interaction-1.mp4'
                    },
                    {
                        level: 'Segment B',
                        video: 'https://interactive-video-labs.github.io/assets/sample-interaction-2.mp4'
                    }
                ]
            }
        }
    },
    {
        id: 'midpoint',
        time: 8,
        label: 'Midpoint',
        payload: { message: 'Halfway there!' }
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
                question: 'Your name?'
            }
        }
    },
    {
        id: 'end',
        time: 15,
        label: 'End',
        payload: { message: 'Thanks for watching!' }
    }
],
    initialState: 'idle',
};

// Assuming you have a div with id="player-container" in your HTML
const player = new IVLabsPlayer('player-container', playerConfig);

player.init();
// player.play(); // Start playback
```



## ✨ Features

The `@interactive-video-labs/core` engine includes the following core functionalities:

*   **Core Player (`IVLabsPlayer`):** Orchestrates video playback, cue handling, interactions, and analytics.
*   **State Machine:** Manages player state transitions (e.g., idle, playing, waitingForInteraction).
*   **Cue Handler:** Manages and triggers cue points based on video time updates.
*   **Interaction Manager:** Renders and manages various interaction types (choice, text, video segment changes) and handles user responses.
*   **Analytics System:** Provides a flexible hook system for tracking player and interaction events.
*   **Segment Manager:** Handles seamless transitions between different video segments.
*   **Centralized Types:** Defines all core types and interfaces for consistency across the module.
*   **Basic HTML Demo:** A raw HTML demo (`examples/index.html`) to validate core functionality without frameworks.
*   **Testing Framework:** Utilizes Vitest for comprehensive unit testing.
*   **Localization Support:** Enabled for broader audience reach.
*   **Subtitle-based Cue Generation:** Supports generating cues from subtitles.
*   **Multi-segment Video Lessons:** Capability to support video content divided into multiple segments.
*   **Build and Publish Pipeline:** Configured for NPM publishing.
*   **Decision History Tracking:** Explored with adapters for tracking user decisions.

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
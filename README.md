# 🧠 @interactive-video-labs/core

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

Here's a quick example of how to initialize and use the `IVLabsPlayer` in your project:

```typescript
import { IVLabsPlayer } from '@interactive-video-labs/core';

const player = new IVLabsPlayer({
  // Your player configuration goes here
  // For example:
  // videoElement: document.getElementById('my-video-player'),
  // cues: [
  //   { time: 10, type: 'prompt', data: { message: 'Choose an option!' } },
  // ],
});

player.init();
// player.play();
```

For a more detailed example, refer to the `examples/index.html` file.

---

## 🧱 Module Overview

| File                    | Purpose                                       |
| :---------------------- | :-------------------------------------------- |
| `index.ts`              | Entry point for the bundled package           |
| `player.ts`             | Main engine class `IVLabsPlayer`              |
| `stateMachine.ts`       | Controls state flow: idle → prompt → branch   |
| `cueHandler.ts`         | Listens to video cues, emits events           |
| `interactionManager.ts` | Manages user interaction prompts and branches |
| `analytics.ts`          | Emits lifecycle and custom events             |
| `types.ts`              | Shared TypeScript types and interfaces        |

---

## ✨ Features

The `@interactive-video-labs/core` engine includes the following core functionalities:

*   **Player Configuration Schema:** Defined for robust player setup.
*   **Cue Engine:** Designed to handle video cues and emit events.
*   **Core Class (`IVLabsPlayer`):** The central engine class.
*   **State Machine:** Manages the flow transitions (idle → prompt → branch).
*   **Interaction Manager:** Handles user interaction prompts and branching logic.
*   **Analytics Hook System:** For emitting lifecycle and custom events.
*   **Centralized Types:** Shared TypeScript types and interfaces for consistency.
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
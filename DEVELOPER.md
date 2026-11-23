# Developer Guide for @interactive-video-labs/core

This guide provides technical details for developers working on `@interactive-video-labs/core`, the framework-agnostic TypeScript module for interactive video experiences.

## 🚀 Getting Started

To set up your development environment, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/interactive-video-labs/core.git
    cd core
    ```
2.  **Install Dependencies:** We use `pnpm` for efficient dependency management. If you don't have `pnpm` installed, you can install it via npm:
    ```bash
    npm install -g pnpm
    ```
    Then, install the project dependencies:
    ```bash
    pnpm install
    ```

## 📂 Project Structure

```
/core
  ├── src/                # Core TypeScript source code
  │   ├── analytics.ts
  │   ├── cueHandler.ts
  │   ├── index.ts
  │   ├── interactionManager.ts
  │   ├── player.ts
  │   ├── stateMachine.ts
  │   └── types.ts
  ├── examples/           # Basic HTML demo using the built UMD bundle
  │   └── index.html
  ├── test/               # Unit tests written with Vitest
  │   ├── analytics.test.ts
  │   ├── cueHandler.test.ts
  │   ├── interactionManager.test.ts
  │   ├── player.test.ts
  │   └── stateMachine.test.ts
  ├── package.json        # Project metadata and scripts
  ├── tsconfig.json       # TypeScript configuration
  ├── .gitignore
  ├── LICENSE
  ├── README.md
  └── CONTRIBUTING.md
```

## 🛠 Development Commands

Here are the essential commands for development:

- **Run Demo Project:**

  ```bash
  pnpm serve
  ```

  This command serves the repository root on port 8080 and opens `examples/index.html`. Serving the root keeps the demo's `../dist/index.mjs` import available. Run `pnpm build` first if you've made changes to the source code.

- **Development with Live Reloading:**

  ```bash
  pnpm dev
  ```

  This command watches for changes in the source code and automatically rebuilds the package. You would typically run this in conjunction with `pnpm serve` to see your changes reflected live in the demo.

- **Build Core Package:**

  ```bash
  pnpm build
  ```

  This command compiles the TypeScript source code into JavaScript, generating ESM, CJS, and UMD builds, along with TypeScript type definitions (`.d.ts` files) in the `dist/` directory.

- **Run Unit Tests:**
  ```bash
  pnpm test
  ```
  This command executes the unit tests located in the `test/` directory using Vitest. Ensure all tests pass before submitting changes.

## 🐛 Debugging

For debugging, you can leverage your IDE's debugging capabilities. For example, in VS Code, you can set breakpoints in your TypeScript files (`src/*.ts`) and use the built-in debugger when running `pnpm dev` or `pnpm test`.

## 📬 NPM Publishing

The package is published to NPM under the name `@interactive-video-labs/core`.

To publish:

```bash
pnpm publish --access public
```

## 📊 Analytics Hook System

The player includes a flexible analytics hook system that allows you to track key events in the video interaction lifecycle. You can register custom callbacks for standardized events to integrate with your own analytics services.

### Standardized Events

The following events are emitted by the player:

- `onCueEnter`: Fired when a cue point is reached.
- `onPromptShown`: Fired when an interaction prompt is displayed to the user.
- `onInteractionSelected`: Fired when the user makes a choice in an interaction.
- `onBranchJump`: Fired when the video branches to a new segment.
- `onSessionEnd`: Fired when the player is destroyed.

### Usage

To use the analytics hook system, you can register a callback for any of the standardized events using the `on` method of the player instance:

```javascript
const player = new IVLabsPlayer('player-container', config);

player.on('onCueEnter', (payload) => {
  console.log('Cue entered:', payload.cueId);
});

player.on('onInteractionSelected', (payload) => {
  console.log('Interaction selected:', payload.data.response);
});
```

## 🤝 Contributing

For guidelines on how to contribute to the project, please refer to the `CONTRIBUTING.md` file.

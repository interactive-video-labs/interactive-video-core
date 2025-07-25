# 🧠 @ivlabs/core Roadmap

Welcome to the core engine roadmap of `@ivlabs/core` — the framework-agnostic TypeScript module powering our interactive video experiences. This engine is designed to be lightweight, extendable, and usable across React, Vue, or plain JavaScript apps.

---

## 📦 repo Strategy (with `pnpm`)

This project uses [`pnpm`](https://pnpm.io) workspaces for efficient dependency management.

```bash
pnpm install
pnpm dev         # Run demo project
pnpm build       # Build core package
pnpm test        # Run unit tests
```

Structure:

```
/core
  ├── schema/
  ├── src/
  ├── examples/
  ├── test/
  ├── package.json
  └── tsconfig.json
```

---

## 🧱 Module Overview

| File                    | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `index.ts`              | Entry point for the bundled package           |
| `player.ts`             | Main engine class `IVLabsPlayer`              |
| `stateMachine.ts`       | Controls state flow: idle → prompt → branch   |
| `cueHandler.ts`         | Listens to video cues, emits events           |
| `interactionManager.ts` | Manages user interaction prompts and branches |
| `analytics.ts`          | Emits lifecycle and custom events             |
| `types.ts`              | Shared TypeScript types and interfaces        |

---

## 🧠 GitHub Project: Ideas / Planning

All the following cards are listed under the **Ideas / Planning** column in our GitHub Project Kanban board:

- ✅ **Define player configuration schema (**``**)**
- ✅ **Design cue engine in **``
- ✅ **Implement **``** core class**
- ✅ **Build state machine for flow transitions**
- ✅ **Create interaction manager**
- ✅ **Define analytics hook system**
- ✅ **Centralize shared types and payloads**
- ✅ **Create a basic HTML demo to validate core**
- ✅ **Choose testing framework (Vitest)**
- ✅ **Write unit tests for cueHandler and stateMachine**
- ✅ **Plan analytics event flow**
- ✅ **Add localization support**
- ✅ **Enable subtitle-based cue generation**
- ✅ **Support multi-segment video lessons**
- ✅ **Create build and publish pipeline for NPM**
- ✅ **Explore decision history tracking and adapters**

---

## 📌 Future Ideas

> These features are not part of MVP, but valuable to consider:

- 👁 Visual timeline debugger for developers
- 🧠 AI-based cue detection via Whisper
- 🔌 Web Component wrapper for easy embed
- 📡 WebSocket sync support for live sessions
- 🎓 LMS integration spec (SCORM/xAPI bridges)

---

## 📁 Examples

```
/examples/
  └── basic.html      # A raw HTML demo using the built UMD bundle
```

This helps test core functionality without frameworks like React/Vue.

---

## 🧪 Testing

The test suite is written in [Vitest](https://vitest.dev), located under:

```
/test/
  ├── player.test.ts
  ├── cueHandler.test.ts
  └── stateMachine.test.ts
```

Run tests:

```bash
pnpm test
```

---

## 🛠 Build and Publish

Use [`tsup`](https://tsup.egoist.dev/) or `rollup` for bundling:

```bash
pnpm build
```

Outputs:

- ESM + CJS builds
- UMD build for CDN usage
- `types` for full TS support

---

## 📬 NPM Publishing (Planned)

```bash
pnpm publish --access public
```

Name suggestion: `@ivlabs/core`

---



# Changelog

## v0.1.4 2025 08 11

### Fixes

- InteractionManager test failures and improved test robustness.

### Updates

- Update src/interactionManager.ts

### Features

- Improve tsup build configuration
- Configure tsup for build process

## v0.1.2 2025 07 31

### Refactor

- Scope global CSS rules to .ivl-player-container
- Re-embed fallback CSS in player.ts with !important rules

### Features

- Add JSDoc comment to FALLBACK_CSS
- Add mock for document.head and style element in player tests

## v0.1.1 2025 07 30

### Docs

- Update README and DEVELOPER.md for decision tracking and serve command

## v0.1.0 2025 07 29

Initial stable release candidate

## v0.0.4 2025 07 29

### Features

- Improve README and example usage
- Add files via upload

### Fixes

- Standardize pnpm version in GitHub Actions

### CI

- Update release.yml

## v0.0.2 2025 07 28

### Features

- Automate versioning and publishing with semantic-release
- Add GitHub Actions workflow for running tests
- Implement video segment branching and interaction improvements
- Update pnpm-lock.yaml with jsdom dependency and remove optional flags

### Fixes

- Ensure VIDEO_ENDED event is tracked

### Chore

- Exclude test directory from compilation

### Docs

- Changelog date format standardized

## v0.0.1 2025 07 26

### Features

- **player**: Resume playback after interaction
- Update testing setup and dependencies

### CI

- Configure Node.js setup for NPM registry
- Add --no-git-checks to pnpm publish
- Add NPM publish workflow

### Docs

- Update README example
- Refactor README and Developer Guide
- Improve README and Developer Guide
- **types**: Add docstring to types.ts
- **stateMachine**: Add docstrings to StateMachine methods
- **player**: Add docstrings to IVLabsPlayer methods
- **interactionManager**: Add docstrings to InteractionManager methods
- **analytics**: Add docstrings to Analytics methods
- **cueHandler**: Add docstrings to CueHandler methods
- **cueHandler**: Add docstring to CueHandler class
- **player**: Add docstring to IVLabsPlayer class
- **stateMachine**: Add docstring to StateMachine class
- **analytics**: Add docstring to Analytics class

### Chore

- video target added

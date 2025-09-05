## v0.1.6 2025-09-05

### Added

- simplify version bump process
- coverage added
- file relative path updated
- vitest updated
- node version upgraded 20 to 22
- gitignore xml file added
- Add Vitest coverage and update pnpm dependencies
- Migrate CI workflow to use pnpm
- Use rimraf for cross-platform clean script
- Add GitHub Actions workflow for tagging releases
- remove package-lock.json and update examples
- Configure tsup for build process
- support subtitles #14
- Add JSDoc comment to FALLBACK_CSS
- Add mock for document.head and style element in player tests
- Enhance localStorage error handling and update Decision interface
- Add error handling for getDecisionHistory()
- Allow DecisionAdapter to be injected via config
- Add unit tests for decision adapters
- Move InMemoryDecisionAdapter to its own file and add JSDoc
- Add JSDoc comments and type import
- Implement internationalization for player
- implement analytics hook system
- add segmentManager test
- Bump version to 0.1.0 and update changelog
- Improve README and example usage
- Implement Semantic Release with GitHub Actions
- Automate versioning and publishing with semantic-release
- Add GitHub Actions workflow for running tests

### Changed

- Merge pull request #79 from taj54/main
- add version bump workflow
- Merge pull request #78 from taj54/main
- improve CI/CD and code style
- Merge pull request #77 from interactive-video-labs/renovate/actions-setup-node-5.x
- update actions/setup-node action to v5
- Merge pull request #76 from interactive-video-labs/renovate/taj54-universal-version-bump-0.x
- update taj54/universal-version-bump action to v0.14.0
- Merge pull request #75 from interactive-video-labs/renovate/taj54-universal-version-bump-0.x
- Merge pull request #74 from interactive-video-labs/renovate/pnpm-10.x
- update taj54/universal-version-bump action to v0.13.2
- update pnpm to v10.15.1
- Merge pull request #73 from taj54/main
- update version-bump action to v0.12.0
- Merge pull request #72 from interactive-video-labs/renovate/taj54-universal-version-bump-0.x
- update taj54/universal-version-bump action to v0.10.0
- Merge pull request #71 from taj54/main
- new latest version added
- Merge pull request #69 from interactive-video-labs/renovate/pnpm-10.x
- update pnpm to v10.15.0
- Update tag-after-merge.yml
- Merge pull request #68 from taj54/main
- Update .github/workflows/tag-after-merge.yml
- Update .github/workflows/tag-after-merge.yml
- add major/minor release heading in GitHub release notes
- Merge pull request #67 from interactive-video-labs/release/v0.1.5
- bump version to v0.1.5
- Merge pull request #66 from taj54/main
- Merge pull request #65 from taj54/main
- Merge pull request #64 from taj54/main
- checking for ci test
- Merge pull request #63 from interactive-video-labs/renovate/actions-checkout-5.x
- update actions/checkout action to v5
- Merge pull request #62 from taj54/main
- order updated
- //github.com/taj54/interactive-video-core
- codecov test adde inti test
- Merge pull request #59 from interactive-video-labs/renovate/actions-checkout-5.x
- Merge pull request #60 from taj54/main
- //github.com/taj54/interactive-video-core
- update actions/checkout action to v5
- Merge pull request #58 from taj54/main
- Merge pull request #57 from interactive-video-labs/renovate/actions-checkout-5.x
- update actions/checkout action to v5
- Merge pull request #56 from taj54/main
- //github.com/taj54/interactive-video-core
- Merge pull request #55 from taj54/main
- //github.com/taj54/interactive-video-core
- unused types are removed
- Merge pull request #54 from interactive-video-labs/renovate/major-vitest-monorepo
- update dependency vitest to v3
- Merge pull request #53 from interactive-video-labs/renovate/node-22.x
- Merge pull request #52 from interactive-video-labs/renovate/actions-checkout-5.x
- update dependency node to v22
- update actions/checkout action to v5
- Merge pull request #50 from interactive-video-labs/renovate/pnpm-10.x
- Merge pull request #49 from interactive-video-labs/renovate/typescript-5.x-lockfile
- update pnpm to v10.14.0
- update dependency typescript to v5.9.2
- Merge pull request #48 from interactive-video-labs/renovate/configure
- Add renovate.json
- Merge pull request #46 from taj54/main
- Update CHANGELOG.md for v0.1.4
- Merge pull request #45 from interactive-video-labs/release/v0.1.4
- bump version to v0.1.4
- Merge pull request #44 from taj54/main
- Update src/interactionManager.ts
- //github.com/taj54/interactive-video-core
- InteractionManager test failures and improved test robustness.
- Merge pull request #43 from taj54/main
- Improve tsup build configuration
- Merge pull request #42 from taj54/main
- Merge pull request #41 from taj54/main
- update build status link in README
- Merge pull request #40 from Bmongo/main
- Update examples/index.html
- Update src/subtitlesManager.ts
- Merge pull request #38 from interactive-video-labs/release/v0.1.3
- bump version to v0.1.3
- Merge pull request #37 from taj54/main
- Update repository URL in package.json
- Merge pull request #36 from taj54/main
- Update CHANGELOG.md
- Merge pull request #35 from interactive-video-labs/release/v0.1.2
- bump version to v0.1.2
- Merge pull request #33 from taj54/main
- Scope global CSS rules to .ivl-player-container
- Re-embed fallback CSS in player.ts with !important rules
- Update README and DEVELOPER.md for decision tracking and serve command
- Merge pull request #32 from interactive-video-labs/release/v0.1.1
- bump version to v0.1.1
- Merge pull request #31 from taj54/main
- Improve log message rendering in examples/index.html
- //github.com/taj54/core
- implement decision tracking and persistence
- Merge pull request #30 from taj54/main
- Merge pull request #29 from taj54/main
- Merge pull request #28 from taj54/main
- Merge pull request #27 from taj54/main
- //github.com/taj54/core
- changelog minor release version updated
- Merge pull request #26 from taj54/main
- Remove semantic-release json file
- Merge pull request #25 from taj54/main
- Merge branch 'main' into main
- Remove semantic-release dependencies
- Update CHANGELOG.md for v0.0.4
- Merge pull request #24 from interactive-video-labs/release/v0.0.4
- bump version to v0.0.4
- Merge pull request #23 from taj54/main
- //github.com/taj54/core
- Delete logo.svg
- Add files via upload
- Merge pull request #20 from interactive-video-labs/release/v0.0.3
- bump version to v0.0.3
- Merge pull request #19 from taj54/main
- Merge branch 'main' into main
- Update release.yml
- main' into main
- Update release workflow to publish to npm on release creation\"
- Merge pull request #18 from taj54/main
- //github.com/taj54/core
- main' into main
- Add version bump workflow\"
- txt removed
- Update publishing workflow and changelog
- Merge pull request #17 from taj54/main
- //github.com/taj54/core
- Merge pull request #16 from taj54/main
- Ensure VIDEO_ENDED event is tracked 2 3 The `VIDEO_ENDED` event was not being tracked due to a missing event listener in `src/player.ts`. This commit adds the `ended` event listener to the video element to ensure `VIDEO_ENDED` is tracked by analytics. 4 5 Additionally, the `test/player.test.ts` file was updated to correctly identify the `ended` event listener, making the test more robust.

### Fixed

- Standardize pnpm version in GitHub Actions
- Resolve 'Multiple versions of pnpm specified

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

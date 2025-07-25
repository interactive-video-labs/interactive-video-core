# Contributing to @interactive-video-labs/core

We welcome contributions to `@interactive-video-labs/core`! By contributing, you help us improve and expand the capabilities of our interactive video engine.

## How to Contribute

1.  **Fork the Repository:** Start by forking the `@interactive-video-labs/core` repository to your GitHub account.
2.  **Clone Your Fork:** Clone your forked repository to your local machine:
    ```bash
    git clone https://github.com/interactive-video-labs/core.git
    cd core
    ```
3.  **Install Dependencies:** This project uses `pnpm` for efficient dependency management.
    ```bash
    pnpm install
    ```
4.  **Create a New Branch:** Create a new branch for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
    or
    ```bash
    git checkout -b bugfix/your-bug-fix-name
    ```
5.  **Make Your Changes:** Implement your feature or bug fix. Ensure your code adheres to the existing style and conventions.
6.  **Run Tests:** Before committing, make sure all existing tests pass and add new tests for your changes if applicable.
    ```bash
    pnpm test
    ```
7.  **Build the Project:** Verify that the project builds successfully after your changes.
    ```bash
    pnpm build
    ```
8.  **Commit Your Changes:** Write a clear and concise commit message.
    ```bash
    git commit -m "feat: Add new feature"
    ```
    or
    ```bash
    git commit -m "fix: Resolve bug in module X"
    ```
9.  **Push to Your Fork:** Push your changes to your forked repository:
    ```bash
    git push origin feature/your-feature-name
    ```
10. **Create a Pull Request:** Open a pull request from your forked repository to the `main` branch of the original `@interactive-video-labs/core` repository. Provide a detailed description of your changes.

## Development Workflow

### Project Structure

```
/core
  ├── src/                # Core source code
  ├── examples/           # Example usage of the core module
  ├── test/               # Unit tests
  ├── package.json
  └── tsconfig.json
```

### Module Overview

| File                    | Purpose                                       |
| :---------------------- | :-------------------------------------------- |
| `index.ts`              | Entry point for the bundled package           |
| `player.ts`             | Main engine class `IVLabsPlayer`              |
| `stateMachine.ts`       | Controls state flow: idle → prompt → branch   |
| `cueHandler.ts`         | Listens to video cues, emits events           |
| `interactionManager.ts` | Manages user interaction prompts and branches |
| `analytics.ts`          | Emits lifecycle and custom events             |
| `types.ts`              | Shared TypeScript types and interfaces        |

### Running Examples

To run the basic HTML demo:

```bash
pnpm dev
```

This will typically start a development server that serves the `examples/index.html` file.

### Testing

The test suite is written in [Vitest](https://vitest.dev).

To run tests:

```bash
pnpm test
```

### Building

To build the package:

```bash
pnpm build
```

This command generates ESM, CJS, and UMD builds, along with TypeScript type definitions.

## Code Style

Please adhere to the existing code style and conventions within the project. We use ESLint and Prettier for code formatting and linting. Ensure your code passes linting checks before submitting a pull request.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on our GitHub repository. Provide as much detail as possible, including steps to reproduce the issue or a clear description of the desired feature.

Thank you for contributing!

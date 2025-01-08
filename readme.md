# ESLint Config Builder

A TypeScript-based library for generating ESLint configurations in the Flat Config format, targeting React (optional) and TypeScript (mandatory) projects.

## Features

- Generates ESLint Flat Configs for ESLint v9.
- Supports TypeScript and optionally React and NodeJS
- Config options:
  - `strict`: Enables stricter linting rules.
  - `style`: Adds additional rules for style guidelines.
- Plugins for:
  - `jsdoc`: Typescript-aware JSDoc linting
  - `react`: Recommended checks from the react, hooks and compiler presets
  - `regexp`: Recommended mostly auto-fix rules for regular expressions
  - `node`: Recommended rules for development of ESM-enabled NodeJS scripts
- Tweaks:
  - `biome`: Drop rules achievable by Biome
  - `fast`: Drop rules which require typing information (much faster)
- Automatically drops rules handled by Prettier.

## Installation

```bash
npm install @effective/eslint-cfg
```

## Usage

```ts
// eslint.config.ts
import { getConfig } from "@effective/eslint-cfg"

const config = getConfig({
  react: true,
  strict: true,
  style: true
})

export default [
  {
    ignores: ["node_modules", "dist"]
  },
  {
    settings: {
      react: {
        version: "19.0"
      }
    }
  },
  {
    files: ["**/*.ts", "**/*.tsx"]
  },
  {
    rules: {
      // custom rules / overrides
    }
  }
]
```

## Developer

### Build

```bash
pnpm run build
```

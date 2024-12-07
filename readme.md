# ESLint Config Builder

A TypeScript-based library for generating ESLint configurations in the Flat Config format, targeting React (optional) and TypeScript (mandatory) projects.

## Features

- Generates ESLint Flat Configs for ESLint 9.
- Supports TypeScript and optionally React.
- Config options to include:
  - `strict`: Enables stricter linting rules.
  - `style`: Adds additional rules for style guidelines.
  - `biome`: Filters rules achievable by Biome.
- Automatically reduces rules handled by Prettier.

## Installation

```bash
npm install eslint-config-builder
```

## Usage

```ts
import { createConfig } from "eslint-config-builder";

const config = createConfig({
  react: true,
  strict: true,
  style: true,
  biome: false,
});

// Output the generated configuration
console.log(config);
```

## Build

```bash
pnpm run build
```

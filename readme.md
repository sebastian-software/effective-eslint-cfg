# ESLint Config Builder

[![Sponsored by][sponsor-img]][sponsor] [![License][github-license-img]][github] [![Version][npm-version-img]][npm] [![Build][github-action-img]][github] [![Downloads][npm-downloads-img]][npm]

[sponsor]: https://www.sebastian-software.de
[sponsor-img]: https://badgen.net/badge/Sponsored%20by/Sebastian%20Software/c41e54
[npm]: https://www.npmjs.com/package/@effective/eslint-cfg
[npm-downloads-img]: https://badgen.net/npm/dm/@effective/eslint-cfg
[npm-version-img]: https://badgen.net/npm/v/@effective/eslint-cfg
[github]: https://github.com/sebastian-software/effective-eslint-cfg
[github-license-img]: https://badgen.net/github/license/sebastian-software/effective-eslint-cfg
[github-action-img]: https://github.com/sebastian-software/effective-eslint-cfg/actions/workflows/node.js.yml/badge.svg

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

Note: Using TS configuration files work perfectly fine since ESLint v9 but requires installing `jiti` and using `eslint --flag unstable_ts_config`.

## Developer

### Build

```bash
pnpm run build
```

## License

[Apache License; Version 2.0, January 2004](http://www.apache.org/licenses/LICENSE-2.0)

## Copyright

<img src="https://cdn.rawgit.com/sebastian-software/sebastian-software-brand/0d4ec9d6/sebastiansoftware-en.svg" alt="Logo of Sebastian Software GmbH, Mainz, Germany" width="460" height="160"/>

Copyright 2024-2025<br/>[Sebastian Software GmbH](https://www.sebastian-software.de)

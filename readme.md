# @effective/eslint-cfg

[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![License][github-license-img]][github]

[sponsor]: https://www.sebastian-software.de
[sponsor-img]: https://badgen.net/badge/Sponsored%20by/Sebastian%20Software/c41e54
[npm]: https://www.npmjs.com/package/@effective/eslint-cfg
[npm-downloads-img]: https://badgen.net/npm/dm/@effective/eslint-cfg
[npm-version-img]: https://badgen.net/npm/v/@effective/eslint-cfg
[github]: https://github.com/sebastian-software/effective-eslint-cfg
[github-license-img]: https://badgen.net/github/license/sebastian-software/effective-eslint-cfg

**Pre-generated, opinionated ESLint configurations for TypeScript projects. Zero runtime overhead. Full type-checking. AI-ready.**

## Why?

ESLint is powerful but slow to configure. Most config packages generate rules at runtime, parsing dozens of plugins on every lint run. This package takes a different approach:

- **Pre-generated configs** - All 16 possible configurations are built at publish time. Your editor loads instantly.
- **Type-checked by default** - Every config uses `projectService` for full TypeScript type information.
- **Curated rule sets** - Battle-tested combinations of ESLint, TypeScript-ESLint, React, and more. No decision fatigue.
- **AI-optimized mode** - Strict maintainability rules that push AI to iterate until the code is actually good.

## Installation

```bash
npm install @effective/eslint-cfg
# or
pnpm add @effective/eslint-cfg
```

**Note:** Requires ESLint v9+ and TypeScript. For TypeScript config files, install `jiti`.

## Quick Start

```ts
// eslint.config.ts
import { getConfig } from "@effective/eslint-cfg"

export default [
  { ignores: ["node_modules", "dist"] },
  ...(await getConfig({ strict: true }))
]
```

That's it. You get a fully configured, type-aware ESLint setup.

## Configuration Options

Only 4 flags. Each one is intentional.

| Option | Description |
|--------|-------------|
| `strict` | Enables stricter TypeScript rules (`strictTypeChecked` instead of `recommendedTypeChecked`) |
| `node` | Adds Node.js-specific rules (ESM modules, proper imports) |
| `react` | Adds React, Hooks, JSX-A11y, and Storybook rules |
| `ai` | Strict maintainability rules that make AI write better code |

### Examples

**TypeScript library:**
```ts
await getConfig({ strict: true, node: true })
```

**React application:**
```ts
await getConfig({ strict: true, react: true })
```

**Validating AI-generated code:**
```ts
await getConfig({ strict: true, ai: true })
```

**Full stack with AI validation:**
```ts
await getConfig({ strict: true, node: true, react: true, ai: true })
```

## The AI Mode

The `ai` option is designed for a specific use case: **making AI iterate until the code is actually good**.

When you use ESLint with strict rules in your AI coding workflow, the AI doesn't just write code once - it keeps refactoring until all rules pass. Without guardrails, AI tends to:
- Create overly complex functions
- Nest logic too deeply
- Duplicate code instead of abstracting
- Ignore stylistic consistency

The `ai` flag enforces standards that push AI to do better:

### Complexity Limits

| Rule | Limit | Why |
|------|-------|-----|
| `complexity` | 10 | Cyclomatic complexity - too many branches = hard to test |
| `max-depth` | 3 | Nesting depth - deeply nested code is hard to read |
| `max-nested-callbacks` | 2 | Callback hell prevention |
| `max-params` | 4 | Too many params = function does too much |
| `sonarjs/cognitive-complexity` | 10 | Mental burden score - better than cyclomatic |

### Size Limits

| Rule | Limit | Why |
|------|-------|-----|
| `max-lines` | 300 | Files should be focused |
| `max-lines-per-function` | 50 | Functions should do one thing |
| `max-statements` | 15 | Statement count correlates with complexity |
| `max-statements-per-line` | 1 | One thing per line |

### Code Quality

| Rule | Why |
|------|-----|
| `sonarjs/no-duplicate-string` | Extract repeated strings to constants |
| `sonarjs/no-identical-functions` | DRY - don't repeat yourself |
| `sonarjs/no-collapsible-if` | Simplify nested conditions |
| `sonarjs/prefer-immediate-return` | Don't store values just to return them |
| `sonarjs/prefer-single-boolean-return` | Simplify boolean returns |
| `no-nested-ternary` | Ternaries in ternaries are unreadable |
| `no-param-reassign` | Mutations cause bugs |

### Style (also included with `ai`)

The `ai` flag also enables:
- **TypeScript stylistic rules** (`@typescript-eslint/prefer-nullish-coalescing`, etc.)
- **Import sorting** (via `simple-import-sort`)
- **Jest style rules** (for test files)

Why bundle style with AI? Because AI-generated code should be stylistically consistent too. If you're validating AI output, you want the full package.

## What's Included

Every configuration includes:

- **ESLint recommended** - The basics
- **TypeScript-ESLint** - Full type-aware linting
- **JSDoc** - Documentation quality (TypeScript-aware)
- **RegExp** - Regex best practices
- **Prettier compat** - Disables rules that conflict with Prettier

With `react: true`:
- **React** - Core React rules
- **React Hooks** - All 18 recommended hook rules
- **React Compiler** - Future-proof React optimization
- **JSX-A11y** - Accessibility
- **Storybook** - Story file linting

With `node: true`:
- **Node.js** - ESM module rules, import resolution

With `ai: true`:
- **SonarJS** - Cognitive complexity, code smells
- **Stylistic** - Consistent code style
- **Import sorting** - Clean imports

## Pre-generation: How It Works

Most ESLint config packages do this at runtime:
```
Your config → Parse plugins → Merge rules → Generate config → Lint
```

This package does the heavy lifting at publish time:
```
Build time: Generate all 16 combinations → Publish as static JS

Runtime: Load pre-built config → Lint
```

The result? Your editor doesn't choke when opening a file. CI doesn't waste seconds on config generation. The config is just... there.

## Helper Functions

Need to tweak the config? We've got you covered.

### `setRuleSeverity(config, ruleName, severity)`

```ts
import { getConfig, setRuleSeverity } from "@effective/eslint-cfg"

const config = await getConfig({ strict: true })
setRuleSeverity(config, "no-console", "warn")
```

### `configureRule(config, ruleName, options)`

```ts
import { getConfig, configureRule } from "@effective/eslint-cfg"

const config = await getConfig({ strict: true })
configureRule(config, "max-len", [{ code: 120 }])
```

### `disableRule(config, ruleName)`

```ts
import { getConfig, disableRule } from "@effective/eslint-cfg"

const config = await getConfig({ strict: true })
disableRule(config, "complexity")
```

### `addRule(config, ruleName, severity, options)`

```ts
import { getConfig, addRule } from "@effective/eslint-cfg"

const config = await getConfig({ strict: true })
addRule(config, "no-console", "error")
```

## Full Example

```ts
// eslint.config.ts
import { getConfig, setRuleSeverity, disableRule } from "@effective/eslint-cfg"

const base = await getConfig({
  strict: true,
  react: true,
  ai: true
})

export default [
  { ignores: ["node_modules", "dist", "coverage"] },

  // React version for jsx-runtime
  {
    settings: {
      react: { version: "19.0" }
    }
  },

  // The pre-generated config
  ...base,

  // Your overrides
  {
    rules: {
      // Relax some rules for your codebase
      "max-lines-per-function": ["error", { max: 80 }]
    }
  }
]
```

## License

[Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)

## Copyright

<img src="https://cdn.rawgit.com/sebastian-software/sebastian-software-brand/0d4ec9d6/sebastiansoftware-en.svg" alt="Sebastian Software GmbH" width="460" height="160"/>

Copyright 2024-2025 [Sebastian Software GmbH](https://www.sebastian-software.de)

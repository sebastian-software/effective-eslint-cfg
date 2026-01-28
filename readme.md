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

## Why This Exists

Setting up ESLint for a modern TypeScript project is surprisingly painful. You need to:
- Choose between dozens of plugins
- Figure out which rules overlap or conflict
- Configure TypeScript parser settings correctly
- Wait for config generation on every lint run

**We solved this.** This package gives you a single function call that returns a battle-tested, pre-generated configuration. Your editor loads instantly. Your CI doesn't waste time. You get type-aware linting that actually works.

```ts
import { getConfig } from "@effective/eslint-cfg"

export default [
  { ignores: ["node_modules", "dist"] },
  ...(await getConfig({ strict: true, react: true }))
]
```

That's your entire ESLint config. Done.

## What Makes This Different

### Pre-Generated Configs

Most ESLint config packages generate rules at runtime - parsing plugins, merging configs, resolving conflicts. Every. Single. Time.

We do the heavy lifting once at publish time. All 16 possible configurations ship as static JavaScript. When you import them, they're just... there. No parsing, no merging, no waiting.

### Full Type-Checking, Always

Every configuration uses TypeScript's `projectService` for full type information. Rules like `@typescript-eslint/no-floating-promises` or `@typescript-eslint/await-thenable` actually work. No compromises.

### Designed for AI Workflows

The `ai` flag isn't about validating code after it's written. It's about **making AI iterate until the code is good**. When Claude or Copilot writes a 200-line function with nested callbacks, ESLint fails, and the AI tries again. And again. Until it gets it right.

### Easy Customization

Don't agree with a rule? Change it. Our helper functions let you adjust severity while keeping the rule's configuration intact - something that's annoyingly hard to do in ESLint otherwise:

```ts
import { getConfig, setRuleSeverity, disableRule } from "@effective/eslint-cfg"

const config = await getConfig({ strict: true })

// Downgrade to warning - keeps all the rule's options intact
setRuleSeverity(config, "@typescript-eslint/no-unused-vars", "warn")

// Turn off completely
disableRule(config, "@typescript-eslint/no-explicit-any")
```

## Installation

```bash
npm install @effective/eslint-cfg
# or
pnpm add @effective/eslint-cfg
```

Requires ESLint v9+ and TypeScript. For TypeScript config files, also install `jiti`.

## Configuration Options

Four flags. Each one is intentional.

| Option | What You Get |
|--------|--------------|
| `strict` | Stricter TypeScript rules via `strictTypeChecked` (recommended) |
| `node` | Node.js rules for ESM modules, imports, and built-ins |
| `react` | React, Hooks, Compiler, JSX-A11y, and Storybook rules |
| `ai` | Maintainability rules + stylistic consistency for AI workflows |

### Common Combinations

```ts
// TypeScript library
await getConfig({ strict: true, node: true })

// React application
await getConfig({ strict: true, react: true })

// AI-assisted development
await getConfig({ strict: true, ai: true })

// Full stack with AI
await getConfig({ strict: true, node: true, react: true, ai: true })
```

## The AI Mode

When you code with AI assistants, quality depends on feedback loops. The `ai` flag creates a strict feedback loop that pushes AI to write better code:

### Complexity Limits

| Rule | Limit | Why |
|------|-------|-----|
| `complexity` | 10 | Cyclomatic complexity - too many branches = hard to test |
| `max-depth` | 3 | Deep nesting = hard to read |
| `max-nested-callbacks` | 2 | Callback hell prevention |
| `max-params` | 4 | Too many params = function does too much |
| `sonarjs/cognitive-complexity` | 10 | Mental burden score |

### Size Limits

| Rule | Limit | Why |
|------|-------|-----|
| `max-lines` | 300 | Files should be focused |
| `max-lines-per-function` | 50 | Functions should do one thing |
| `max-statements` | 15 | Fewer statements = clearer logic |
| `max-statements-per-line` | 1 | One thing per line |

### Code Quality (SonarJS)

| Rule | Why |
|------|-----|
| `sonarjs/no-duplicate-string` | Extract repeated strings |
| `sonarjs/no-identical-functions` | DRY principle |
| `sonarjs/no-collapsible-if` | Simplify conditions |
| `sonarjs/prefer-immediate-return` | Don't store just to return |
| `sonarjs/prefer-single-boolean-return` | Simplify boolean returns |
| `no-nested-ternary` | Ternaries in ternaries are unreadable |
| `no-param-reassign` | Mutations cause bugs |

### Style & Consistency

The `ai` flag also enables:
- **TypeScript stylistic rules** - `prefer-nullish-coalescing`, `prefer-optional-chain`, `consistent-type-definitions`, and more
- **Import sorting** - Automatic, consistent import order via `simple-import-sort`

Why bundle style with AI? Because inconsistent code is harder to maintain. If AI writes your code, it should follow your style.

## File-Specific Rules

Each configuration automatically applies different rules to different file types:

| Files | What's Different |
|-------|------------------|
| `**/*.test.{ts,tsx}` | + Vitest rules, size limits disabled |
| `**/*.spec.ts` | + Playwright rules, size limits disabled |
| `**/*.stories.{ts,tsx}` | + Storybook rules |
| `**/*.config.{ts,mts,cts}` | Lenient rules for config files |
| `**/*.d.ts` | Relaxed rules for type declarations |

### Test Files

Test files get Vitest and Testing Library rules automatically. Size limits (`max-lines`, `max-lines-per-function`, `max-statements`) are disabled because tests are often long.

```ts
// This just works - Vitest rules apply automatically
await getConfig({ strict: true })
```

### Config Files

Config files (`vite.config.ts`, `vitest.config.ts`, `eslint.config.ts`, etc.) have relaxed rules:
- `@typescript-eslint/no-require-imports`: off (CJS plugins)
- `no-console`: off (build output)
- Size/complexity limits: off

### Type Declaration Files

`*.d.ts` files have rules adjusted for declaration-only code:
- `@typescript-eslint/no-unused-vars`: off (declarations don't "use" types)
- `@typescript-eslint/no-empty-object-type`: off (declaration merging)
- `@typescript-eslint/triple-slash-reference`: off (standard in d.ts)

### Why `.test` vs `.spec`?

We use `.test.ts` for unit tests (Vitest) and `.spec.ts` for E2E tests (Playwright). This follows [Playwright's documentation](https://playwright.dev/docs/test-configuration) which consistently uses `.spec.ts`.

Some projects use `.spec` for unit tests too - if that's you, you'll need to adjust the file patterns.

### Co-located Tests

We match by file name pattern, not by directory (`__tests__/**`). This supports co-locating tests next to the code they test:

```
src/
  utils/
    dateUtils.ts
    dateUtils.test.ts     ← Vitest rules, no size limits
  components/
    Button.tsx
    Button.test.tsx       ← Vitest rules, no size limits
    Button.stories.tsx    ← Storybook rules
vite.config.ts            ← Lenient config rules
global.d.ts               ← Declaration rules
```

## What's Included (Always)

Every configuration includes:

- **ESLint recommended** - The foundation
- **TypeScript-ESLint type-checked** - Full type-aware rules
- **JSDoc** - Documentation quality checks (TypeScript-aware)
- **RegExp** - Regex best practices
- **Vitest + Testing Library** - Test file rules (also works with Bun Test)
- **Playwright** - E2E test rules
- **Prettier compat** - Rules that conflict with Prettier are disabled

With `react: true`:
- **React recommended** - Core React rules
- **React Hooks** - All 18 rules from `recommended-latest`
- **React Compiler** - Future-proof optimization rules
- **JSX-A11y** - Accessibility rules
- **Storybook** - Story file linting

With `node: true`:
- **Node.js ESM** - Proper module resolution and import rules

## Helper Functions

The config is yours to customize.

### `setRuleSeverity(config, ruleName, severity)`

Change a rule's severity while **preserving its configuration**. This is surprisingly hard to do in ESLint normally - you'd have to copy all the options manually. This function handles it:

```ts
// The rule keeps its configured options, only severity changes
setRuleSeverity(config, "@typescript-eslint/no-unused-vars", "warn")
setRuleSeverity(config, "complexity", "off")
```

### `configureRule(config, ruleName, options)`

Update a rule's options while keeping its severity:

```ts
configureRule(config, "max-lines-per-function", [{ max: 80 }])
configureRule(config, "complexity", [{ max: 15 }])
```

### `disableRule(config, ruleName)`

Remove a rule entirely:

```ts
disableRule(config, "sonarjs/no-duplicate-string")
```

### `addRule(config, ruleName, severity, options?)`

Add a rule that isn't in the config:

```ts
addRule(config, "no-console", "error")
addRule(config, "max-len", "warn", [{ code: 120 }])
```

### `disableAllRulesBut(config, ruleName)`

Focus on a single rule (useful for debugging):

```ts
disableAllRulesBut(config, "@typescript-eslint/no-floating-promises")
```

## Full Example

```ts
// eslint.config.ts
import { getConfig, setRuleSeverity, configureRule } from "@effective/eslint-cfg"

const config = await getConfig({
  strict: true,
  react: true,
  ai: true
})

// Customize for your project
setRuleSeverity(config, "no-console", "warn")
configureRule(config, "max-lines-per-function", [{ max: 80 }])

export default [
  { ignores: ["node_modules", "dist", "coverage"] },
  {
    settings: {
      react: { version: "19.0" }
    }
  },
  ...config
]
```

## License

[Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)

## Copyright

<img src="https://cdn.rawgit.com/sebastian-software/sebastian-software-brand/0d4ec9d6/sebastiansoftware-en.svg" alt="Sebastian Software GmbH" width="460" height="160"/>

Copyright 2024-2025 [Sebastian Software GmbH](https://www.sebastian-software.de)

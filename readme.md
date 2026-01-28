# ESLint Config Builder

[![Sponsored by][sponsor-img]][sponsor] [![License][github-license-img]][github] [![Version][npm-version-img]][npm] [![Build][github-action-img]][github-actions] [![Downloads][npm-downloads-img]][npm]

[sponsor]: https://www.sebastian-software.de
[sponsor-img]: https://badgen.net/badge/Sponsored%20by/Sebastian%20Software/c41e54
[npm]: https://www.npmjs.com/package/@effective/eslint-cfg
[npm-downloads-img]: https://badgen.net/npm/dm/@effective/eslint-cfg
[npm-version-img]: https://badgen.net/npm/v/@effective/eslint-cfg
[github]: https://github.com/sebastian-software/effective-eslint-cfg
[github-actions]: https://github.com/sebastian-software/effective-eslint-cfg/actions/
[github-license-img]: https://badgen.net/github/license/sebastian-software/effective-eslint-cfg
[github-action-img]: https://github.com/sebastian-software/effective-eslint-cfg/actions/workflows/node.js.yml/badge.svg

A TypeScript-based library for generating ESLint configurations in the Flat Config format, targeting TypeScript projects with optional NodeJS and React support.

## Features

- Generates ESLint Flat Configs for ESLint v9.
- Requires TypeScript and optionally supports React and NodeJS
- Automatically drops rules handled by Prettier.
- Uses Biome data to optionally disable rules supported by Biome.

## Config options

- `strict`: Enables strict linting rules (TypeScript mostly)
- `style`: Adds additional rules for style guidelines and import sorting/grouping.
- `fast`: Drop rules which require typing information (much faster)
- `biome`: Drop rules which are implemented identically in Biome (for performance reasons)
- `disabled`: Only return disabled rules. Helpful to add to the end when using custom rules.
- `react`: Add all recommended ReactJS/Hooks/Storybook checks
- `node`: Add all recommended NodeJS checks
- `ai`: Enable strict maintainability rules for AI-generated code

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

Note: Using TS configuration files work perfectly fine since ESLint v9 but requires installing `jiti`.

## AI Mode

The `ai: true` option enables strict maintainability rules specifically designed for AI-generated code. It uses `eslint-plugin-sonarjs` and additional complexity rules to ensure code remains clean, readable, and maintainable.

### Rules Overview

| Category | Rule | Setting |
|----------|------|---------|
| Complexity | `complexity` | max: 10 |
| Complexity | `max-depth` | max: 3 |
| Complexity | `max-nested-callbacks` | max: 2 |
| Complexity | `max-params` | max: 4 |
| Size | `max-lines` | max: 300 |
| Size | `max-lines-per-function` | max: 50 |
| Size | `max-statements` | max: 15 |
| Size | `max-statements-per-line` | max: 1 |
| SonarJS | `sonarjs/cognitive-complexity` | max: 10 |
| SonarJS | `sonarjs/no-duplicate-string` | threshold: 3 |
| SonarJS | `sonarjs/no-identical-functions` | error |
| SonarJS | `sonarjs/no-collapsible-if` | error |
| SonarJS | `sonarjs/no-collection-size-mischeck` | error |
| SonarJS | `sonarjs/no-redundant-boolean` | error |
| SonarJS | `sonarjs/no-unused-collection` | error |
| SonarJS | `sonarjs/prefer-immediate-return` | error |
| SonarJS | `sonarjs/prefer-single-boolean-return` | error |
| Style | `no-nested-ternary` | error |
| Style | `no-unneeded-ternary` | error |
| Style | `prefer-template` | error |
| Style | `object-shorthand` | always |
| Style | `prefer-arrow-callback` | error |
| Style | `no-param-reassign` | error |

### Example

```ts
import { getConfig } from "@effective/eslint-cfg"

const config = getConfig({
  ai: true,
  strict: true,
  style: true
})
```

## API

The package exports the following functions:

### `getConfig(options)`

Loads an ESLint configuration based on the provided options.

- `options` - The configuration options
- Returns: Promise resolving to the loaded ESLint configuration

```ts
import { getConfig } from "@effective/eslint-cfg"

const options = {
  react: true,
  strict: true,
  style: true
}

const config = await getConfig(options)
console.log(config.rules) // Access the ESLint rules
```

### `setRuleSeverity(config, ruleName, severity)`

Changes the severity of a specific ESLint rule in the configuration.

- `config` - The ESLint configuration
- `ruleName` - The name of the rule to modify
- `severity` - The new severity level ("error" | "warn" | "off")
- Throws: When the config has no rules or the rule is not configured

```ts
import { getConfig, setRuleSeverity } from "@effective/eslint-cfg"

const config = await getConfig(options)
// Change 'no-console' rule to warning
setRuleSeverity(config, "no-console", "warn")
```

### `configureRule(config, ruleName, options)`

Configures a specific ESLint rule in the configuration with its severity and optional parameters. Unlike setRuleSeverity, this method preserves the existing severity level while allowing to update the rule's options.

- `config` - The ESLint configuration
- `ruleName` - The name of the rule to configure
- `options` - Optional array of configuration options for the rule
- Throws: When the config has no rules or the rule is not configured

```ts
import { getConfig, configureRule } from "@effective/eslint-cfg"

const config = await getConfig(options)
// Configure 'max-len' rule with options while preserving severity
configureRule(config, "max-len", [{ code: 100, tabWidth: 2 }])
```

### `disableRule(config, ruleName)`

Disables a specific ESLint rule in the configuration by removing it.

- `config` - The ESLint configuration
- `ruleName` - The name of the rule to disable
- Throws: When the config has no rules or the rule is not configured

```ts
import { getConfig, disableRule } from "@effective/eslint-cfg"

const config = await getConfig(options)
// Completely remove the 'no-console' rule
disableRule(config, "no-console")
```

### `addRule(config, ruleName, severity, options)`

Adds a new ESLint rule to the configuration with specified severity and options.

- `config` - The ESLint configuration
- `ruleName` - The name of the rule to add
- `severity` - The severity level for the rule ("warn" | "error")
- `options` - Additional options for the rule configuration
- Throws: When the config has no rules or the rule is already configured

```ts
import { getConfig, addRule } from "@effective/eslint-cfg"

const config = await getConfig(options)
// Add new rule with options
addRule(config, "max-len", "error", [{ code: 100 }])
```

### `disableAllRulesBut(config, ruleName)`

Disables all rules except the one specified. Useful for focusing on a single rule for debugging.

- `config` - The ESLint configuration
- `ruleName` - The name of the rule to add
- Throws: When the config has no rules or the rule is already configured

### Complete Example

```ts
import {
  getConfig,
  setRuleSeverity,
  disableRule,
  addRule
} from "@effective/eslint-cfg"

async function customizeEslintConfig() {
  // Load the base configuration
  const config = await getConfig({
    react: true,
    strict: true,
    style: true
  })

  // Customize rule severities
  setRuleSeverity(config, "no-console", "warn")
  setRuleSeverity(config, "no-unused-vars", "error")

  // Disable rules you don't want
  disableRule(config, "complexity")

  // Add new rule with options
  addRule(config, "max-len", "error", [{ code: 100 }])

  return config
}
```

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

import eslint from "@eslint/js"
import tseslint, { ConfigWithExtends } from "typescript-eslint"
import { ESLint, Linter } from "eslint"
import eslintConfigPrettier from "eslint-config-prettier"
import eslintReact from "eslint-plugin-react"
import eslintReactHooks from "eslint-plugin-react-hooks"
import eslintReactCompiler from "eslint-plugin-react-compiler"
import eslintJsdoc from "eslint-plugin-jsdoc"
import eslintRegexp from "eslint-plugin-regexp"
import eslintJsxA11y from "eslint-plugin-jsx-a11y"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import nodePlugin from "eslint-plugin-n"
import { format } from "prettier"

interface RuleOptions {
  /** enable NodeJS checks */
  node?: boolean

  /* enable React related rules */
  react?: boolean

  /* enable strict checks - recommended */
  strict?: boolean

  /* opinionated, best practice, preferring simpler code bases */
  style?: boolean

  /** disable type-based rules for fast execution */
  fast?: boolean

  /** return only disabled rules e.g. by prettier/typescript */
  disabled?: boolean
}

export type FlatConfig = ReturnType<typeof tseslint.config>
export type ExtendsList = Parameters<typeof tseslint.config>
export type ConfigParam = ESLint.Options["overrideConfig"]

const reactFlat = eslintReact.configs.flat

export async function buildConfig(options: RuleOptions): Promise<string> {
  const { fast, node, react, strict, style, disabled } = options

  const presets: ExtendsList = [eslint.configs.recommended]

  presets.push(
    strict
      ? // Contains all of recommended, recommended-type-checked, and strict,
        // along with additional strict rules that require type information.
        tseslint.configs.strictTypeChecked
      : // Contains all of recommended along with additional recommended rules
        // that require type information. Rules newly added in this configuration
        // are similarly useful to those in recommended.
        tseslint.configs.recommendedTypeChecked
  )

  if (style) {
    // Rules considered to be best practice for modern TypeScript codebases,
    // but that do not impact program logic. These rules are generally opinionated
    // about enforcing simpler code patterns.
    presets.push(tseslint.configs.stylisticTypeChecked)

    // Conventional sorting of imports, far leaner and more to the point than "eslint-plugin-import/order"
    presets.push({
      plugins: {
        "simple-import-sort": simpleImportSort
      },
      rules: {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error"
      }
    })
  }

  if (react && reactFlat) {
    // Note: The cast is required, because of some TS voodoo with the recommended config from React
    presets.push(reactFlat.recommended as ConfigWithExtends)

    presets.push({
      plugins: {
        "react-hooks": eslintReactHooks,
        "react-compiler": eslintReactCompiler
      },
      rules: {
        ...reactFlat["jsx-runtime"].rules,
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",
        "react-compiler/react-compiler": "error"
      }
    })
  }

  // Always enable basic a11y checks... not responsible when not doing so.
  if (react) {
    presets.push(eslintJsxA11y.flatConfigs.recommended)
  }

  // We like JSDoc but for nothing which can be done better with TypeScript
  presets.push(eslintJsdoc.configs["flat/recommended-typescript-error"])

  presets.push({
    rules: {
      // We are TypeScript oriented. We all like JSDoc for some methods but
      // requiring it is a bit strong for most code bases. We still want
      // to verify JSDoc to be correct when existing.
      "jsdoc/require-jsdoc": "off",
      "jsdoc/require-param": "off",
      "jsdoc/require-property": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-yields": "off"
    }
  })

  // Check some validity related to usage and definition of regular expressions
  presets.push(eslintRegexp.configs["flat/recommended"])

  // Check NodeJS things (ESM mode)
  if (node) {
    presets.push(nodePlugin.configs["flat/recommended-module"])
  }

  // Disable all type checked rules for faster runtime of the config e.g. for editor usage etc.
  if (fast) {
    presets.push(tseslint.configs.disableTypeChecked)
  }

  // Configure TS parser
  presets.push({
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: {
          jsx: react
        },
        // Note from docs:
        // We now recommend using projectService instead of project for easier configuration and faster linting.
        projectService: !fast
      }
    }
  })

  // Always disable rules which are better enforced by Prettier
  presets.push(eslintConfigPrettier)

  const config = tseslint.config(presets)

  const linter = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config as ConfigParam
  })

  const generatedConfig = (await linter.calculateConfigForFile(
    "test.tsx"
  )) as Linter.Config
  cleanupRules(generatedConfig, disabled ?? false)

  function replacer(key: string, value: unknown) {
    if (key === "plugins" && Array.isArray(value)) {
      return cleanupPlugins(value as string[])
    }

    if (key === "parser" && typeof value === "string") {
      return `[[[@typescript-eslint/parser]]]`
    }

    return value
  }

  const exportedConfig = JSON.stringify(generatedConfig, replacer, 2)
  const moduleConfig = replacePlaceholdersWithRequires(exportedConfig)

  return format(
    `
    import { createRequire } from "module";
    const require = createRequire(import.meta.url);
    export default ${moduleConfig};
  `,
    { parser: "typescript" }
  )
}

export function ruleSorter(a: string, b: string) {
  if (a.includes("/") && !b.includes("/")) {
    return 1
  }

  if (!a.includes("/") && b.includes("/")) {
    return -1
  }

  return a.localeCompare(b)
}

function cleanupRules(generatedConfig: Linter.Config, disabled: boolean) {
  const rules = generatedConfig.rules
  if (!rules) {
    return generatedConfig
  }

  const ruleNames = Object.keys(rules).sort(ruleSorter)

  const cleanRules: typeof rules = {}
  for (const ruleName of ruleNames) {
    const value = rules[ruleName]
    if (value != null && Array.isArray(value)) {
      const level = value[0]
      if (level === 0) {
        if (disabled) {
          cleanRules[ruleName] = "off"
        }

        // else: pass, ignore
      }

      // ignore when asked for disabled rules only
      else if (!disabled) {
        const levelStr = level === 2 ? "error" : "warn"

        if (value.length === 1) {
          cleanRules[ruleName] = levelStr
        } else {
          const ruleOptions = value.slice(1) as unknown[]
          cleanRules[ruleName] = [levelStr, ...ruleOptions]
        }
      }
    }
  }

  generatedConfig.rules = cleanRules

  return generatedConfig
}

function cleanupPlugins(plugins: string[]) {
  const result: Record<string, string> = {}
  plugins.forEach((plugin) => {
    const name = plugin.split(":")[0]
    if (name === "@") {
      return
    }
    let pkg = name
    if (name.startsWith("@")) {
      pkg = name + "/eslint-plugin"
    } else {
      pkg = "eslint-plugin-" + name
    }

    result[name] = `[[[${pkg}]]]`
  })

  return result
}

/**
 * Replaces all triple-bracket placeholders in a JSON string with require statements.
 */
function replacePlaceholdersWithRequires(jsonStr: string): string {
  // Regular expression to match any string value in JSON that is enclosed in triple brackets
  const placeholderRegex = /"(\[\[\[([a-z0-9\-@/.]+)\]\]\])"/gi

  // Replace each placeholder with the corresponding require statement
  const replacedStr = jsonStr.replace(
    placeholderRegex,
    (_match, _p1, moduleName: string) => {
      // Return the require statement without quotes
      return `require("${moduleName}")`
    }
  )

  return replacedStr
}

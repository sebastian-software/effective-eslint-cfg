import eslint from "@eslint/js"
import { ESLint, Linter } from "eslint"
import eslintConfigPrettier from "eslint-config-prettier"
import eslintCheckFile from "eslint-plugin-check-file"
import eslintJsdoc from "eslint-plugin-jsdoc"
import eslintJsxA11y from "eslint-plugin-jsx-a11y"
import nodePlugin from "eslint-plugin-n"
import eslintReact from "eslint-plugin-react"
import eslintReactCompiler from "eslint-plugin-react-compiler"
import eslintReactHooks from "eslint-plugin-react-hooks"
import eslintRegexp from "eslint-plugin-regexp"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import eslintTestingLib from "eslint-plugin-testing-library"
import eslintJest from "eslint-plugin-jest"
import eslintStorybook from "eslint-plugin-storybook"
import { format } from "prettier"
import tseslint from "typescript-eslint"

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

  /** whether biome matched rules should be disabled */
  biome?: boolean

  /** return only disabled rules e.g. by prettier/typescript */
  disabled?: boolean
}

export type FlatConfig = ReturnType<typeof tseslint.config>
export type ExtendsList = Parameters<typeof tseslint.config>
export type ConfigParam = ESLint.Options["overrideConfig"]

const reactFlat = eslintReact.configs.flat

interface BiomeRule {
  category: string
  originalRule?: string
}

type BiomeRules = Record<string, BiomeRule>

interface Settings {
  biomeRules?: BiomeRules
  fileName?: string
}

function createBiomePreset(biomeRules: BiomeRules) {
  const rules: Record<string, "off"> = {}
  for (const [_ruleName, { originalRule }] of Object.entries(biomeRules)) {
    if (originalRule) {
      rules[originalRule] = "off"
    }
  }

  return {
    rules
  }
}

export async function buildConfig(
  options: RuleOptions,
  { biomeRules, fileName }: Settings = {}
): Promise<ConfigWithModuleRefs> {
  const { fast, node, react, strict, style, biome, disabled } = options

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

  if (react) {
    // Note: The cast is required, because of some TS voodoo with the recommended config from React
    presets.push(reactFlat.recommended)

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

    presets.push(eslintStorybook.configs["flat/recommended"])
  }

  // Always enable basic a11y checks... not responsible when not doing so.
  if (react) {
    presets.push(eslintJsxA11y.flatConfigs.recommended)
  }

  // We like JSDoc but for nothing which can be done better with TypeScript

  presets.push(
    // 1. rules that check names and descriptions
    eslintJsdoc.configs["flat/contents-typescript-error"],
    eslintJsdoc.configs["flat/logical-typescript-error"],
    eslintJsdoc.configs["flat/stylistic-typescript-error"]
  )

  presets.push({
    plugins: {
      "check-file": eslintCheckFile
    },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{js,ts}": "CAMEL_CASE",
          "**/*.tsx": "PASCAL_CASE"
        },
        {
          ignoreMiddleExtensions: true
        }
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "**/": "KEBAB_CASE"
        }
      ]
    }
  })

  presets.push({
    rules: {
      // In TypeScript we typically don't need to document all desctructed props
      // as complexer object are defined by their interface/type already.
      "jsdoc/check-param-names": [
        "error",
        {
          checkDestructured: false
        }
      ],

      // Disable prop-type checks. These are better validated by strict TypeScript
      // anyway and also have quite of long standing bug related to using `React.memo`:
      // https://github.com/jsx-eslint/eslint-plugin-react/issues/2760
      "react/prop-types": "off",

      // Interestingly the rule is enabled in the recommended presets but
      // differs in behavior from the standard TSC handling. They even document
      // the different... wonder why not just use the sensible default in TSC.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ],

      // The default is defined without any options leading to simplify even complex
      // array constructions which effectively makes it harder to read than the
      // wrapping nature of `Array<>`. Using the XO/Sindre preferred style instead.
      "@typescript-eslint/array-type": [
        "error",
        {
          default: "array-simple"
        }
      ]
    }
  })

  // Check some validity related to usage and definition of regular expressions
  presets.push(eslintRegexp.configs["flat/recommended"])

  // Add Jest/Vitest/TestingLibrary recommended configuration
  const testFiles = react ? "**/*.{spec,test}.{ts,tsx}" : "**/*.{spec,test}.ts"

  const jestRecommended = eslintJest.configs["flat/recommended"]
  const jestStyle = eslintJest.configs["flat/style"]
  const testingLibRules =
    eslintTestingLib.configs[react ? "flat/react" : "flat/dom"]

  presets.push({
    files: [testFiles],
    ...jestRecommended,
    ...(style ? jestStyle : {})
  })

  // Keep in a separate prest push to prevent overwriting keys from Jest.
  presets.push({
    files: [testFiles],
    ...testingLibRules
  })

  // Check NodeJS things (ESM mode)
  if (node) {
    presets.push(nodePlugin.configs["flat/recommended-module"])

    const tryExtensions = [".js", ".ts"]
    if (react) {
      tryExtensions.push(".tsx")
    }

    presets.push({
      settings: { n: { tryExtensions } }
    })
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

  if (biome) {
    if (!biomeRules) {
      throw new Error("Unexpected missing biome rules")
    }

    presets.push(createBiomePreset(biomeRules))
  }

  const config = tseslint.config(presets)

  const linter = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config as ConfigParam
  })

  const generatedConfig = (await linter.calculateConfigForFile(
    fileName ?? "index.ts"
  )) as Linter.Config

  cleanupRules(generatedConfig, disabled ?? false)

  const { parser, ...languageOptionsWithoutParser } =
    generatedConfig.languageOptions ?? {}

  const configWithModuleRefs = {
    ...generatedConfig,
    languageOptions: {
      ...generatedConfig.languageOptions,
      parser: "[[[@typescript-eslint/parser]]]"
    },
    plugins: cleanupPlugins(generatedConfig.plugins)
  }

  // This is newly generated in ESLint v9.7 and holds language information
  // which is not needed for the generated config.
  delete configWithModuleRefs.language

  return configWithModuleRefs
}

export type ConfigWithModuleRefs = Omit<
  Linter.Config<Linter.RulesRecord>,
  "plugins" | "languageOptions"
> & {
  plugins?: Record<string, string>
  languageOptions?: {
    parser?: string
  } & Omit<Linter.LanguageOptions, "parser">
}

export function configToModule(config: unknown) {
  const exportedConfig = JSON.stringify(config, null, 2)
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

function getRulePackage(ruleName: string) {
  if (ruleName.includes("/")) {
    return ruleName.split("/")[0]
  }
}

function cleanupRules(generatedConfig: Linter.Config, disabled: boolean) {
  const rules = generatedConfig.rules
  if (!rules) {
    return generatedConfig
  }

  const ruleNames = Object.keys(rules).sort(ruleSorter)
  const disabledPlugins = new Set([
    "@babel",
    "babel",
    "vue",
    "flowtype",
    "@stylistic"
  ])

  const cleanRules: typeof rules = {}
  for (const ruleName of ruleNames) {
    const rulePackage = getRulePackage(ruleName)
    if (rulePackage && disabledPlugins.has(rulePackage)) {
      continue
    }

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

/**
 * Cleans up the plugins object by replacing the actual plugin object with placeholders for the corresponding require statements.
 */
function cleanupPlugins(plugins?: Record<string, ESLint.Plugin>) {
  if (!plugins) {
    return
  }

  const result: Record<string, string> = {}
  Object.keys(plugins).forEach((plugin) => {
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

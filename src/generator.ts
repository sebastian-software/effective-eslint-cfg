import eslint from "@eslint/js";
import tseslint, { ConfigWithExtends } from "typescript-eslint";
import { ESLint, Linter } from "eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintReact from "eslint-plugin-react";
import eslintReactHooks from "eslint-plugin-react-hooks";
import eslintBiome from "eslint-config-biome";
import eslintReactCompiler from "eslint-plugin-react-compiler";
import eslintJsdoc from "eslint-plugin-jsdoc";
import eslintRegexp from "eslint-plugin-regexp";
import nodePlugin from "eslint-plugin-n";
import { createRequire } from "module";

interface RuleOptions {
  /** enable NodeJS checks */
  node?: boolean;

  /* enable React related rules */
  react?: boolean;

  /* enable strict checks - recommended */
  strict?: boolean;

  /* opinionated, best practice, preferring simpler code bases */
  style?: boolean;

  /** disable type-based rules for fast execution */
  fast?: boolean;

  /* remove all rules which are supported by Biome to make everything faster */
  biome?: boolean;
}

export type FlatConfig = ReturnType<typeof tseslint.config>;
export type ExtendsList = Parameters<typeof tseslint.config>;
export type ConfigParam = ESLint.Options["overrideConfig"];

const reactFlat = eslintReact.configs.flat;

export async function buildConfig(options: RuleOptions): Promise<string> {
  const { fast, node, react, strict, style, biome } = options;

  const extendsList: ExtendsList = [eslint.configs.recommended];

  extendsList.push(
    strict
      ? // Contains all of recommended, recommended-type-checked, and strict,
        // along with additional strict rules that require type information.
        tseslint.configs.strictTypeChecked
      : // Contains all of recommended along with additional recommended rules
        // that require type information. Rules newly added in this configuration
        // are similarly useful to those in recommended.
        tseslint.configs.recommendedTypeChecked
  );

  if (style) {
    // Rules considered to be best practice for modern TypeScript codebases,
    // but that do not impact program logic. These rules are generally opinionated
    // about enforcing simpler code patterns.
    extendsList.push(tseslint.configs.stylisticTypeChecked);
  }

  if (react && reactFlat) {
    // Note: The cast is required, because of some TS voodoo with the recommended config from React
    extendsList.push(reactFlat.recommended as ConfigWithExtends);

    extendsList.push({
      plugins: {
        "react-hooks": eslintReactHooks,
        "react-compiler": eslintReactCompiler,
      },
      rules: {
        ...reactFlat["jsx-runtime"].rules,
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",
        "react-compiler/react-compiler": "error",
      },
    });
  }

  // We like JSDoc but for nothing which can be done better with TypeScript
  extendsList.push(eslintJsdoc.configs["flat/recommended-typescript-error"]);

  // Check some validity related to usage and definition of regular expressions
  extendsList.push(eslintRegexp.configs["flat/recommended"]);

  // Check NodeJS things (ESM mode)
  if (node) {
    extendsList.push(nodePlugin.configs["flat/recommended-module"]);
  }

  // Disable all type checked rules for faster runtime of the config e.g. for editor usage etc.
  if (fast) {
    extendsList.push(tseslint.configs.disableTypeChecked);
  } else {
    extendsList.push({
      languageOptions: {
        parserOptions: {
          projectService: true,
        },
      },
    });
  }

  // Always disable rules which are better enforced by Prettier
  extendsList.push(eslintConfigPrettier);

  // When users switch to Biome (for performance) it makes sense to
  // move these rules from the plate of ESLint to focus on running
  // complex or type-based rules only.
  if (biome) {
    extendsList.push(eslintBiome);
  }

  const config = tseslint.config(extendsList);

  const linter = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config as ConfigParam,
  });

  const generatedConfig = (await linter.calculateConfigForFile(
    "test.tsx"
  )) as Linter.Config;
  cleanupRules(generatedConfig);

  function replacer(key: string, value: unknown) {
    if (key === "plugins" && Array.isArray(value)) {
      return cleanupPlugins(value);
    }

    if (key === "parser" && typeof value === "string") {
      return `[[[@typescript-eslint/parser]]]`;
    }

    return value;
  }

  const exportedConfig = JSON.stringify(generatedConfig, replacer, 2);
  const moduleConfig = replacePlaceholdersWithRequires(exportedConfig);

  return `
    import { createRequire } from "module";
    const require = createRequire(import.meta.url);
    export default ${moduleConfig};
  `;
}

export function ruleSorter(a: string, b: string) {
  if (a.includes("/") && !b.includes("/")) {
    return 1;
  }

  if (!a.includes("/") && b.includes("/")) {
    return -1;
  }

  return a.localeCompare(b);
}

function cleanupRules(generatedConfig: Linter.Config) {
  const rules = generatedConfig.rules;
  if (!rules) {
    return generatedConfig;
  }

  const ruleNames = Object.keys(rules).sort(ruleSorter);

  const cleanRules: typeof rules = {};
  for (const ruleName of ruleNames) {
    const value = rules[ruleName];
    if (value != null && Array.isArray(value)) {
      const level = value[0];
      if (level === 0) {
        // pass, ignore
      } else {
        const levelStr = level === 2 ? "error" : "warn";

        if (value.length === 1) {
          cleanRules[ruleName] = levelStr;
        } else {
          cleanRules[ruleName] = [levelStr, ...value.slice(1)];
        }
      }
    }
  }

  generatedConfig.rules = cleanRules;

  return generatedConfig;
}

const require = createRequire(import.meta.url); // create a require function in ESM

function cleanupPlugins(plugins: string[]) {
  const result: Record<string, string> = {};
  plugins.forEach((plugin) => {
    const name = plugin.split(":")[0];
    if (name === "@") {
      return;
    }
    let pkg = name;
    if (name.startsWith("@")) {
      pkg = name + "/eslint-plugin";
    } else {
      pkg = "eslint-plugin-" + name;
    }

    result[name] = `[[[${pkg}]]]`;
  });

  return result;
}

/**
 * Replaces all triple-bracket placeholders in a JSON string with require statements.
 */
function replacePlaceholdersWithRequires(jsonStr: string): string {
  // Regular expression to match any string value in JSON that is enclosed in triple brackets
  const placeholderRegex = /"(\[\[\[([a-z0-9\-@/.]+)\]\]\])"/gi;

  // Replace each placeholder with the corresponding require statement
  const replacedStr = jsonStr.replace(
    placeholderRegex,
    (_match, _p1, moduleName) => {
      // Return the require statement without quotes
      return `require("${moduleName}")`;
    }
  );

  return replacedStr;
}

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { ESLint, Linter } from "eslint";
import eslintConfigPrettier from "eslint-config-prettier";

interface RuleOptions {
  root: string;

  react?: boolean;
  strict?: boolean;
  style?: boolean;
  biome?: boolean;
}

export type FlatConfig = ReturnType<typeof tseslint.config>;
export type ExtendsList = Parameters<typeof tseslint.config>[0];
export type ConfigParam = ESLint.Options["overrideConfig"];

export async function createConfig(options: RuleOptions): Promise<FlatConfig> {
  const { root, react, strict, style, biome } = options;

  const rulesList: Linter.RulesRecord = {};

  const extendsList: ExtendsList = [eslint.configs.recommended];

  extendsList.push(
    strict
      ? tseslint.configs.strictTypeChecked
      : tseslint.configs.recommendedTypeChecked
  );

  if (style) {
    extendsList.push(tseslint.configs.stylisticTypeChecked);
  }

  extendsList.push({
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: root,
      },
    },
  });

  extendsList.push(eslintConfigPrettier);

  const config = tseslint.config({
    ignores: ["node_modules/**", "dist/**"],
    files: ["**/*.ts", "**/*.tsx"],
    extends: extendsList,
    rules: rulesList,
  });

  const linter = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config as ConfigParam,
  });

  const generatedConfig = await linter.calculateConfigForFile("test.tsx");
  cleanupRules(generatedConfig);

  return generatedConfig;
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

function cleanupRules(generatedConfig: FlatConfig[number]) {
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

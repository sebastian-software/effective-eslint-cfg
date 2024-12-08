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

function cleanupRules(generatedConfig: FlatConfig[number]) {
  const rules = generatedConfig.rules;
  for (const rule in rules) {
    const value = rules[rule];
    if (value != null && Array.isArray(value)) {
      const level = value[0];
      if (level === 0) {
        delete rules[rule];
      } else if (value.length === 1) {
        rules[rule] = level === 2 ? "error" : "warn";
      }
    }
  }
  return generatedConfig;
}

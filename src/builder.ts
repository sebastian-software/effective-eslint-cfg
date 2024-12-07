import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { Linter } from "eslint";
import eslintConfigPrettier from "eslint-config-prettier";

interface RuleOptions {
  root: string;

  react: boolean;
  strict: boolean;
  style: boolean;
  biome: boolean;
}

export function buildRules(options: RuleOptions) {
  const { root, react, strict, style, biome } = options;

  const rulesList: Linter.RulesRecord = {
    "no-unused-vars": ["error"],
    "prettier/prettier": ["error"],
  };

  type ExtendsList = Parameters<typeof tseslint.config>[0];
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

  // Disable type-aware linting for pure JS files
  extendsList.push({
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  });

  extendsList.push(eslintConfigPrettier);

  return tseslint.config({
    ignores: ["node_modules/**", "dist/**"],
    files: ["**/*.ts", "**/*.tsx"],
    extends: extendsList,
    rules: rulesList,
  });
}

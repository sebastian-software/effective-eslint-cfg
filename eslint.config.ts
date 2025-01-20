import type { Linter } from "eslint"

import { getConfig } from "./src/index"

const base = await getConfig({
  node: true,
  strict: true,
  style: true
})

export default [
  { ignores: ["node_modules", "dist"] },
  {
    settings: {
      react: {
        version: "19.0"
      }
    }
  },
  { files: ["**/*.ts", "**/*.tsx"] },
  base,
  {
    rules: {
      "jsdoc/require-jsdoc": "off",
      "jsdoc/require-param": "off",
      "jsdoc/require-property": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-yields": "off",

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
      ]
    }
  }
] satisfies Linter.Config[]

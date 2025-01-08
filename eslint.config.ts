import type { Linter } from "eslint"
import { getConfig } from "./src"

const base = await getConfig({
  react: true,
  strict: true
})

export default [
  { ignores: ["node_modules", "dist"] },
  { files: ["**/*.ts", "**/*.tsx"] },
  base,
  {
    rules: {
      "jsdoc/require-jsdoc": "off",
      "jsdoc/require-param": "off",
      "jsdoc/require-property": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-yields": "off"
    }
  }
] satisfies Linter.Config[]

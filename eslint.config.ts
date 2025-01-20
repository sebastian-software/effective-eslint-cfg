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
  base
] satisfies Linter.Config[]

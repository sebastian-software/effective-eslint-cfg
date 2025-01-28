import type { Linter } from "eslint"

import { getConfig } from "./src/index"

const base = await getConfig({
  node: true,
  strict: true,
  style: true,
  testing: true
})

export default [
  { ignores: ["node_modules", "dist"] },

  {
    settings: {
      jest: {
        globalPackage: "vitest"
      }
    }
  },

  base
] satisfies Linter.Config[]

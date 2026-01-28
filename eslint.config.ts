import type { Linter } from "eslint"

import { getConfig } from "./src/index"

const base = await getConfig({
  node: true,
  strict: true,
  style: true
})

const config: Linter.Config[] = [
  { ignores: ["node_modules", "dist"] },

  {
    settings: {
      jest: {
        globalPackage: "vitest"
      }
    }
  },

  ...base
]

export default config

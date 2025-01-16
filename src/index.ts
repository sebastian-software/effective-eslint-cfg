import { Linter } from "eslint"
import { resolve } from "path"

import { numberToShortHash,Options, optionsToNumber } from "./util.js"

export async function getConfig(options: Options) {
  const num = optionsToNumber(options)
  const hash = numberToShortHash(num)

  const __dirname = import.meta.dirname

  // Make sure that we are in "dist" folder and not in "src".
  const configPath = resolve(__dirname, "..", "dist", "configs", `${hash}.js`)

  const module = (await import(configPath)) as { default: Linter.Config }
  return module.default
}

import { createHash } from "crypto"
import { Linter } from "eslint"

export interface Options {
  // mode options
  strict?: boolean
  style?: boolean

  // additional rules options
  node?: boolean
  react?: boolean

  // output options
  disabled?: boolean
  fast?: boolean
  biome?: boolean
}

export const flags = [
  // mode options
  "strict",
  "style",

  // additional rules options
  "node",
  "react",

  // output options
  "disabled",
  "fast",
  "biome"
] as const

export function optionsToNumber(opts: Options): number {
  let num = 0
  for (let i = 0; i < flags.length; i++) {
    if (opts[flags[i]]) {
      num |= 1 << i
    }
  }
  return num
}

export function numberToShortHash(num: number): string {
  return createHash("sha1").update(String(num)).digest("hex").slice(0, 8)
}

export function getConfigObject(
  config: Linter.Config[],
  objectName: string = "base"
) {
  const obj = config.find((c) => c.name === `effective/${objectName}`)
  if (!obj) {
    throw new Error(`Config ${objectName} not found!`)
  }

  return obj
}

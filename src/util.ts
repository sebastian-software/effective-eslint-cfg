import { createHash } from "crypto"

export interface Options {
  // mode options
  strict?: boolean
  style?: boolean

  // additional rules options
  node?: boolean
  react?: boolean
  testing?: boolean

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
  "testing",

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

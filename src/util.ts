import { createHash } from "crypto"

export interface Options {
  node?: boolean
  react?: boolean
  strict?: boolean
  style?: boolean
  fast?: boolean
}

export const flags = ["node", "react", "strict", "style", "fast"] as const

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

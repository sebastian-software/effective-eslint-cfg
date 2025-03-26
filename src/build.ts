import { promises as fs } from "fs"
import { join } from "path"

import { getBiomeRules } from "./biome.js"
import { buildConfig, configToModule } from "./generator.js"
import { flags, numberToShortHash, Options } from "./util.js"

async function main() {
  const outputDir = join(process.cwd(), "dist", "configs")
  await fs.mkdir(outputDir, { recursive: true })

  const biomeRules = await getBiomeRules()
  const numPermutations = 1 << flags.length

  for (let i = 0; i < numPermutations; i++) {
    const opts: Options = {}
    for (let bit = 0; bit < flags.length; bit++) {
      opts[flags[bit]] = (i & (1 << bit)) !== 0
    }

    const config = await buildConfig(opts, { biomeRules })
    const code = await configToModule(config)
    const hash = numberToShortHash(i)
    const filePath = join(outputDir, `${hash}.js`)

    await fs.writeFile(filePath, code, "utf8")
  }

  console.log(`Generated ${numPermutations.toString()} configs in ${outputDir}`)
}

void main()

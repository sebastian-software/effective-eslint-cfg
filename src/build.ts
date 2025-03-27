import { promises as fs } from "fs"
import { join } from "path"

import { getBiomeRules } from "./biome.js"
import { buildConfig, configToModule } from "./generator.js"
import { flags, numberToShortHash, Options } from "./util.js"
import { diffLintConfig } from "./diff.js"

const fileNameRelevantOptions = ["react", "testing", "storybook"] as const

export interface FileNameOptions {
  react?: boolean
  testing?: boolean
  storybook?: boolean
}

export function getFileName({
  react,
  testing,
  storybook
}: FileNameOptions = {}) {
  let fileName = "index"
  if (testing) {
    fileName += ".test"
  } else if (storybook) {
    fileName += ".stories"
  }

  fileName += react ? ".tsx" : ".ts"

  return fileName
}

const fileGlob = {
  react: "**/*.{ts,tsx}",
  testing: "**/*.{spec,test}.{ts,tsx}",
  storybook: "**/*.stories.tsx"
}

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

    const enabledOpts = new Set(flags.filter((flag) => opts[flag]))
    const hasReact = enabledOpts.has("react")
    console.log("OPTS:", opts, "=>", enabledOpts)

    const baseConfig = await buildConfig(opts, {
      biomeRules,
      fileName: getFileName({ react: hasReact })
    })
    const configForTests = await buildConfig(opts, {
      biomeRules,
      fileName: getFileName({ testing: true, react: hasReact })
    })
    const configForStorybook = await buildConfig(opts, {
      biomeRules,
      fileName: getFileName({ storybook: true, react: hasReact })
    })

    const diffTests = diffLintConfig(baseConfig, configForTests)
    if (diffTests) {
      diffTests.files = [fileGlob.testing]
      console.log("DIFF-TESTS:", diffTests)
    }
    const diffStorybook = diffLintConfig(baseConfig, configForStorybook)
    if (diffStorybook) {
      diffStorybook.files = [fileGlob.storybook]
      console.log("DIFF-STORYBOOK:", diffStorybook)
    }

    const config = [baseConfig, diffTests, diffStorybook].filter(
      (value) => value != null
    )

    const code = await configToModule(config)
    const hash = numberToShortHash(i)
    const filePath = join(outputDir, `${hash}.js`)

    await fs.writeFile(filePath, code, "utf8")
  }

  console.log(`Generated ${numPermutations.toString()} configs in ${outputDir}`)
}

void main()

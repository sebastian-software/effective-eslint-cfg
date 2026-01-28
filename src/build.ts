import { promises as fs } from "fs"
import { join } from "path"

import { buildConfig, configToModule } from "./generator.js"
import { flags, numberToShortHash, Options } from "./util.js"
import { diffLintConfig } from "./diff.js"

const fileNameRelevantOptions = ["react", "testing", "storybook"] as const

export interface FileNameOptions {
  react?: boolean
  test?: boolean
  e2e?: boolean
  storybook?: boolean
}

export function getFileName({
  react,
  test,
  e2e,
  storybook
}: FileNameOptions = {}) {
  let fileName = "dateUtils"
  if (test) {
    fileName = "dateUtils.test"
  } else if (e2e) {
    fileName = "AdminPanel.spec"
  } else if (storybook) {
    fileName = "Button.stories"
  }

  fileName += react && !e2e && !test ? ".tsx" : ".ts"

  console.log(fileName)
  return fileName
}

const fileGlob = {
  react: "**/*.{ts,tsx}",
  test: "**/*.test.{ts,tsx}",
  e2e: "**/*.spec.ts",
  storybook: "**/*.stories.{ts,tsx}"
}

async function main() {
  const outputDir = join(process.cwd(), "dist", "configs")
  await fs.mkdir(outputDir, { recursive: true })

  const numPermutations = 1 << flags.length

  for (let i = 0; i < numPermutations; i++) {
    const opts: Options = {}
    for (let bit = 0; bit < flags.length; bit++) {
      opts[flags[bit]] = (i & (1 << bit)) !== 0
    }

    const enabledOpts = new Set(flags.filter((flag) => opts[flag]))
    const hasReact = enabledOpts.has("react")

    const baseConfig = await buildConfig(opts, {
      fileName: getFileName({ react: hasReact })
    })
    baseConfig.name = "effective/base"

    const configForTest = await buildConfig(opts, {
      fileName: getFileName({ test: true, react: hasReact })
    })
    const diffTest = diffLintConfig(baseConfig, configForTest)
    if (diffTest) {
      diffTest.files = [fileGlob.test]
      diffTest.name = "effective/test"
    }

    const configForE2E = await buildConfig(opts, {
      fileName: getFileName({ e2e: true, react: hasReact })
    })
    const diffE2E = diffLintConfig(baseConfig, configForE2E)
    if (diffE2E) {
      diffE2E.files = [fileGlob.e2e]
      diffE2E.name = "effective/e2e"
    }

    const configForStorybook = await buildConfig(opts, {
      fileName: getFileName({ storybook: true, react: hasReact })
    })
    const diffStorybook = diffLintConfig(baseConfig, configForStorybook)
    if (diffStorybook) {
      diffStorybook.files = [fileGlob.storybook]
      diffStorybook.name = "effective/storybook"
    }

    const config = [baseConfig, diffTest, diffE2E, diffStorybook].filter(
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

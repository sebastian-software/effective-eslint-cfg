import { describe, expect, it } from "vitest"

import { getBiomeRules } from "./biome"
import { buildConfig } from "./generator"

describe("createConfig", () => {
  it("generates a base configuration", async () => {
    const config = await buildConfig({})
    expect(config).toMatchSnapshot()
  })

  //
  // ENABLING...
  //

  it("includes NodeJS specific rules", async () => {
    const config = await buildConfig({ node: true })
    expect(config).toMatchSnapshot()
  })

  it("includes React specific rules", async () => {
    const config = await buildConfig({ react: true })
    expect(config).toMatchSnapshot()
  })

  it("includes Test specific rules", async () => {
    const config = await buildConfig(
      { strict: true, style: true },
      { fileName: "dateUtils.test.ts" }
    )
    expect(config).toMatchSnapshot()
  })

  it("includes Storybook specific rules", async () => {
    const config = await buildConfig(
      { react: true, strict: true, style: true },
      { fileName: "Button.stories.tsx" }
    )
    expect(config).toMatchSnapshot()
  })

  it("includes Playwright specific rules", async () => {
    const config = await buildConfig(
      { strict: true, style: true },
      { fileName: "AdminPanel.spec.ts" }
    )
    expect(config).toMatchSnapshot()
  })

  //
  // GLOBAL SETTINGS...
  //

  it("enables strict rules", async () => {
    const config = await buildConfig({ strict: true })
    expect(config).toMatchSnapshot()
  })

  it("applies stylistic rules", async () => {
    const config = await buildConfig({ style: true })
    expect(config).toMatchSnapshot()
  })

  it("disable biome supported rules", async () => {
    const biomeRules = await getBiomeRules()
    const config = await buildConfig({ biome: true }, { biomeRules })
    expect(config).toMatchSnapshot()
  })

  it("disable biome supported and type requiring rules", async () => {
    const biomeRules = await getBiomeRules()
    const config = await buildConfig(
      { biome: true, fast: true },
      { biomeRules }
    )
    expect(config).toMatchSnapshot()
  })

  it("disable type requiring rules", async () => {
    const config = await buildConfig({ fast: true })
    expect(config).toMatchSnapshot()
  })

  it("only return disabled rules", async () => {
    const config = await buildConfig({ disabled: true })
    expect(config).toMatchSnapshot()
  })

  it("only return disabled (with biome) rules", async () => {
    const biomeRules = await getBiomeRules()
    const config = await buildConfig(
      { disabled: true, biome: true },
      { biomeRules }
    )
    expect(config).toMatchSnapshot()
  })

  //
  // COMBINE...
  //

  it("combines all options", async () => {
    const config = await buildConfig({
      node: true,
      react: true,
      strict: true,
      style: true
    })
    expect(config).toMatchSnapshot()
  })

  it("combines all options without biome support rules", async () => {
    const biomeRules = await getBiomeRules()
    const config = await buildConfig(
      {
        node: true,
        react: true,
        strict: true,
        style: true,
        biome: true
      },
      { biomeRules }
    )
    expect(config).toMatchSnapshot()
  })
})

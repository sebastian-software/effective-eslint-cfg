import { describe, expect, it } from "vitest";
import { createConfig } from "./index";

const cwd = process.cwd();

describe("createConfig", () => {
  it("generates a base configuration", async () => {
    const config = await createConfig({ root: cwd });
    expect(config).toMatchSnapshot();
  });

  //
  // ENABLING...
  //

  it("includes Node-specific rules", async () => {
    const config = await createConfig({ root: cwd, node: true });
    expect(config).toMatchSnapshot();
  });

  it("includes React-specific rules", async () => {
    const config = await createConfig({ root: cwd, react: true });
    expect(config).toMatchSnapshot();
  });

  //
  // GLOBAL SETTINGS...
  //

  it("enables strict rules", async () => {
    const config = await createConfig({ root: cwd, strict: true });
    expect(config).toMatchSnapshot();
  });

  it("applies stylistic rules", async () => {
    const config = await createConfig({ root: cwd, style: true });
    expect(config).toMatchSnapshot();
  });

  it("disable type-based rules", async () => {
    const config = await createConfig({ root: cwd, fast: true });
    expect(config).toMatchSnapshot();
  });

  //
  // DISABLING...
  //

  it("excludes rules covered by Biome", async () => {
    const config = await createConfig({ root: cwd, biome: true });
    expect(config).toMatchSnapshot();
  });

  it("combines all options", async () => {
    const config = await createConfig({
      root: cwd,
      node: true,
      react: true,
      strict: true,
      style: true,
    });
    expect(config).toMatchSnapshot();
  });
});

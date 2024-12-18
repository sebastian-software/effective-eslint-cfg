import { describe, expect, it } from "vitest";
import { buildConfig } from "./generator";

const cwd = process.cwd();

describe("createConfig", () => {
  it("generates a base configuration", async () => {
    const config = await buildConfig({});
    expect(config).toMatchSnapshot();
  });

  //
  // ENABLING...
  //

  it("includes Node-specific rules", async () => {
    const config = await buildConfig({ node: true });
    expect(config).toMatchSnapshot();
  });

  it("includes React-specific rules", async () => {
    const config = await buildConfig({ react: true });
    expect(config).toMatchSnapshot();
  });

  //
  // GLOBAL SETTINGS...
  //

  it("enables strict rules", async () => {
    const config = await buildConfig({ strict: true });
    expect(config).toMatchSnapshot();
  });

  it("applies stylistic rules", async () => {
    const config = await buildConfig({ style: true });
    expect(config).toMatchSnapshot();
  });

  it("disable type-based rules", async () => {
    const config = await buildConfig({ fast: true });
    expect(config).toMatchSnapshot();
  });

  //
  // DISABLING...
  //

  it("excludes rules covered by Biome", async () => {
    const config = await buildConfig({ biome: true });
    expect(config).toMatchSnapshot();
  });

  it("combines all options", async () => {
    const config = await buildConfig({
      node: true,
      react: true,
      strict: true,
      style: true,
    });
    expect(config).toMatchSnapshot();
  });
});

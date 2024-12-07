import { describe, expect, it } from "vitest";
import { createConfig } from "./index";

const cwd = process.cwd();

describe("createConfig", () => {
  it("generates a base configuration", async () => {
    const config = await createConfig({ root: cwd });
    expect(config).toMatchSnapshot();
  });

  it("includes React-specific rules", async () => {
    const config = await createConfig({ root: cwd, react: true });
    expect(config).toMatchSnapshot();
  });

  it("enables strict rules", async () => {
    const config = await createConfig({ root: cwd, strict: true });
    expect(config).toMatchSnapshot();
  });

  it("applies style rules", async () => {
    const config = await createConfig({ root: cwd, style: true });
    expect(config).toMatchSnapshot();
  });

  it("excludes rules covered by Biome", async () => {
    const config = await createConfig({ root: cwd, biome: true });
    expect(config).toMatchSnapshot();
  });

  it("combines all options", async () => {
    const config = await createConfig({
      root: cwd,
      react: true,
      strict: true,
      style: true,
      biome: true,
    });
    expect(config).toMatchSnapshot();
  });
});

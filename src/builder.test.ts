import { describe, expect, it } from "vitest";
import { createConfig } from "./builder";

const cwd = process.cwd();

describe("createConfig", () => {
  it("generates a base configuration", () => {
    const config = createConfig({ root: cwd });
    expect(config).toMatchSnapshot();
  });

  it("includes React-specific rules", () => {
    const config = createConfig({ root: cwd, react: true });
    expect(config).toMatchSnapshot();
  });

  it("enables strict rules", () => {
    const config = createConfig({ root: cwd, strict: true });
    expect(config).toMatchSnapshot();
  });

  it("applies style rules", () => {
    const config = createConfig({ root: cwd, style: true });
    expect(config).toMatchSnapshot();
  });

  it("excludes rules covered by Biome", () => {
    const config = createConfig({ root: cwd, biome: true });
    expect(config).toMatchSnapshot();
  });

  it("combines all options", () => {
    const config = createConfig({
      root: cwd,
      react: true,
      strict: true,
      style: true,
      biome: true,
    });
    expect(config).toMatchSnapshot();
  });
});

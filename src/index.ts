import { createConfig } from "./builder";

interface ConfigOptions {
  react?: boolean;
  strict?: boolean;
  style?: boolean;
  biome?: boolean;
}

export function createConfig(options: ConfigOptions) {
  const {
    react = false,
    strict = false,
    style = false,
    biome = false,
  } = options;

  return createConfig({ react, strict, style, biome }),
}

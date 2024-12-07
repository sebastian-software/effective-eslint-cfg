import { buildRules } from "./builder";

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

  return buildRules({ react, strict, style, biome }),
}

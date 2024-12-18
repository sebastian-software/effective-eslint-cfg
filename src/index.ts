import { join } from "path";
import { createHash } from "crypto";
import { createRequire } from "module";
import { cwd } from "process";

const require = createRequire(import.meta.url); // create a require function in ESM

// The runtime getConfig function remains synchronous if we rely on a simple `require`.
// If you need promise-based or ESM dynamic imports, let me know.
// For now, we assume CommonJS require is allowed for synchronous loading.
type Options = {
  node?: boolean;
  react?: boolean;
  strict?: boolean;
  style?: boolean;
  fast?: boolean;
  biome?: boolean;
};

const flags = ["node", "react", "strict", "style", "fast", "biome"] as const;

function optionsToKey(opts: Options) {
  return flags.map((f) => `${f}=${opts[f] ? 1 : 0}`).join(",");
}

function keyToHash(key: string) {
  return createHash("md5").update(key).digest("hex");
}

export function getConfig(options: Options) {
  const key = optionsToKey(options);
  const hash = keyToHash(key);
  const configPath = join(cwd(), "dist", "configs", `${hash}.json`);

  const config = require(configPath);
  return config;
}

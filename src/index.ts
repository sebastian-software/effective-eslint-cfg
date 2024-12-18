import { join } from "path";
import { createRequire } from "module";
import { Options, optionsToNumber, numberToShortHash } from "./util.js";

const require = createRequire(import.meta.url); // create a require function in ESM

export function getConfig(options: Options) {
  const num = optionsToNumber(options);
  const hash = numberToShortHash(num);
  const configPath = join(process.cwd(), "dist", "configs", `${hash}.json`);

  const config = require(configPath);
  return config;
}

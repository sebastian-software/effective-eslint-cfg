import { join } from "path";
import { Options, optionsToNumber, numberToShortHash } from "./util.js";
import { Linter } from "eslint";

export async function getConfig(options: Options) {
  const num = optionsToNumber(options);
  const hash = numberToShortHash(num);
  const configPath = join(process.cwd(), "dist", "configs", `${hash}.js`);

  const module = await import(configPath);
  return module.default as Linter.Config;
}

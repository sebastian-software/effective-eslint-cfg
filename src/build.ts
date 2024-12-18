import { buildConfig } from "./generator";
import { promises as fs } from "fs";
import { join } from "path";
import { createHash } from "crypto";

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

const cwd = process.cwd();

async function main() {
  const outputDir = join(cwd, "dist", "configs");

  // Ensure the directory structure exists
  await fs.mkdir(outputDir, { recursive: true });

  const numPermutations = 1 << flags.length;

  for (let i = 0; i < numPermutations; i++) {
    const opts: Options = {};
    for (let bit = 0; bit < flags.length; bit++) {
      const isSet = (i & (1 << bit)) !== 0;
      opts[flags[bit]] = isSet;
    }

    const key = optionsToKey(opts);
    const hash = keyToHash(key);

    const config = await buildConfig(opts);
    const filePath = join(outputDir, `${hash}.json`);

    // Write the config file
    await fs.writeFile(filePath, JSON.stringify(config, null, 2), "utf8");
  }

  console.log(`Generated ${numPermutations} configs in ${outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

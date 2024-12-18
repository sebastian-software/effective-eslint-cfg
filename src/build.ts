import { buildConfig } from "./generator.js";
import { promises as fs } from "fs";
import { join } from "path";
import { flags, numberToShortHash, Options } from "./util.js";

async function main() {
  const outputDir = join(process.cwd(), "dist", "configs");
  await fs.mkdir(outputDir, { recursive: true });

  const numPermutations = 1 << flags.length;

  for (let i = 0; i < numPermutations; i++) {
    const opts: Options = {};
    for (let bit = 0; bit < flags.length; bit++) {
      opts[flags[bit]] = (i & (1 << bit)) !== 0;
    }

    const config = await buildConfig(opts);
    const hash = numberToShortHash(i);
    const filePath = join(outputDir, `${hash}.json`);

    await fs.writeFile(filePath, JSON.stringify(config, null, 2), "utf8");
  }

  console.log(`Generated ${numPermutations} configs in ${outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

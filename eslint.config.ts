import type { Linter } from "eslint";
import { getConfig } from "./dist";

const base = await getConfig({
  react: true,
  strict: true,
});

export default [
  { ignores: ["node_modules", "dist"] },
  { files: ["**/*.ts", "**/*.tsx"] },
  base,
  {
    rules: {
      "no-console": [0],
    },
  },
] satisfies Linter.Config[];

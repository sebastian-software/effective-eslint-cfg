import type { Linter } from "eslint";
import { getConfig } from "./dist";

const base = await getConfig({
  react: true,
  strict: true,
});

console.log("BASE:", base);

export default [
  base,
  {
    rules: {
      "no-console": [0],
    },
  },
] satisfies Linter.Config[];

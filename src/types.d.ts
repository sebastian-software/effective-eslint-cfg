declare module "eslint-config-prettier" {
  import { Linter } from "eslint"
  const config: {
    rules: Linter.Rules
  }
  export = config
}

declare module "eslint-plugin-react-hooks" {
  import { Linter } from "eslint"
  export const rules: Linter.Rules
}

declare module "eslint-plugin-react-compiler" {
  import { Linter } from "eslint"
  export const rules: Linter.Rules
}

declare module "eslint-plugin-check-file" {
  import { Linter } from "eslint"
  export const rules: Linter.Rules
}

declare module "eslint-plugin-jsx-a11y" {
  import type { ConfigWithExtends } from "typescript-eslint"

  export const rules: Linter.Rules
  export const flatConfigs: Record<string, ConfigWithExtends>
}

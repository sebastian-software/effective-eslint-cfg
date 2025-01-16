declare module "eslint-config-prettier" {
  const config: {
    rules: Linter.Rules
  }
  export = config
}

declare module "eslint-plugin-react-hooks" {
  export const rules: Linter.Rules
}

declare module "eslint-plugin-react-compiler" {
  export const rules: Linter.Rules
}

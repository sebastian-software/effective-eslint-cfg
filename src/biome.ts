import type { JsonMetadata, RulesMetadata, RuleSource } from "./biome-types"

const META_URL = "https://biomejs.dev/metadata/rules.json"

type RuleMeta = Record<string, JsonMetadata>

export type ReducedRuleMeta = Omit<
  JsonMetadata,
  "name" | "docs" | "version" | "link" | "sources"
> & { originalRule?: string; category: string }

interface FlattenOptions {
  includeInspired?: boolean
}

const supportedSource = new Map<string, string>()

supportedSource.set("eslint", "")
supportedSource.set("eslintReact", "react/")
supportedSource.set("eslintReactHooks", "react-hooks/")
supportedSource.set("eslintJsxA11y", "jsx-a11y/")
supportedSource.set("eslintTypeScript", "@typescript-eslint/")
supportedSource.set("eslintUnicorn", "unicorn/")
supportedSource.set("eslintImport", "import/")
supportedSource.set("eslintN", "n/")
supportedSource.set("eslintUnusedImports", "unused-imports/")
supportedSource.set("eslintStylistic", "@stylistic/")
supportedSource.set("eslintSonarJs", "sonarjs/")
supportedSource.set("eslintBarrelFiles", "no-barrel-files/")
supportedSource.set("eslintJest", "jest/")

type UnionKeys<T> = T extends T ? keyof T : never
type RuleSourceKeys = UnionKeys<RuleSource>

function flattenRules(
  input: Record<string, Record<string, RuleMeta>>,
  options: FlattenOptions
) {
  const flattened: Record<string, ReducedRuleMeta> = {}

  for (const [_fileType, categories] of Object.entries(input)) {
    for (const [category, rules] of Object.entries(categories)) {
      for (const [ruleName, ruleMeta] of Object.entries(rules)) {
        const { _name, _version, _docs, _link, sources, ...restMeta } = ruleMeta

        const ourMeta: ReducedRuleMeta = {
          category,
          originalRule: undefined,
          ...restMeta
        }

        if (!options.includeInspired && ruleMeta.sourceKind === "inspired") {
          continue
        }

        sources?.forEach((source) => {
          // Wir wissen: In jedem "source" Objekt existiert genau ein Key (z.B. "clippy")
          // und dessen Value ist vom Typ string.
          const entries = Object.entries(source) as [RuleSourceKeys, string][]

          entries.forEach(([key, value]) => {
            const pluginPrefix = supportedSource.get(key)
            if (pluginPrefix != null) {
              ourMeta.originalRule = pluginPrefix + value
            }
          })
        })

        if (ourMeta.originalRule) {
          flattened[ruleName] = ourMeta
        }
      }
    }
  }

  return flattened
}

export async function getBiomeRules() {
  const response = await fetch(META_URL)
  const json = (await response.json()) as RulesMetadata

  const lang = json.lints?.languages
  if (!lang) {
    throw new Error("Invalid metadata")
  }

  const rules = flattenRules(lang, { includeInspired: false })
  return rules
}

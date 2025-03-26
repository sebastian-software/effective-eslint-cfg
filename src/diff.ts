import { ESLint, Linter } from "eslint"

export function diffLintConfig(
  config: Linter.Config<Linter.RulesRecord>,
  otherConfig: Linter.Config<Linter.RulesRecord>
): Linter.Config {
  const diff: Linter.Config = {}

  // Compare rules
  if (config.rules || otherConfig.rules) {
    const allRules = new Set([
      ...Object.keys(config.rules || {}),
      ...Object.keys(otherConfig.rules || {})
    ])

    for (const rule of allRules) {
      const oldRule = config.rules?.[rule]
      const newRule = otherConfig.rules?.[rule]

      if (JSON.stringify(oldRule) !== JSON.stringify(newRule)) {
        if (!diff.rules) diff.rules = {}
        diff.rules[rule] = newRule
      }
    }
  }

  // Compare settings
  if (config.settings || otherConfig.settings) {
    const allSettings = new Set([
      ...Object.keys(config.settings || {}),
      ...Object.keys(otherConfig.settings || {})
    ])

    for (const setting of allSettings) {
      const oldSetting = config.settings?.[setting]
      const newSetting = otherConfig.settings?.[setting]

      if (JSON.stringify(oldSetting) !== JSON.stringify(newSetting)) {
        if (!diff.settings) diff.settings = {}
        diff.settings[setting] = newSetting
      }
    }
  }

  // Compare language options
  if (config.languageOptions || otherConfig.languageOptions) {
    const oldLang = config.languageOptions || {}
    const newLang = otherConfig.languageOptions || {}

    if (JSON.stringify(oldLang) !== JSON.stringify(newLang)) {
      diff.languageOptions = newLang
    }
  }

  // Compare linter options
  if (config.linterOptions || otherConfig.linterOptions) {
    const oldLinter = config.linterOptions || {}
    const newLinter = otherConfig.linterOptions || {}

    if (JSON.stringify(oldLinter) !== JSON.stringify(newLinter)) {
      diff.linterOptions = newLinter
    }
  }

  // Compare plugins - only include new or different plugins
  if (otherConfig.plugins) {
    const newPlugins: Record<string, ESLint.Plugin> = {}
    let hasNewPlugins = false

    for (const [name, plugin] of Object.entries(otherConfig.plugins)) {
      if (!config.plugins?.[name]) {
        newPlugins[name] = plugin
        hasNewPlugins = true
      }
    }

    if (hasNewPlugins) {
      diff.plugins = newPlugins
    }
  }

  return diff
}

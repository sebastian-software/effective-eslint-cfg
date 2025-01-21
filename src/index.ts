import { Linter } from "eslint"
import { resolve } from "path"

import { numberToShortHash, Options, optionsToNumber } from "./util.js"

/**
 * Loads an ESLint configuration based on the provided options.
 *
 * @param options - The configuration options
 * @returns The loaded ESLint configuration
 */
export async function getConfig(options: Options) {
  const num = optionsToNumber(options)
  const hash = numberToShortHash(num)

  const __dirname = import.meta.dirname

  // Make sure that we are in "dist" folder and not in "src".
  const configPath = resolve(__dirname, "..", "dist", "configs", `${hash}.js`)

  const module = (await import(configPath)) as { default: Linter.Config }
  return module.default
}

/**
 * Changes the severity of a specific ESLint rule in the configuration.
 *
 * @param config - The ESLint configuration
 * @param ruleName - The name of the rule to modify
 * @param severity - The new severity level
 * @throws When the config has no rules or the rule is not configured
 */
export function setRuleSeverity(
  config: Linter.Config,
  ruleName: string,
  severity: "error" | "warn" | "off"
) {
  if (!config.rules) {
    throw new Error("Config has no rules!")
  }

  const ruleConfig = config.rules[ruleName]
  if (ruleConfig == null) {
    throw new Error(`Rule ${ruleName} is not configured!`)
  }

  if (Array.isArray(ruleConfig)) {
    ruleConfig[0] = severity
  } else {
    config.rules[ruleName] = severity
  }
}

/**
 * Disables a specific ESLint rule in the configuration by removing it.
 *
 * @param config - The ESLint configuration
 * @param ruleName - The name of the rule to disable
 * @throws When the config has no rules or the rule is not configured
 */
export function disableRule(config: Linter.Config, ruleName: string) {
  if (!config.rules) {
    throw new Error("Config has no rules!")
  }

  const ruleConfig = config.rules[ruleName]
  if (ruleConfig == null) {
    throw new Error(`Rule ${ruleName} is not configured!`)
  }

  delete config.rules[ruleName]
}

/**
 * Adds a new ESLint rule to the configuration with specified severity and options.
 *
 * @param config - The ESLint configuration
 * @param ruleName - The name of the rule to add
 * @param severity - The severity level for the rule
 * @param options - Additional options for the rule configuration
 * @throws When the config has no rules or the rule is already configured
 */
export function addRule(
  config: Linter.Config,
  ruleName: string,
  severity: "warn" | "error",
  options?: unknown[]
) {
  if (!config.rules) {
    throw new Error("Config has no rules!")
  }

  const ruleConfig = config.rules[ruleName]
  if (ruleConfig == null) {
    throw new Error(`Rule ${ruleName} is already configured!`)
  }

  if (options) {
    config.rules[ruleName] = [severity, ...options]
  } else {
    config.rules[ruleName] = severity
  }
}

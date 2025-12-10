export type ConfigType = "theme" | "extension";
export type Framework = "react" | "vanilla";
export type Language = "ts" | "js";
export type Linter = "biome" | "eslint" | "none";

export interface Config {
  /**
   * JSON Schema URL for editor tooling. Ignored by the CLI.
   */
  $schema?: string;

  /**
   * App Version. Must be a semver string.
   * Pattern: ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$
   */
  version: string;

  /**
   * Extension/Theme name.
   */
  name: string;

  /**
   * Type of App.
   */
  type: ConfigType; // "theme" | "extension"

  /**
   * Relative path to the main entry file.
   */
  entry: string;

  /**
   * Build output directory. Default: "dist"
   */
  outDir?: string;

  /**
   * UI framework. Default: "vanilla"
   */
  framework?: Framework; // "react" | "vanilla"

  /**
   * Source language. Default: "ts"
   */
  language?: Language; // "ts" | "js"

  /**
   * Linter used in the project. Default: "biome"
   */
  linter?: Linter; // "eslint" | "biome" | "none"
}

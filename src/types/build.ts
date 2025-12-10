import type { Command } from "commander";

export type CLIOptions = {
  watch?: boolean;
  minify?: boolean;
  sourcemap?: boolean;
};
export type BuildAction = (options: CLIOptions, command: Command) => void;

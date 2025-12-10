import type { Command } from "commander";

export type BuildCLIOptions = {
  watch?: boolean;
  minify?: boolean;
  sourcemap?: boolean;
};
export type BuildAction = (options: BuildCLIOptions, command: Command) => void;

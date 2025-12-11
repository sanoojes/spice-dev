import type { Command } from "commander";

export type BuildOptions = {
  watch?: boolean;
  minify?: boolean;
  sourcemap?: boolean;
};
export type BuildAction = (options: BuildOptions, command: Command) => void;

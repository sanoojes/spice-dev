import type { Command } from "commander";
import type { PkgManager } from "@/utils/cliParser";
import type { Config, Linter } from "@/types/config";

export type InitOptions = {
  template?: string;
  eslint?: boolean;
  biome?: boolean;
  use?: PkgManager;
  skipInstall?: boolean;
};

export type InitAnswers = {
  projectName: string;
  projectDir: string;
  template: Config["type"];
  useTs: boolean;
  useReact: boolean;
  linter: Linter;
  skipInstall: boolean;
  pkgManager: PkgManager;
};

export type InitAction = (
  projectName: string | undefined,
  options: InitOptions,
  command: Command,
) => void | Promise<void>;

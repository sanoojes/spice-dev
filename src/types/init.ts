import type { Command } from "commander";
import type { PkgManager } from "@/helpers/init/parsePkgManager";
import type { Linter } from "@/types/config";

export type CLIOptions = {
  template?: string;
  eslint?: boolean;
  biome?: boolean;
  use?: PkgManager;
  skipInstall?: boolean;
};

export type InitAnswers = {
  projectName: string;
  projectDir: string;
  template: string;
  useTs: boolean;
  useReact: boolean;
  linter: Linter;
  skipInstall: boolean;
  pkgManager: PkgManager;
};

export type InitAction = (
  projectName: string | undefined,
  options: CLIOptions,
  command: Command,
) => void | Promise<void>;

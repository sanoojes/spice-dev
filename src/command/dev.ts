import type { CLIOptions } from "@/types/init";
import type { Command } from "commander";

type DevAction = (options: CLIOptions, command: Command) => void;

export const dev: DevAction = async (opts, cmd) => {};

import type { Command } from "commander";
import type { CLIOptions } from "@/types/init";

type DevAction = (options: CLIOptions, command: Command) => void;
export const dev: DevAction = async (opts, cmd) => {};

import type { Command } from "commander";
import type { InitOptions } from "@/types/init";

type DevAction = (options: InitOptions, command: Command) => void;
export const dev: DevAction = async (opts, cmd) => {};

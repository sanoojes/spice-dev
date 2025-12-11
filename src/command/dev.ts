import type { DevOptions } from "@/types/dev";
import type { Command } from "commander";

type DevAction = (options: DevOptions, command: Command) => void;
export const dev: DevAction = async (opts, cmd) => {};

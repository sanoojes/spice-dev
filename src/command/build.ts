import { getConfig } from "@/helpers/config";
import type { BuildAction } from "@/types/build";
import { resolve } from "node:path";

export const build: BuildAction = async (opts) => {
  const { watch, minify, sourcemap } = opts;
  const projectConfig = await getConfig();

  const entry = resolve(projectConfig.entry);
};

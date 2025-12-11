import {
  context,
  type BuildOptions as EsbuildOptions,
  build as esbuild,
  type Plugin,
} from "esbuild";
import * as pc from "picocolors";
import {
  COMMON_ESBUILD_OPTIONS,
  DEFAULT_ESBUILD_PLUGIN,
  DEFAULT_POSTCSS_PLUGIN,
} from "@/constants/build";
import { BANNER } from "@/constants/project";
import { buildLogger } from "@/helpers/esbuild/plugin/logger";
import { postcssPlugin } from "@/helpers/esbuild/plugin/postcss";
import type { BuildOptions } from "@/types/build";
import { getConfig } from "@/utils/config";

export const build = async (opts: BuildOptions) => {
  const { minify, watch, sourcemap } = opts;

  const config = await getConfig();

  const nameLabel = config.type ? ` ${config.type}` : "";
  console.log(
    `${pc.cyan(BANNER)} ${pc.green(`building${nameLabel} for production...`)}`,
  );

  const buildPlugins: Plugin[] = [
    buildLogger({ ...config, ...opts }),
    postcssPlugin({
      plugins: [...DEFAULT_POSTCSS_PLUGIN],
      minify,
      sourcemap: watch,
    }),
  ];

  const buildOptions: EsbuildOptions = {
    ...COMMON_ESBUILD_OPTIONS,
    minify,
    entryPoints: [config.entry],
    outdir: config.outDir ?? "./dist",
    sourcemap: watch || sourcemap ? "inline" : false,
    plugins: [...DEFAULT_ESBUILD_PLUGIN, ...buildPlugins],
  };

  if (watch) {
    const ctx = await context(buildOptions);
    await ctx.watch();
  } else {
    await esbuild(buildOptions);
  }
};

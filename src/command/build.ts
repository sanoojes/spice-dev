import { resolve } from "node:path";
import autoprefixer from "autoprefixer";
import {
  type BuildOptions,
  context,
  build as esbuild,
  type Plugin,
} from "esbuild";
import postcssNested from "postcss-nested";
import { externalGlobal } from "@/helpers/esbuild/plugins/externalGlobal";
import { buildLogger } from "@/helpers/esbuild/plugins/logger";
import { postcssPlugin } from "@/helpers/esbuild/plugins/postcss";
import type { BuildAction } from "@/types/build";
import { getConfig } from "@/utils/config";

export const build: BuildAction = async (opts) => {
  try {
    const { watch, minify, sourcemap } = opts;

    const config = await getConfig();
    const { entry, framework, outDir } = config;

    const entryPoints = [resolve(entry)];

    const plugins: Plugin[] = [
      buildLogger(config),
      postcssPlugin({
        plugins: [postcssNested, autoprefixer],
        sourcemap,
      }),
      externalGlobal(
        framework === "react"
          ? {
              react: "Spicetify.React",
              "react-dom": "Spicetify.ReactDOM",
              "react/jsx-runtime": "Spicetify.ReactJSX",
              "react-dom/client": "Spicetify.ReactDOM",
              "react-dom/server": "Spicetify.ReactDOMServer",
            }
          : {},
      ),
    ];

    const buildOptions: BuildOptions = {
      entryPoints,
      outdir: outDir ?? "./dist",
      minify: Boolean(minify),
      sourcemap,
      bundle: true,
      format: "esm",
      jsx: "transform",
      treeShaking: true,
      platform: "browser",
      legalComments: "external",
      external: ["react", "react-dom"],
      tsconfig: "tsconfig.json",
      plugins,
    };

    let ctx: Awaited<ReturnType<typeof context>> | null = null;

    if (watch) {
      ctx = await context(buildOptions);
      await ctx.watch();
    } else {
      await esbuild(buildOptions);
      return;
    }
  } catch (err) {
    console.error("Unexpected Error:", err);
    process.exitCode = 1;
  }
};

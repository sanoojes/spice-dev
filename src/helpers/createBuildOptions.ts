import { resolve } from "node:path";
import autoprefixer from "autoprefixer";
import type { BuildOptions, Plugin } from "esbuild";
import postcssNested from "postcss-nested";
import { copyFilesToSpotify } from "@/helpers/esbuild/plugins/copyFilesToSpotify";
import { externalGlobal } from "@/helpers/esbuild/plugins/externalGlobal";
import { createHmrClient } from "@/helpers/esbuild/plugins/hmrClient";
import { createHmrServer } from "@/helpers/esbuild/plugins/hmrServer";
import { logger } from "@/helpers/esbuild/plugins/logger";
import { postcssPlugin } from "@/helpers/esbuild/plugins/postcss";
import { getConfig } from "@/utils/config";
import { findAvailablePort } from "@/utils/port";

export const createBuildOptions = async (opts: {
  minify?: boolean;
  sourcemap?: boolean;
  hmr?: boolean;
  hmrPort?: number;
}): Promise<BuildOptions> => {
  const { minify, sourcemap, hmr, hmrPort = 5174 } = opts;
  const config = await getConfig();
  const { entry, framework, outDir } = config;

  const entryPoints = [resolve(entry)];

  let resolvedHmrPort = hmrPort;
  if (hmr) {
    try {
      resolvedHmrPort = await findAvailablePort(hmrPort);
      if (resolvedHmrPort !== hmrPort) {
        console.log(
          `Port ${hmrPort} is in use, using ${resolvedHmrPort} instead.`,
        );
      }
    } catch (e) {
      console.error("Failed to find available HMR port:", e);
      throw e;
    }
  }

  const plugins: Plugin[] = [
    logger(config),
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

  if (hmr) {
    plugins.push(copyFilesToSpotify(config));
    plugins.push(createHmrServer(resolvedHmrPort));
    plugins.push(createHmrClient(resolvedHmrPort));
  }

  const buildOptions: BuildOptions = {
    entryPoints,
    outfile: outDir ?? "@/helpers/dist",
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

  return buildOptions;
};
